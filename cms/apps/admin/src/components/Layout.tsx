import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Menu,
    FileText,
    HelpCircle,
    MessageSquare,
    BarChart3,
    LogOut,
    Image,
    Settings,
    FileCode,
    Search,
    Rocket,
    Users,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { motion } from 'framer-motion';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads CRM' },
    { to: '/navigation', icon: Menu, label: 'Navigation' },
    { to: '/pages', icon: FileCode, label: 'Pages' },
    { to: '/articles', icon: FileText, label: 'Articles' },
    { to: '/faq', icon: HelpCircle, label: 'FAQ' },
    { to: '/testimonials', icon: MessageSquare, label: 'Témoignages' },
    { to: '/case-studies', icon: BarChart3, label: 'Cas d\'étude' },
    { to: '/media', icon: Image, label: 'Médiathèque' },
    { to: '/seo', icon: Search, label: 'SEO' },
    { to: '/deploy', icon: Rocket, label: 'Déploiement' },
    { to: '/settings', icon: Settings, label: 'Paramètres' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Background elements (already in index.css but added here for safety) */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-10">
                {/* Logo */}
                <div className="p-6 border-b border-navy-800/50">
                    <div className="flex flex-col gap-3">
                        <div className="bg-white/10 p-2 rounded-lg inline-block w-fit backdrop-blur-md border border-white/10 shadow-lg">
                            <img src="/logo-astauria.png" alt="Astauria Logo" className="h-6 w-auto" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-lg text-white">Astauria</h1>
                            <p className="text-xs text-gold-400">CMS Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-navy-800/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                            <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gold-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-auto relative z-10 text-gray-100 h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
