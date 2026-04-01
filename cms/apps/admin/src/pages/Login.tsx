import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.access_token, data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="mb-6 flex justify-center bg-white/5 border border-white/10 p-3 rounded-xl inline-block mx-auto backdrop-blur-md">
                        <img src="/logo-astauria.png" alt="Astauria Logo" className="h-12 w-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-white text-glow mb-1">Astauria CMS</h1>
                    <p className="text-gold-400">Connectez-vous pour gérer le contenu</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-panel border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="admin@astauria.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-bold rounded-xl hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
