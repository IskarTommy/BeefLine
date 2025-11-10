import { useState } from 'react';
import { CheckCircleIcon, ClockIcon, DocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';
import type { User } from '../../types';
import { VerificationBadge } from './VerificationBadge';

interface VerificationPanelProps {
  user: User;
  onMessage: (message: { type: 'success' | 'error'; text: string }) => void;
}

export const VerificationPanel = ({ user, onMessage }: VerificationPanelProps) => {
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

  const handleVerificationRequest = async () => {
    setIsRequestingVerification(true);
    
    try {
      const response = await userAPI.requestVerification();
      if (response.success) {
        onMessage({ 
          type: 'success', 
          text: 'Verification request submitted successfully! We will review your account and contact you within 2-3 business days.' 
        });
      }
    } catch (error: any) {
      onMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit verification request. Please try again.' 
      });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const getVerificationSteps = () => {
    if (user.userType === 'seller') {
      return [
        {
          title: 'Complete Profile Information',
          description: 'Ensure all profile fields are filled out completely',
          completed: !!(user.firstName && user.lastName && user.phoneNumber && user.region),
          icon: DocumentCheckIcon
        },
        {
          title: 'Submit Verification Request',
          description: 'Request account verification from our team',
          completed: false, // This would come from backend verification status
          icon: ClockIcon
        },
        {
          title: 'Account Review',
          description: 'Our team will review your information and contact details',
          completed: false,
          icon: ShieldCheckIcon
        },
        {
          title: 'Verification Complete',
          description: 'Your account will be marked as verified',
          completed: user.isVerified,
          icon: CheckCircleIcon
        }
      ];
    } else {
      return [
        {
          title: 'Complete Profile Information',
          description: 'Ensure all profile fields are filled out completely',
          completed: !!(user.firstName && user.lastName && user.phoneNumber && user.region),
          icon: DocumentCheckIcon
        },
        {
          title: 'Account Verification (Optional)',
          description: 'Buyers can optionally verify their accounts for increased trust',
          completed: user.isVerified,
          icon: CheckCircleIcon
        }
      ];
    }
  };

  const verificationSteps = getVerificationSteps();
  const profileComplete = !!(user.firstName && user.lastName && user.phoneNumber && user.region);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account Verification</h3>
          <p className="text-sm text-gray-600 mt-1">
            {user.userType === 'seller' 
              ? 'Verified sellers build trust with buyers and get priority listing placement.'
              : 'Verification is optional for buyers but helps build trust in the marketplace.'
            }
          </p>
        </div>
        <VerificationBadge 
          isVerified={user.isVerified} 
          userType={user.userType}
          size="lg"
        />
      </div>

      {/* Verification Steps */}
      <div className="space-y-4 mb-6">
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.completed ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
              {step.completed && (
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Verification Benefits */}
      {user.userType === 'seller' && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-green-900 mb-2">Verification Benefits</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Priority placement in search results</li>
            <li>• Verification badge on all your cattle listings</li>
            <li>• Increased buyer trust and confidence</li>
            <li>• Access to premium seller features</li>
          </ul>
        </div>
      )}

      {/* Action Button */}
      {!user.isVerified && (
        <div className="flex justify-center">
          {profileComplete ? (
            <button
              onClick={handleVerificationRequest}
              disabled={isRequestingVerification}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isRequestingVerification ? 'Submitting Request...' : 'Request Verification'}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Complete your profile information to request verification
              </p>
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed font-medium"
              >
                Complete Profile First
              </button>
            </div>
          )}
        </div>
      )}

      {user.isVerified && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">Your account is verified!</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Thank you for completing the verification process.
          </p>
        </div>
      )}
    </div>
  );
};