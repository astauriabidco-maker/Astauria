import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Navigation from './pages/Navigation';
import Articles from './pages/Articles';
import Faq from './pages/Faq';
import Testimonials from './pages/Testimonials';
import CaseStudies from './pages/CaseStudies';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Media from './pages/Media';
import Pages from './pages/Pages';
import Seo from './pages/Seo';
import Deploy from './pages/Deploy';
import { ToastContainer } from './components/Toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/leads" element={<Leads />} />
                                    <Route path="/navigation" element={<Navigation />} />
                                    <Route path="/pages" element={<Pages />} />
                                    <Route path="/articles" element={<Articles />} />
                                    <Route path="/faq" element={<Faq />} />
                                    <Route path="/testimonials" element={<Testimonials />} />
                                    <Route path="/case-studies" element={<CaseStudies />} />
                                    <Route path="/projects" element={<Projects />} />
                                    <Route path="/media" element={<Media />} />
                                    <Route path="/seo" element={<Seo />} />
                                    <Route path="/deploy" element={<Deploy />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <ToastContainer />
        </>
    );
}
