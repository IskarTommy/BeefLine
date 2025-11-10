import React from 'react';

interface FloatingElementsProps {
  isVisible: boolean;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ isVisible }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Cow Icon */}
      <div className={`absolute top-20 right-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-30' : 'translate-y-10 opacity-0'}`}>
        <svg className="w-24 h-24 text-green-300 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      {/* Floating Leaves */}
      <div className={`absolute top-32 left-20 transform transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-20' : 'translate-y-10 opacity-0'}`}>
        <svg className="w-16 h-16 text-green-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,15.5C2,15.5 2,16.5 3,16.5C4,16.5 4,16 4,15C4,13 5,12 6,12C7,12 8,13 8,14C8,15 7,16 6,16C5,16 5,15 5,15C5,15 5,14 6,14C7,14 7,15 7,15C7,16 6,17 5,17C4,17 3,16 3,15C3,14 4,13 5,13C6,13 7,14 7,15C7,16 6,17 5,17C4,17 3,16 3,15"/>
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      <div className={`absolute bottom-32 right-32 transform transition-all duration-2000 ${isVisible ? 'translate-y-0 opacity-15' : 'translate-y-10 opacity-0'}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full animate-spin-slow"></div>
      </div>

      {/* Additional floating elements */}
      <div className={`absolute top-1/2 left-10 transform transition-all duration-1800 ${isVisible ? 'translate-y-0 opacity-10' : 'translate-y-10 opacity-0'}`}>
        <svg className="w-12 h-12 text-purple-300 animate-float" style={{ animationDelay: '1s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>

      <div className={`absolute bottom-20 left-1/4 transform transition-all duration-2200 ${isVisible ? 'translate-y-0 opacity-20' : 'translate-y-10 opacity-0'}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`absolute top-40 right-1/3 transform transition-all duration-1600 ${isVisible ? 'translate-y-0 opacity-25' : 'translate-y-10 opacity-0'}`}>
        <svg className="w-10 h-10 text-blue-300 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    </div>
  );
};

export default FloatingElements;