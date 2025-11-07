import { type ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">Beefline</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-green-600 transition-colors">
                Home
              </a>
              <a href="/cattle" className="text-gray-600 hover:text-green-600 transition-colors">
                Browse Cattle
              </a>
              <a href="/login" className="text-gray-600 hover:text-green-600 transition-colors">
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>&copy; 2025 Beefline. All rights reserved.</p>
            <p className="text-gray-400 mt-2">
              Connecting Ghana's cattle market with transparency and trust.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;