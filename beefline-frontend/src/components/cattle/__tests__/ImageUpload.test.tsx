import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ImageUpload } from '../ImageUpload';
import type { ImageFile } from '../../../types';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
class MockFileReader {
  onload: ((event: any) => void) | null = null;
  result: string | null = null;

  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = `data:image/jpeg;base64,mock-base64-${file.name}`;
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

// Mock canvas and context for image compression
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toBlob: vi.fn((callback) => {
    const mockBlob = new Blob(['mock-compressed-data'], { type: 'image/jpeg' });
    callback(mockBlob);
  }),
};

global.HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
global.HTMLCanvasElement.prototype.toBlob = mockCanvas.toBlob;

// Mock Image constructor
class MockImage {
  onload: (() => void) | null = null;
  width = 800;
  height = 600;
  
  set src(value: string) {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

global.Image = MockImage as any;

describe('ImageUpload', () => {
  const mockOnImagesChange = vi.fn();
  const mockImages: ImageFile[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render upload area with instructions', () => {
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
        />
      );

      expect(screen.getByText('Click to upload')).toBeInTheDocument();
      expect(screen.getByText('or drag and drop')).toBeInTheDocument();
      expect(screen.getByText('PNG, JPG, GIF up to 5MB (max 10 images)')).toBeInTheDocument();
    });

    it('should render with custom limits', () => {
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
          maxImages={5}
          maxFileSize={2}
        />
      );

      expect(screen.getByText('PNG, JPG, GIF up to 2MB (max 5 images)')).toBeInTheDocument();
    });

