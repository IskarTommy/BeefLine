import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import type { UserProfileFormData, PasswordChangeFormData } from '../../types';
import { VerificationBadge } from './VerificationBadge';
import { VerificationPanel } from './VerificationPanel';

interface UserProfileProps {
  className?: string;
}

export const UserProfile = ({ className = '' }: UserProfileProps) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const profileForm = useForm<UserProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      region: user?.region || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordChangeFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const regions = [
    'Ashanti',
    'Northern Savannah',
    'Greater Accra',
    'Western',
    'Central',
    'Eastern',
    'Volta',
    'Upper East',
    'Upper West',
    'Brong-Ahafo',
  ];

  const handleProfileUpdate = async (data: UserProfileFormData) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await userAPI.updateProfile(data);
      if (response.success) {
        updateUser(response.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        profileForm.reset(data);
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await userAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setIsChangingPassword(false);
        passwordForm.reset();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    profileForm.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      region: user?.region || '',
      email: user?.email || '',
    });
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    passwordForm.reset();
    setMessage(null);
  };



  if (!user) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Profile</h1>
              <p className="text-green-100 mt-1">
                Manage your account information and settings
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <VerificationBadge 
                isVerified={user.isVerified} 
                userType={user.userType}
                size="md"
              />
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium capitalize">
                {user.userType}
              </span>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-l-4 border-green-400 text-green-700' 
              : 'bg-red-50 border-l-4 border-red-400 text-red-700'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="p-6">
          {/* Profile Information Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      {...profileForm.register('firstName', { required: 'First name is required' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      {...profileForm.register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      {...profileForm.register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...profileForm.register('phoneNumber', { required: 'Phone number is required' })}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {profileForm.formState.errors.phoneNumber && (
                      <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <select
                      {...profileForm.register('region', { required: 'Region is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a region</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    {profileForm.formState.errors.region && (
                      <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.region.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                  <p className="text-gray-900 font-medium">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                  <p className="text-gray-900 font-medium">{user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  <p className="text-gray-900 font-medium">{user.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Region</label>
                  <p className="text-gray-900 font-medium">{user.region}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                  <p className="text-gray-900 font-medium capitalize">{user.userType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    {...passwordForm.register('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long'
                      }
                    })}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    {...passwordForm.register('confirmPassword', { required: 'Please confirm your new password' })}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-600">
                  Keep your account secure by using a strong password and changing it regularly.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Last password change: Not available
                </p>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="border-t pt-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                <p className="text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                <p className="text-gray-900 font-medium capitalize">{user.userType}</p>
              </div>
            </div>

            {/* Verification Panel */}
            <VerificationPanel 
              user={user} 
              onMessage={setMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
