import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components';
import { HomePage, CowDetailPage, SearchPage } from './pages';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cattle/:id" element={<CowDetailPage />} />
            {/* Additional routes will be added in future tasks */}
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export { App };
export default App;