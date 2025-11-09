import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Users, Bed, Bath, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Property, Comment, Rating } from '../../lib/supabase';

type PropertyDetailsProps = {
  propertyId: string;
  onNavigate: (page: string) => void;
};

export default function PropertyDetails({ propertyId, onNavigate }: PropertyDetailsProps) {
  const { user, profile, isAdmin } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [userRating, setUserRating] = useState<Rating | null>(null);

  useEffect(() => {
    loadPropertyDetails();
  }, [propertyId, user]);

  const loadPropertyDetails = async () => {
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*, owner:profiles(*)')
        .eq('id', propertyId)
        .maybeSingle();

      if (propertyError) throw propertyError;

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*, user:profiles(*)')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*, user:profiles(*)')
        .eq('property_id', propertyId);

      if (ratingsError) throw ratingsError;

      setProperty(propertyData);
      setComments(commentsData || []);
      setRatings(ratingsData || []);

      if (user) {
        const existingRating = ratingsData?.find((r: Rating) => r.user_id === user.id);
        setUserRating(existingRating || null);
        if (existingRating) {
          setNewRating(existingRating.rating);
        }
      }
    } catch (error) {
      console.error('Error loading property details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select('*, user:profiles(*)')
        .single();

      if (error) throw error;
      setComments([data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleAddOrUpdateRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (userRating) {
        const { data, error } = await supabase
          .from('ratings')
          .update({ rating: newRating })
          .eq('id', userRating.id)
          .select('*, user:profiles(*)')
          .single();

        if (error) throw error;
        setUserRating(data);
        setRatings(ratings.map(r => r.id === data.id ? data : r));
      } else {
        const { data, error } = await supabase
          .from('ratings')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            rating: newRating,
          })
          .select('*, user:profiles(*)')
          .single();

        if (error) throw error;
        setUserRating(data);
        setRatings([...ratings, data]);
      }
    } catch (error: any) {
      console.error('Error adding/updating rating:', error);
      alert(error.message || 'Failed to submit rating');
    }
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Property not found</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-600 hover:text-rose-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Listings
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-96">
          <img
            src={property.image_url || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg">
            <span className="text-2xl font-bold text-rose-600">${property.price_per_night}</span>
            <span className="text-gray-600">/night</span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            {averageRating > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">{ratings.length} reviews</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">{property.max_guests} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">{property.bedrooms} bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">{property.bathrooms} bathrooms</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About this place</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {property.owner && (
            <div className="mb-8 pb-8 border-b">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hosted by</h3>
              <p className="text-gray-700">{property.owner.full_name || property.owner.email}</p>
            </div>
          )}

          {user && (
            <div className="mb-8 pb-8 border-b">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rate this property</h3>
              <form onSubmit={handleAddOrUpdateRating} className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
                >
                  {userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </form>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Comments ({comments.length})
            </h3>

            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this property..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent mb-3"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {comment.user?.full_name || comment.user?.email || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {(user?.id === comment.user_id || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
