import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CowDetail } from '../CowDetail';
import { Cattle } from '../../../types';

const mockCattle: Cattle = {
  id: '1',
  breed: 'West African Shorthorn',
  age: 24,
  weight: 350,
  price: 2500,
  healthNotes: 'Healthy cattle with regular checkups',
  vaccinationStatus: true,
  feedingHistory: 'Grass-fed with supplements',
  region: 'Greater Accra',
  images: [
    {
      id: '1',
      url: 'https://example.com/cattle1.jpg',
      caption: 'Front view',
      isPrimary: true,
    },
    {
      id: '2',
      url: 'https://example.com/cattle2.jpg',
      caption: 'Side view',
      isPrimary: false,
    },
  ],
  healthCertificates: [
    {
      id: '1',
      name: 'Vaccination Certificate',
      url: 'https://example.com/cert1.pdf',
      documentType: 'vaccination_record',
      uploadedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      name: 'Health Certificate',
      url: 'https://example.com/cert2.pdf',
      documentType: 'health_certificate',
      uploadedAt: new Date('2024-01-12'),
    },
  ],
  seller: {
    id: '1',
    email: 'seller@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+233201234567',
    region: 'Greater Accra',
    userType: 'seller',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  isActive: true,
};

const mockCattleMinimal: Cattle = {
  ...mockCattle,
  images: [],
  healthCertificates: [],
  healthNotes: '',
  feedingHistory: '',
  vaccinationStatus: false,
  seller: {
    ...mockCattle.seller,
    isVerified: false,
  },
};

describe('CowDetail', () => {
  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      render(<CowDetail cattle={mockCattle} loading={true} />);

      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Header Information', () => {
    it('should display cattle breed and price in header', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getAllByText('West African Shorthorn')).toHaveLength(2); // Header and info section
      expect(screen.getByText('GH₵2,500')).toBeInTheDocument();
    });

    it('should display status badges', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText('Vaccinated')).toBeInTheDocument();
      expect(screen.getByText('Verified Seller')).toBeInTheDocument();
    });

    it('should display listing date', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText(/Listed/)).toBeInTheDocument();
      expect(screen.getByText(/15 January 2024/)).toBeInTheDocument();
    });

    it('should not display badges when not applicable', () => {
      render(<CowDetail cattle={mockCattleMinimal} />);

      expect(screen.queryByText('Vaccinated')).not.toBeInTheDocument();
      expect(screen.queryByText('Verified Seller')).not.toBeInTheDocument();
    });
  });

  describe('Cattle Information Section', () => {
    it('should display basic cattle information', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getAllByText('West African Shorthorn')).toHaveLength(2); // Header and info section
      expect(screen.getByText('2 years')).toBeInTheDocument();
      expect(screen.getByText('350 kg')).toBeInTheDocument();
      expect(screen.getAllByText('Greater Accra')).toHaveLength(2); // Info section and seller section
    });

    it('should format age correctly for months only', () => {
      const youngCattle = { ...mockCattle, age: 8 };
      render(<CowDetail cattle={youngCattle} />);

      expect(screen.getByText('8 months')).toBeInTheDocument();
    });

    it('should format age correctly for years and months', () => {
      const cattleWithMonths = { ...mockCattle, age: 30 };
      render(<CowDetail cattle={cattleWithMonths} />);

      expect(screen.getByText('2 years 6 months')).toBeInTheDocument();
    });
  });

  describe('Health Information Section', () => {
    it('should display vaccination status as up to date', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText('Up to date')).toBeInTheDocument();
    });

    it('should display vaccination status as not vaccinated', () => {
      render(<CowDetail cattle={mockCattleMinimal} />);

      expect(screen.getByText('Not vaccinated')).toBeInTheDocument();
    });

    it('should display health notes when available', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText('Healthy cattle with regular checkups')).toBeInTheDocument();
    });

    it('should display feeding history when available', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText('Grass-fed with supplements')).toBeInTheDocument();
    });

    it('should not display health notes section when empty', () => {
      render(<CowDetail cattle={mockCattleMinimal} />);

      expect(screen.queryByText('Health Notes')).not.toBeInTheDocument();
    });
  });

  describe('Health Certificates Section', () => {
    it('should display health certificates when available', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText('Health Certificates')).toBeInTheDocument();
      expect(screen.getByText('Vaccination Certificate')).toBeInTheDocument();
      expect(screen.getByText('Health Certificate')).toBeInTheDocument();
    });

    it('should display certificate types and upload dates', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText(/VACCINATION RECORD/)).toBeInTheDocument();
      expect(screen.getByText(/HEALTH CERTIFICATE/)).toBeInTheDocument();
      expect(screen.getAllByText(/Uploaded/)).toHaveLength(2); // Two certificates
      expect(screen.getByText(/10 January 2024/)).toBeInTheDocument();
      expect(screen.getByText(/12 January 2024/)).toBeInTheDocument();
    });

    it('should provide download links for certificates', () => {
      render(<CowDetail cattle={mockCattle} />);

      const downloadLinks = screen.getAllByText('Download');
      expect(downloadLinks).toHaveLength(2);
      
      downloadLinks.forEach((link, index) => {
        expect(link.closest('a')).toHaveAttribute('href', mockCattle.healthCertificates[index].url);
        expect(link.closest('a')).toHaveAttribute('target', '_blank');
      });
    });

    it('should not display health certificates section when none available', () => {
      render(<CowDetail cattle={mockCattleMinimal} />);

      expect(screen.queryByText('Health Certificates')).not.toBeInTheDocument();
    });
  });

  describe('Seller Information Section', () => {
    it('should display seller information', () => {
      render(<CowDetail cattle={mockCattle} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getAllByText('Greater Accra')).toHaveLength(2); // Info section and seller section
      expect(screen.getByText('+233201234567')).toBeInTheDocument();
      expect(screen.getByText('seller@example.com')).toBeInTheDocument();
    });

    it('should display verified badge for verified sellers', () => {
      render(<CowDetail cattle={mockCattle} />);

      const sellerSection = screen.getByText('Seller Information').closest('div');
      expect(sellerSection).toHaveTextContent('Verified');
    });

    it('should not display verified badge for unverified sellers', () => {
      render(<CowDetail cattle={mockCattleMinimal} />);

      const sellerSection = screen.getByText('Seller Information').closest('div');
      expect(sellerSection).not.toHaveTextContent('Verified');
    });

    it('should provide clickable phone and email links', () => {
      render(<CowDetail cattle={mockCattle} />);

      const phoneLink = screen.getByText('+233201234567');
      const emailLink = screen.getByText('seller@example.com');

      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+233201234567');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:seller@example.com');
    });
  });

  describe('Contact Actions Section', () => {
    it('should provide call and email action buttons', () => {
      render(<CowDetail cattle={mockCattle} />);

      const callButton = screen.getByText('Call Now');
      const emailButton = screen.getByText('Send Email');

      expect(callButton.closest('a')).toHaveAttribute('href', 'tel:+233201234567');
      expect(emailButton.closest('a')).toHaveAttribute('href', expect.stringContaining('mailto:seller@example.com'));
    });

    it('should include cattle information in email subject and body', () => {
      render(<CowDetail cattle={mockCattle} />);

      const emailButton = screen.getByText('Send Email');
      const href = emailButton.closest('a')?.getAttribute('href');

      expect(href).toContain('subject=Interest in West African Shorthorn');
      expect(href).toContain('GH₵2,500');
      expect(href).toContain('Hi John');
    });
  });

  describe('Image Gallery Integration', () => {
    it('should display image gallery with cattle images', () => {
      render(<CowDetail cattle={mockCattle} />);

      // The ImageGallery component should be rendered
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });
});