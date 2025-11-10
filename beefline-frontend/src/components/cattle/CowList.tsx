import React from 'react';
import type { Cattle } from '../../types';
import { CowCard } from './CowCard';

interface CowListProps {
  cattle: Cattle[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit?: number;
    onPageChange: (page: number) => void;
  };
  onCattleClick?: (cattle: Cattle) => void;
}

export const CowList: React.FC<CowListProps> = React.memo(({ 
  cattle, 
  loading = false, 
  pagination,
  onCattleClick 
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cattle.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cattle found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn't find any cattle matching your search criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination ? (
            pagination.total > 0 ? (
              <>
                Showing {((pagination.currentPage - 1) * Math.min(cattle.length, pagination.limit || 12)) + 1} to{' '}
                {Math.min(((pagination.currentPage - 1) * (pagination.limit || 12)) + cattle.length, pagination.total)} of{' '}
                {pagination.total.toLocaleString()} cattle
              </>
            ) : (
              'No cattle found'
            )
          ) : (
            cattle.length > 0 ? `${cattle.length} cattle found` : 'No cattle found'
          )}
        </p>
      </div>

      {/* Cattle grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cattle.map((cow) => (
          <CowCard
            key={cow.id}
            cattle={cow}
            onClick={onCattleClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-8">
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="w-full sm:w-auto touch-target px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNumber;
              if (pagination.totalPages <= 5) {
                pageNumber = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNumber = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNumber = pagination.totalPages - 4 + i;
              } else {
                pageNumber = pagination.currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => pagination.onPageChange(pageNumber)}
                  className={`touch-target px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    pageNumber === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="w-full sm:w-auto touch-target px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
});