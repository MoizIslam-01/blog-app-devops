import { MapPin, Users, Bed, Bath, Star } from 'lucide-react';
import { Property } from '../../lib/supabase';

type PropertyCardProps = {
  property: Property;
  averageRating?: number;
  onViewDetails: (propertyId: string) => void;
};

export default function PropertyCard({ property, averageRating, onViewDetails }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
      <div onClick={() => onViewDetails(property.id)} className="relative h-56 overflow-hidden">
        <img
          src={property.image_url || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-lg font-bold text-rose-600">${property.price_per_night}</span>
          <span className="text-sm text-gray-600">/night</span>
        </div>
        {averageRating !== undefined && averageRating > 0 && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div onClick={() => onViewDetails(property.id)} className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{property.max_guests} guests</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} baths</span>
          </div>
        </div>
      </div>
    </div>
  );
}
