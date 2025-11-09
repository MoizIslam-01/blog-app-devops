import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase, Property, Rating } from '../../lib/supabase';
import PropertyCard from './PropertyCard';

type PropertyListProps = {
  onViewDetails: (propertyId: string) => void;
};

export default function PropertyList({ onViewDetails }: PropertyListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*, owner:profiles(*)')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('property_id, rating');

      if (ratingsError) throw ratingsError;

      const avgRatings: Record<string, number> = {};
      ratingsData?.forEach((rating: Rating) => {
        if (!avgRatings[rating.property_id]) {
          avgRatings[rating.property_id] = 0;
        }
      });

      const ratingCounts: Record<string, number> = {};
      ratingsData?.forEach((rating: Rating) => {
        avgRatings[rating.property_id] += rating.rating;
        ratingCounts[rating.property_id] = (ratingCounts[rating.property_id] || 0) + 1;
      });

      Object.keys(avgRatings).forEach(propertyId => {
        avgRatings[propertyId] = avgRatings[propertyId] / ratingCounts[propertyId];
      });

      setRatings(avgRatings);
      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Your Perfect Stay</h1>
        <p className="text-gray-600">Explore unique properties around the world</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No properties found. Be the first to list one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              averageRating={ratings[property.id]}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
