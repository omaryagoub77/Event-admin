import { HashRouter as Router, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import HeroSection from './pages/admin/HeroSection';
import Facilities from './pages/admin/Facilities';
import Gallery from './pages/admin/Gallery';
import Packages from './pages/admin/Packages';
import Bookings from './pages/admin/Bookings';
import Policies from './pages/admin/Policies';
import Testimonials from './pages/admin/Testimonials';
import ContactInfo from './pages/admin/ContactInfo';
import Faqs from './pages/admin/Faqs';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="hero" element={<HeroSection />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="packages" element={<Packages />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="policies" element={<Policies />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="contact" element={<ContactInfo />} />
            <Route path="faqs" element={<Faqs />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;