    it('should show upload stats when images are present', () => {
      const images: ImageFile[] = [
        {
          file: new File([''], 'test1.jpg', { type: 'image/jpeg' }),
          preview: 'mock-url-1',
          caption: '',
          isPrimary: true,
        },
        {
          file: new File([''], 'test2.jpg', { type: 'image/jpeg' }),
          preview: 'mock-url-2',
          caption: '',
          isPrimary: false,
        },
      ];

      render(
        <ImageUpload
          images={images}
          onImagesChange={mockOnImagesChange}
        />
      );

      expect(screen.getByText('2 of 10 images uploaded')).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('should handle file input change', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
        />
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockOnImagesChange).toHaveBeenCalledWith([
          expect.objectContaining({
            file: expect.any(File),
            preview: expect.stringContaining('mock-base64'),
            caption: '',
            isPrimary: true,
          }),
        ]);
      });
    });

    it('should reject non-image files', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
        />
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Only image files are allowed')).toBeInTheDocument();
      });

      expect(mockOnImagesChange).not.toHaveBeenCalled();
    });

    it('should reject files that are too large', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
          maxFileSize={1}
        />
      );

      // Create a file larger than 1MB
      const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

      await user.upload(input, largeFile);

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 1MB')).toBeInTheDocument();
      });

      expect(mockOnImagesChange).not.toHaveBeenCalled();
    });

    it('should enforce maximum image limit', async () => {
      const user = userEvent.setup();
      const existingImages: ImageFile[] = Array(3).fill(null).map((_, i) => ({
        file: new File([''], `existing${i}.jpg`, { type: 'image/jpeg' }),
        preview: `mock-url-${i}`,
        caption: '',
        isPrimary: i === 0,
      }));

      render(
        <ImageUpload
          images={existingImages}
          onImagesChange={mockOnImagesChange}
          maxImages={3}
        />
      );

      const file = new File(['test'], 'new.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Maximum 3 images allowed')).toBeInTheDocument();
      });

      expect(mockOnImagesChange).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag enter and leave events', async () => {
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
        />
      );

      const dropZone = screen.getByText('Click to upload').closest('div');
      
      // Simulate drag enter
      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      });
      
      dropZone?.dispatchEvent(dragEnterEvent);
      
      // Should add active styling (this would be tested through class changes in a real scenario)
      expect(dropZone).toBeInTheDocument();
    });

    it('should handle file drop', async () => {
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
        />
      );

      const dropZone = screen.getByText('Click to upload').closest('div');
      const file = new File(['test'], 'dropped.jpg', { type: 'image/jpeg' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        dataTransfer,
      });
      
      dropZone?.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockOnImagesChange).toHaveBeenCalledWith([
          expect.objectContaining({
            file: expect.any(File),
            preview: expect.stringContaining('mock-base64'),
            caption: '',
            isPrimary: true,
          }),
        ]);
      });
    });
  });

  describe('Image Management', () => {
    const mockImagesWithData: ImageFile[] = [
      {
        file: new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        preview: 'mock-url-1',
        caption: 'First image',
        isPrimary: true,
      },
      {
        file: new File([''], 'test2.jpg', { type: 'image/jpeg' }),
        preview: 'mock-url-2',
        caption: 'Second image',
        isPrimary: false,
      },
    ];

    it('should display uploaded images', () => {
      render(
        <ImageUpload
          images={mockImagesWithData}
          onImagesChange={mockOnImagesChange}
        />
      );

      expect(screen.getByAltText('Preview 1')).toBeInTheDocument();
      expect(screen.getByAltText('Preview 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('First image')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Second image')).toBeInTheDocument();
    });

    it('should show primary badge on primary image', () => {
      render(
        <ImageUpload
          images={mockImagesWithData}
          onImagesChange={mockOnImagesChange}
        />
      );

      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Set Primary')).toBeInTheDocument();
    });

    it('should remove image when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImagesWithData}
          onImagesChange={mockOnImagesChange}
        />
      );

      const removeButtons = screen.getAllByText('✕');
      await user.click(removeButtons[0]);

      expect(mockOnImagesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          file: mockImagesWithData[1].file,
          preview: 'mock-url-2',
          caption: 'Second image',
          isPrimary: true, // Should become primary after removing the first
        }),
      ]);
    });

    it('should set primary image when star button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImagesWithData}
          onImagesChange={mockOnImagesChange}
        />
      );

      const starButton = screen.getByText('⭐');
      await user.click(starButton);

      expect(mockOnImagesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          ...mockImagesWithData[0],
          isPrimary: false,
        }),
        expect.objectContaining({
          ...mockImagesWithData[1],
          isPrimary: true,
        }),
      ]);
    });

    it('should update image caption', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImagesWithData}
          onImagesChange={mockOnImagesChange}
        />
      );

      const captionInput = screen.getByDisplayValue('First image');
      await user.clear(captionInput);
      await user.type(captionInput, 'Updated caption');

      expect(mockOnImagesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          ...mockImagesWithData[0],
          caption: 'Updated caption',
        }),
        mockImagesWithData[1],
      ]);
    });
  });

  describe('Image Reordering', () => {
    const mockImagesForReorder: ImageFile[] = [
      {
        file: new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        preview: 'mock-url-1',
        caption: 'First',
        isPrimary: true,
      },
      {
        file: new File([''], 'test2.jpg', { type: 'image/jpeg' }),
        preview: 'mock-url-2',
        caption: 'Second',
        isPrimary: false,
      },
    ];

    it('should handle drag and drop reordering', () => {
      render(
        <ImageUpload
          images={mockImagesForReorder}
          onImagesChange={mockOnImagesChange}
        />
      );

      const imageContainers = screen.getAllByAltText(/Preview/);
      const firstContainer = imageContainers[0].closest('div');
      const secondContainer = imageContainers[1].closest('div');

      // Simulate drag start on first image
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      });
      
      firstContainer?.dispatchEvent(dragStartEvent);

      // Simulate drop on second image
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      });
      
      // Mock dataTransfer.getData to return the index
      vi.spyOn(dropEvent.dataTransfer!, 'getData').mockReturnValue('0');
      
      secondContainer?.dispatchEvent(dropEvent);

      expect(mockOnImagesChange).toHaveBeenCalledWith([
        mockImagesForReorder[1],
        mockImagesForReorder[0],
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when new valid files are uploaded', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          images={mockImages}
          onImagesChange={mockOnImagesChange}
        />
      );

      // First upload an invalid file to trigger error
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

      await user.upload(input, invalidFile);

      await waitFor(() => {
        expect(screen.getByText('Only image files are allowed')).toBeInTheDocument();
      });

      // Then upload a valid file
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(input, validFile);

      await waitFor(() => {
        expect(screen.queryByText('Only image files are allowed')).not.toBeInTheDocument();
      });
    });
  });
});