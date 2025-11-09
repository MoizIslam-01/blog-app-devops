import { useEffect, useState } from 'react';
import { supabase, Blog, Comment } from '../../lib/supabase';
import { X, Trash2, AlertTriangle } from 'lucide-react';

type AdminPanelProps = {
  onClose: () => void;
  onRefresh: () => void;
};

export const AdminPanel = ({ onClose, onRefresh }: AdminPanelProps) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'blogs' | 'comments'>('blogs');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: blogsData } = await supabase
        .from('blogs')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      setBlogs(blogsData || []);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      await fetchData();
      onRefresh();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'blogs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Blogs ({blogs.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          {activeTab === 'blogs' && (
            <div className="space-y-4">
              {blogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No blogs found</p>
              ) : (
                blogs.map((blog) => (
                  <div key={blog.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{blog.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{blog.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By: {blog.profiles?.username}</span>
                        <span>•</span>
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="ml-4 text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Delete blog"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments found</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{comment.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By: {comment.profiles?.username}</span>
                        <span>•</span>
                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-4 text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Delete comment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border-t border-yellow-100 px-6 py-4 flex items-start space-x-3 rounded-b-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Use admin privileges carefully. Deleting content is permanent and cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};
