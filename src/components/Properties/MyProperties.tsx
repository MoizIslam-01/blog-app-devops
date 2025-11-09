import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Property } from '../../lib/supabase';
import PropertyCard from './PropertyCard';

type MyPropertiesProps = {
  onNavigate: (page: string) => void;
  onViewDetails: (propertyId: string) => void;
};

export default function MyProperties({ onNavigate, onViewDetails }: MyPropertiesProps) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyProperties();
    }
  }, [user]);

  const loadMyProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Please sign in to view your properties</p>
        <button
          onClick={() => onNavigate('signin')}
          className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-600 hover:text-rose-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Listings
      </button>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <button
          onClick={() => onNavigate('add-property')}
          className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Add New Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg mb-4">You haven't listed any properties yet</p>
          <button
            onClick={() => onNavigate('add-property')}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          >
            List Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard
                property={property}
                onViewDetails={onViewDetails}
              />
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(property.id);
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="Delete property"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
