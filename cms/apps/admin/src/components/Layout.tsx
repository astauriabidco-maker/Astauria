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
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
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
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-navy-900 text-white flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-navy-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                            <span className="text-navy-900 font-bold text-lg">A</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-lg">Astauria</h1>
                            <p className="text-xs text-gray-400">CMS Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-navy-800 text-gold-500'
                                    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-navy-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
    );
}
