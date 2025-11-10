import { useState, useRef, useCallback } from 'react';
import type { DocumentFile } from '../../types';

interface DocumentUploadProps {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  maxDocuments?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

export const DocumentUpload = ({ 
  documents, 
  onDocumentsChange, 
  maxDocuments = 5,
  maxFileSize = 10,
  className = ''
}: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and image files (JPEG, PNG, GIF) are allowed';
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const processFiles = useCallback(async (files: FileList) => {
    setError(null);

    if (documents.length + files.length > maxDocuments) {
      setError(`Maximum ${maxDocuments} documents allowed`);
      return;
    }

    const newDocuments: DocumentFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      const documentFile: DocumentFile = {
        file,
        name: file.name,
        documentType: 'health_certificate' // Default type
      };

      newDocuments.push(documentFile);
    }

    if (newDocuments.length > 0) {
      onDocumentsChange([...documents, ...newDocuments]);
    }
  }, [documents, onDocumentsChange, maxDocuments, maxFileSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
  };

  const updateDocumentType = (index: number, documentType: 'health_certificate' | 'vaccination_record') => {
    const newDocuments = documents.map((doc, i) => 
      i === index ? { ...doc, documentType } : doc
    );
    onDocumentsChange(newDocuments);
  };

  const updateDocumentName = (index: number, name: string) => {
    const newDocuments = documents.map((doc, i) => 
      i === index ? { ...doc, name } : doc
    );
    onDocumentsChange(newDocuments);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return (
        <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (file.type.startsWith('image/')) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-5c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload documents
            </span>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            PDF, JPEG, PNG, GIF up to {maxFileSize}MB (max {maxDocuments} documents)
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Documents</h4>
          {documents.map((document, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3 flex-1">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(document.file)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={document.name}
                    onChange={(e) => updateDocumentName(index, e.target.value)}
                    className="block w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    placeholder="Document name"
                  />
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.file.size)}
                    </p>
                    <select
                      value={document.documentType}
                      onChange={(e) => updateDocumentType(index, e.target.value as 'health_certificate' | 'vaccination_record')}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="health_certificate">Health Certificate</option>
                      <option value="vaccination_record">Vaccination Record</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {/* Preview Button for Images */}
                {document.file.type.startsWith('image/') && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = URL.createObjectURL(document.file);
                      window.open(url, '_blank');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Preview
                  </button>
                )}
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Remove document"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Stats */}
      {documents.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {documents.length} of {maxDocuments} documents uploaded
        </div>
      )}
    </div>
  );
};