import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navigation from './pages/Navigation';
import Articles from './pages/Articles';
import Faq from './pages/Faq';
import Testimonials from './pages/Testimonials';
import CaseStudies from './pages/CaseStudies';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/navigation" element={<Navigation />} />
                                <Route path="/articles" element={<Articles />} />
                                <Route path="/faq" element={<Faq />} />
                                <Route path="/testimonials" element={<Testimonials />} />
                                <Route path="/case-studies" element={<CaseStudies />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
