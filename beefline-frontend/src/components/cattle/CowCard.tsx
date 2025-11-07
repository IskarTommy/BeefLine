import React from 'react';
import type { Cattle } from '../../types';

interface CowCardProps {
  cattle: Cattle;
  onClick?: (cattle: Cattle) => void;
}

export const CowCard: React.FC<CowCardProps> = ({ cattle, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(cattle);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatAge = (ageInMonths: number) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return months > 0 ? `${years}y ${months}m` : `${years} years`;
  };

  const primaryImage = cattle.images.find(img => img.isPrimary) || cattle.images[0];
  const placeholderImage = '/api/placeholder/300/200';

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200 hover:shadow-lg hover:scale-105"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={primaryImage?.url || placeholderImage}
          alt={`${cattle.breed} cattle`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
        {cattle.vaccinationStatus && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Vaccinated
          </div>
        )}
        {cattle.seller.isVerified && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Verified Seller
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header with breed and price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {cattle.breed}
          </h3>
          <span className="text-xl font-bold text-green-600 ml-2">
            {formatPrice(cattle.price)}
          </span>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <span className="font-medium">Age:</span>
            <span className="ml-1">{formatAge(cattle.age)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Weight:</span>
            <span className="ml-1">{cattle.weight} kg</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{cattle.region}</span>
        </div>

        {/* Seller info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Seller:</span>
            <span className="ml-1">{cattle.seller.firstName} {cattle.seller.lastName}</span>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(cattle.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};