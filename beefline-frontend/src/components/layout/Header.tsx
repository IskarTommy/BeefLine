import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { SearchBar } from '../search/SearchBar';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSearchBar(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-green-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/search"
              className="text-gray-600 hover:text-green-600 transition-colors font-medium"
            >
              Browse Cattle
            </Link>
            {user?.userType === 'seller' && (
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Search & User Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Toggle */}
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Search Bar (Expandable) */}
        {showSearchBar && (
          <div className="hidden md:block pb-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}
      </div>

      {/* Mobile Menu Slide-out */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 transition-opacity duration-300 z-50 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div
          className={`fixed right-0 top-0 h-full w-64 sm:w-80 bg-white shadow-lg transform transition-transform duration-300 overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold text-gray-900">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="touch-target px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/search"
              onClick={closeMobileMenu}
              className="touch-target px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
            >
              Browse Cattle
            </Link>
            {user?.userType === 'seller' && (
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="touch-target px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}

            <div className="border-t pt-2 mt-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="touch-target px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium block"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="touch-target w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="touch-target px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium block"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="touch-target px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium block text-center mt-2"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
