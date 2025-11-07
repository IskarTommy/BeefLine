import React from 'react';
import { Cattle, Document } from '../../types';
import { ImageGallery } from './ImageGallery';

interface CowDetailProps {
  cattle: Cattle;
  loading?: boolean;
}

export const CowDetail: React.FC<CowDetailProps> = ({ cattle, loading = false }) => {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    return months > 0 ? `${years} years ${months} months` : `${years} years`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
            {cattle.breed}
          </h1>
          <div className="text-3xl font-bold text-green-600">
            {formatPrice(cattle.price)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {cattle.vaccinationStatus && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Vaccinated
            </span>
          )}
          {cattle.seller.isVerified && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Verified Seller
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Listed {formatDate(cattle.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <ImageGallery 
            images={cattle.images} 
            altText={`${cattle.breed} cattle`}
          />
        </div>

        {/* Cattle Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cattle Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Breed</label>
                <p className="mt-1 text-lg text-gray-900">{cattle.breed}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Age</label>
                <p className="mt-1 text-lg text-gray-900">{formatAge(cattle.age)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Weight</label>
                <p className="mt-1 text-lg text-gray-900">{cattle.weight} kg</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Location</label>
                <p className="mt-1 text-lg text-gray-900">{cattle.region}</p>
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Vaccination Status</label>
                <p className="mt-1 text-lg text-gray-900">
                  {cattle.vaccinationStatus ? (
                    <span className="text-green-600 font-medium">Up to date</span>
                  ) : (
                    <span className="text-red-600 font-medium">Not vaccinated</span>
                  )}
                </p>
              </div>
              
              {cattle.healthNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Health Notes</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{cattle.healthNotes}</p>
                </div>
              )}
              
              {cattle.feedingHistory && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Feeding History</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{cattle.feedingHistory}</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Certificates */}
          {cattle.healthCertificates && cattle.healthCertificates.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Certificates</h2>
              <div className="space-y-3">
                {cattle.healthCertificates.map((doc: Document) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.documentType.replace('_', ' ').toUpperCase()} • 
                          Uploaded {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {cattle.seller.firstName} {cattle.seller.lastName}
                    {cattle.seller.isVerified && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{cattle.seller.region}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <a 
                    href={`tel:${cattle.seller.phoneNumber}`}
                    className="mt-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {cattle.seller.phoneNumber}
                  </a>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <a 
                    href={`mailto:${cattle.seller.email}`}
                    className="mt-1 text-blue-600 hover:text-blue-800 font-medium break-all"
                  >
                    {cattle.seller.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Seller</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${cattle.seller.phoneNumber}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Now
              </a>
              <a
                href={`mailto:${cattle.seller.email}?subject=Interest in ${cattle.breed} - ${cattle.id}&body=Hi ${cattle.seller.firstName}, I'm interested in your ${cattle.breed} listed for ${formatPrice(cattle.price)}. Please let me know if it's still available.`}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};