import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/search';
import { 
  Logo, 
  CattleIcon, 
  VerifiedIcon, 
  SalesIcon, 
  LocationIcon, 
  QualityIcon, 
  SecurityIcon, 
  SupportIcon
} from '../components/ui';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleAdvancedSearch = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/cattle/Dashboard Cow.jpg"
            alt="Cattle grazing in African countryside"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a beautiful gradient if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.background = 'linear-gradient(135deg, #10b981, #059669, #047857)';
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-sky-900/30 to-violet-900/40"></div>
          <div className="absolute inset-0 bg-white/20"></div>
        </div>

        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-10 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-30' : 'translate-y-10 opacity-0'}`}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full animate-pulse border border-white/30"></div>
          </div>
          <div className={`absolute bottom-32 left-20 transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-25' : 'translate-y-10 opacity-0'}`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg rotate-45 animate-bounce border border-white/30"></div>
          </div>
          <div className={`absolute top-1/3 right-1/4 transition-all duration-2000 ${isVisible ? 'translate-y-0 opacity-20' : 'translate-y-10 opacity-0'}`}>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            
            {/* Main Heading with Logo */}
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                  <Logo size="xl" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl text-white mb-4 font-light drop-shadow-lg">
                Ghana's Premier Cattle Marketplace
              </p>
              <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                Connect with trusted sellers, find quality cattle, and grow your livestock business with confidence
              </p>
            </div>

            {/* Floating Search Bar */}
            <div className={`transition-all duration-1200 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  {/* Search Bar Container with Enhanced Styling */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-3 hover:shadow-3xl transition-all duration-300 hover:scale-105">
                    <SearchBar
                      onSearch={handleSearch}
                      placeholder="Search for cattle by breed, region, or keywords..."
                      className="border-0 bg-transparent shadow-none rounded-2xl"
                    />
                  </div>
                  
                  {/* Enhanced Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-white/40 via-emerald-400/30 to-sky-400/30 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={handleAdvancedSearch}
                  className="group relative px-10 py-4 bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg hover:bg-white/30"
                >
                  <span className="relative z-10 drop-shadow-md">Advanced Search</span>
                </button>
                
                <button 
                  onClick={() => navigate('/search')}
                  className="px-10 py-4 bg-emerald-600/90 backdrop-blur-md border border-emerald-500/50 text-white font-semibold rounded-2xl hover:bg-emerald-700/90 transition-all duration-300 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Browse All Cattle
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find cattle by breed or explore trending searches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'West African Shorthorn', 
                count: '850+ listings', 
                gradient: 'from-emerald-500 to-emerald-700',
                image: '/images/breeds/west-african-shorthorn.jpg'
              },
              { 
                name: 'Zebu Cattle', 
                count: '620+ listings', 
                gradient: 'from-sky-500 to-sky-700',
                image: '/images/breeds/zebu-cattle.jpg'
              },
              { 
                name: 'Sanga Breed', 
                count: '430+ listings', 
                gradient: 'from-violet-500 to-violet-700',
                image: '/images/breeds/sanga-breed.jpg'
              }
            ].map((category, index) => (
              <button
                key={category.name}
                onClick={() => navigate(`/search?breed=${encodeURIComponent(category.name)}`)}
                className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback to gradient background if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.style.background = `linear-gradient(135deg, var(--tw-gradient-stops))`;
                      target.parentElement!.className += ` bg-gradient-to-br ${category.gradient}`;
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-80`}></div>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <div className="mb-4">
                    <CattleIcon size={48} className="text-white/90" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
                  <p className="text-white/90 text-lg">{category.count}</p>
                </div>
                
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Listings', value: '2,500+', icon: CattleIcon, color: 'text-emerald-600' },
              { label: 'Verified Sellers', value: '850+', icon: VerifiedIcon, color: 'text-sky-600' },
              { label: 'Successful Sales', value: '5,200+', icon: SalesIcon, color: 'text-violet-600' },
              { label: 'Regions Covered', value: '10', icon: LocationIcon, color: 'text-orange-600' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`flex justify-center mb-4 ${stat.color}`}>
                    <IconComponent size={48} />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-lg">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose BeefLine?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive platform that ensures quality, security, and success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality Assured',
                description: 'All cattle are health-certified and verified by our expert team',
                icon: QualityIcon,
                color: 'text-emerald-600'
              },
              {
                title: 'Secure Transactions',
                description: 'Safe and secure payment processing with buyer protection',
                icon: SecurityIcon,
                color: 'text-sky-600'
              },
              {
                title: 'Expert Support',
                description: 'Get guidance from livestock experts throughout your journey',
                icon: SupportIcon,
                color: 'text-violet-600'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`mb-6 ${feature.color}`}>
                    <IconComponent size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-sky-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of farmers and traders who trust BeefLine for their cattle business needs
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg">
              Start Selling
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="px-10 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg"
            >
              Browse Cattle
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="lg" className="mb-4" />
              <p className="text-gray-400 text-lg">
                Ghana's trusted cattle marketplace connecting buyers and sellers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xl">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/search')} className="hover:text-white transition-colors text-lg">Browse Cattle</button></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Sell Cattle</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xl">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-lg">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Safety Tips</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xl">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2025 BeefLine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;