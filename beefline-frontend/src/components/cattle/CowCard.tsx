import React from 'react';
import type { Cattle } from '../../types';
import { VerificationBadge } from '../user/VerificationBadge';
import { OptimizedImage } from '../ui/OptimizedImage';

interface CowCardProps {
  cattle: Cattle;
  onClick?: (cattle: Cattle) => void;
}

export const CowCard: React.FC<CowCardProps> = React.memo(({ cattle, onClick }) => {
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
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200 hover:shadow-lg hover:scale-105 touch-target"
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
      <div className="relative h-48 sm:h-56 md:h-48 bg-gray-200">
        <OptimizedImage
          src={primaryImage?.url || placeholderImage}
          alt={`${cattle.breed} cattle`}
          className="w-full h-full object-cover"
        />
        {cattle.vaccinationStatus && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-md">
            Vaccinated
          </div>
        )}
        {cattle.seller.isVerified && (
          <div className="absolute top-2 left-2 shadow-md">
            <VerificationBadge 
              isVerified={cattle.seller.isVerified} 
              userType={cattle.seller.userType}
              size="sm"
              showText={false}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5">
        {/* Header with breed and price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
            {cattle.breed}
          </h3>
          <span className="text-lg sm:text-xl font-bold text-green-600 flex-shrink-0">
            {formatPrice(cattle.price)}
          </span>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <span className="font-medium">Age:</span>
            <span className="ml-1 truncate">{formatAge(cattle.age)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Weight:</span>
            <span className="ml-1">{cattle.weight} kg</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{cattle.region}</span>
        </div>

        {/* Seller info */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 truncate flex-1 mr-2">
            <span className="font-medium">Seller:</span>
            <span className="ml-1">{cattle.seller.firstName} {cattle.seller.lastName}</span>
          </div>
          <div className="text-xs text-gray-400 flex-shrink-0">
            {new Date(cattle.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
});