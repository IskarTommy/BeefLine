import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Cattle, CattleFormData, ImageFile, DocumentFile } from '../../types';
import { cattleAPI, userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CowForm } from './CowForm';

interface SellerDashboardProps {
  className?: string;
}

export const SellerDashboard = ({ className = '' }: SellerDashboardProps) => {
  const { user } = useAuth();
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCattle();
  }, [user]);

  const loadCattle = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userAPI.getUserCattle(user.id);
      if (response.success) {
        setCattle(response.data);
      } else {
        setError('Failed to load cattle listings');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load cattle listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCattle = async (
    data: CattleFormData, 
    images: ImageFile[], 
    documents: DocumentFile[]
  ) => {
    setIsSubmitting(true);
    try {
      // Create cattle record
      const cattleData = {
        ...data,
        images: [],
        healthCertificates: []
      };
      
      const response = await cattleAPI.createCattle(cattleData);
      
      if (response.success) {
        // Upload images if any
        if (images.length > 0) {
          const formData = new FormData();
          images.forEach((image, index) => {
            formData.append('images', image.file);
            formData.append(`captions[${index}]`, image.caption || '');
            formData.append(`isPrimary[${index}]`, image.isPrimary.toString());
          });
          
          await cattleAPI.uploadCattleImages(response.data.id, formData);
        }
        
        // Reload cattle list
        await loadCattle();
        setShowAddForm(false);
      } else {
        throw new Error(response.message || 'Failed to create cattle listing');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create cattle listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCattle = async (
    data: CattleFormData, 
    images: ImageFile[], 
    documents: DocumentFile[]
  ) => {
    if (!editingCattle) return;
    
    setIsSubmitting(true);
    try {
      const response = await cattleAPI.updateCattle(editingCattle.id, data);
      
      if (response.success) {
        // Upload new images if any
        if (images.length > 0) {
          const formData = new FormData();
          images.forEach((image, index) => {
            formData.append('images', image.file);
            formData.append(`captions[${index}]`, image.caption || '');
            formData.append(`isPrimary[${index}]`, image.isPrimary.toString());
          });
          
          await cattleAPI.uploadCattleImages(editingCattle.id, formData);
        }
        
        // Reload cattle list
        await loadCattle();
        setEditingCattle(null);
      } else {
        throw new Error(response.message || 'Failed to update cattle listing');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update cattle listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCattle = async (cattleId: string) => {
    if (!confirm('Are you sure you want to delete this cattle listing?')) {
      return;
    }
    
    try {
      const response = await cattleAPI.deleteCattle(cattleId);
      if (response.success) {
        setCattle(prev => prev.filter(c => c.id !== cattleId));
      } else {
        setError('Failed to delete cattle listing');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete cattle listing');
    }
  };

  const handleToggleStatus = async (cattleId: string, isActive: boolean) => {
    try {
      const response = await cattleAPI.updateCattle(cattleId, { isActive });
      if (response.success) {
        setCattle(prev => prev.map(c => 
          c.id === cattleId ? { ...c, isActive } : c
        ));
      } else {
        setError('Failed to update cattle status');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update cattle status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || user.userType !== 'seller') {
    return (
      <div className={`p-6 text-center ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only sellers can access this dashboard.</p>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className={className}>
        <CowForm
          onSubmit={handleAddCattle}
          onCancel={() => setShowAddForm(false)}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  if (editingCattle) {
    return (
      <div className={className}>
        <CowForm
          cattle={editingCattle}
          onSubmit={handleEditCattle}
          onCancel={() => setEditingCattle(null)}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your cattle listings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto touch-target px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          Add New Cattle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Listings</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{cattle.length}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Active Listings</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
            {cattle.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Inactive Listings</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-400 mt-2">
            {cattle.filter(c => !c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md col-span-2 lg:col-span-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Value</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {formatPrice(cattle.reduce((sum, c) => sum + c.price, 0))}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading your cattle listings...</p>
        </div>
      ) : cattle.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cattle listings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first cattle listing.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Cattle
            </button>
          </div>
        </div>
      ) : (
        /* Cattle List */
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cattle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cattle.map((cow) => (
                  <tr key={cow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {cow.images.length > 0 ? (
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={cow.images.find(img => img.isPrimary)?.url || cow.images[0].url}
                              alt={`${cow.breed} cattle`}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cow.breed}</div>
                          <div className="text-sm text-gray-500">{cow.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cow.age} months • {cow.weight} kg
                      </div>
                      <div className="text-sm text-gray-500">
                        {cow.vaccinationStatus ? '✓ Vaccinated' : '✗ Not vaccinated'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(cow.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(cow.id, !cow.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cow.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {cow.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(cow.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <Link
                          to={`/cattle/${cow.id}`}
                          className="touch-target text-green-600 hover:text-green-900 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setEditingCattle(cow)}
                          className="touch-target text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCattle(cow.id)}
                          className="touch-target text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};