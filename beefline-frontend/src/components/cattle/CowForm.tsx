import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Cattle, CattleFormData, ImageFile, DocumentFile } from '../../types';
import { ImageUpload } from './ImageUpload';
import { DocumentUpload } from './DocumentUpload';

interface CowFormProps {
  cattle?: Cattle;
  onSubmit: (data: CattleFormData, images: ImageFile[], documents: DocumentFile[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BREED_OPTIONS = [
  'West African Shorthorn',
  'Zebu', 
  'Sanga'
] as const;

const REGION_OPTIONS = [
  'Ashanti',
  'Northern Savannah',
  'Greater Accra',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Upper East',
  'Upper West',
  'Brong-Ahafo'
];

export const CowForm = ({ cattle, onSubmit, onCancel, isLoading = false }: CowFormProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CattleFormData>({
    defaultValues: {
      breed: 'West African Shorthorn',
      age: 12,
      weight: 200,
      price: 1000,
      healthNotes: '',
      vaccinationStatus: false,
      feedingHistory: '',
      region: 'Ashanti',
      isActive: true
    }
  });

  // Populate form when editing existing cattle
  useEffect(() => {
    if (cattle) {
      setValue('breed', cattle.breed);
      setValue('age', cattle.age);
      setValue('weight', cattle.weight);
      setValue('price', cattle.price);
      setValue('healthNotes', cattle.healthNotes);
      setValue('vaccinationStatus', cattle.vaccinationStatus);
      setValue('feedingHistory', cattle.feedingHistory);
      setValue('region', cattle.region);
      setValue('isActive', cattle.isActive);
    }
  }, [cattle, setValue]);









  const onFormSubmit = async (data: CattleFormData) => {
    setSubmitError(null);
    try {
      // Convert string values to numbers for numeric fields
      const processedData: CattleFormData = {
        ...data,
        age: Number(data.age),
        weight: Number(data.weight),
        price: Number(data.price)
      };
      await onSubmit(processedData, images, documents);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save cattle information');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {cattle ? 'Edit Cattle' : 'Add New Cattle'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {cattle ? 'Update your cattle information' : 'Provide detailed information about your cattle'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
              Breed *
            </label>
            <select
              id="breed"
              {...register('breed', { required: 'Breed is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {BREED_OPTIONS.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
            {errors.breed && (
              <p className="mt-1 text-sm text-red-600">{errors.breed.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <select
              id="region"
              {...register('region', { required: 'Region is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {REGION_OPTIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {errors.region && (
              <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>
            )}
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age (months) *
            </label>
            <input
              type="number"
              id="age"
              min="1"
              max="300"
              {...register('age', { 
                required: 'Age is required',
                min: { value: 1, message: 'Age must be at least 1 month' },
                max: { value: 300, message: 'Age must be less than 300 months' },
                valueAsNumber: true
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              id="weight"
              min="50"
              max="1000"
              {...register('weight', { 
                required: 'Weight is required',
                min: { value: 50, message: 'Weight must be at least 50 kg' },
                max: { value: 1000, message: 'Weight must be less than 1000 kg' },
                valueAsNumber: true
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (GHS) *
            </label>
            <input
              type="number"
              id="price"
              min="100"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 100, message: 'Price must be at least 100 GHS' },
                valueAsNumber: true
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Health Information */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vaccinationStatus"
              {...register('vaccinationStatus')}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="vaccinationStatus" className="ml-2 block text-sm text-gray-700">
              Vaccination up to date
            </label>
          </div>

          <div>
            <label htmlFor="healthNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Health Notes
            </label>
            <textarea
              id="healthNotes"
              rows={3}
              {...register('healthNotes')}
              placeholder="Any health conditions, treatments, or observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="feedingHistory" className="block text-sm font-medium text-gray-700 mb-2">
              Feeding History
            </label>
            <textarea
              id="feedingHistory"
              rows={3}
              {...register('feedingHistory')}
              placeholder="Diet, supplements, grazing information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Images</h3>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
            maxFileSize={5}
          />
        </div>

        {/* Document Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Health Certificates</h3>
          <DocumentUpload
            documents={documents}
            onDocumentsChange={setDocuments}
            maxDocuments={5}
            maxFileSize={10}
          />
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active listing (visible to buyers)
          </label>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto touch-target px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto touch-target px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting || isLoading ? 'Saving...' : cattle ? 'Update Cattle' : 'Add Cattle'}
          </button>
        </div>
      </form>
    </div>
  );
};