import { useEffect, useState } from 'react';
import { supabase, Blog, Comment, Rating } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, User, Star, Loader, Trash2 } from 'lucide-react';

type BlogDetailProps = {
  blogId: string;
  onClose: () => void;
  onRefresh: () => void;
};

export const BlogDetail = ({ blogId, onClose, onRefresh }: BlogDetailProps) => {
  const { user, profile } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogDetails();
  }, [blogId]);

  const fetchBlogDetails = async () => {
    try {
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*, profiles(*)')
        .eq('id', blogId)
        .maybeSingle();

      if (blogError) throw blogError;
      setBlog(blogData);

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('blog_id', blogId);

      if (ratingsError) throw ratingsError;
      setRatings(ratingsData || []);

      if (user) {
        const myRating = ratingsData?.find((r) => r.user_id === user.id);
        setUserRating(myRating?.rating || 0);
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert(
          {
            blog_id: blogId,
            user_id: user.id,
            rating,
          },
          { onConflict: 'blog_id,user_id' }
        );

      if (error) throw error;
      setUserRating(rating);
      fetchBlogDetails();
    } catch (error) {
      console.error('Error rating blog:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            blog_id: blogId,
            user_id: user.id,
            content: newComment,
          },
        ]);

      if (error) throw error;
      setNewComment('');
      fetchBlogDetails();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      fetchBlogDetails();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteBlog = async () => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const isAuthor = user && blog && blog.author_id === user.id;
  const isAdmin = profile?.is_admin;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{blog.title}</h2>
            {(isAuthor || isAdmin) && (
              <button
                onClick={handleDeleteBlog}
                className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                title="Delete blog"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {blog.image_url && (
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{blog.profiles?.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium text-gray-900">
                {averageRating.toFixed(1)} ({ratings.length})
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{blog.content}</p>
          </div>

          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate this post</h3>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= userRating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="text-sm text-gray-600 ml-2">Your rating: {userRating}</span>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Comments ({comments.length})
            </h3>

            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{comment.profiles?.username}</span>
                      <span>•</span>
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    {(user?.id === comment.user_id || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
