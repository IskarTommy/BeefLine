import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface VerificationBadgeProps {
  isVerified: boolean;
  userType: 'seller' | 'buyer';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const VerificationBadge = ({ 
  isVerified, 
  userType, 
  size = 'md', 
  showText = true,
  className = '' 
}: VerificationBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (isVerified) {
    return (
      <span className={`inline-flex items-center space-x-1 ${sizeClasses[size]} bg-green-100 text-green-800 rounded-full font-medium ${className}`}>
        <CheckCircleIcon className={`${iconSizes[size]} text-green-600`} />
        {showText && <span>Verified {userType === 'seller' ? 'Seller' : 'Buyer'}</span>}
      </span>
    );
  }

  // Show different states for unverified users
  if (userType === 'seller') {
    return (
      <span className={`inline-flex items-center space-x-1 ${sizeClasses[size]} bg-yellow-100 text-yellow-800 rounded-full font-medium ${className}`}>
        <ClockIcon className={`${iconSizes[size]} text-yellow-600`} />
        {showText && <span>Pending Verification</span>}
      </span>
    );
  }

  // For buyers, verification is less critical
  return (
    <span className={`inline-flex items-center space-x-1 ${sizeClasses[size]} bg-gray-100 text-gray-600 rounded-full font-medium ${className}`}>
      <ExclamationTriangleIcon className={`${iconSizes[size]} text-gray-500`} />
      {showText && <span>Unverified</span>}
    </span>
  );
};