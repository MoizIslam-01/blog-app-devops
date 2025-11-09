import { useEffect, useState } from 'react';
import { supabase, Blog } from '../../lib/supabase';
import { Calendar, User, Star } from 'lucide-react';

type BlogListProps = {
  onBlogClick: (blogId: string) => void;
};

export const BlogList = ({ onBlogClick }: BlogListProps) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);

      if (data) {
        const blogIds = data.map((blog) => blog.id);
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('blog_id, rating')
          .in('blog_id', blogIds);

        if (ratingsData) {
          const avgRatings: Record<string, number> = {};
          blogIds.forEach((id) => {
            const blogRatings = ratingsData.filter((r) => r.blog_id === id);
            if (blogRatings.length > 0) {
              const avg = blogRatings.reduce((sum, r) => sum + r.rating, 0) / blogRatings.length;
              avgRatings[id] = Math.round(avg * 10) / 10;
            }
          });
          setRatings(avgRatings);
        }
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No blog posts yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <article
          key={blog.id}
          onClick={() => onBlogClick(blog.id)}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
        >
          {blog.image_url && (
            <div className="h-48 overflow-hidden">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {blog.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {blog.content}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
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
              {ratings[blog.id] && (
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{ratings[blog.id]}</span>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
