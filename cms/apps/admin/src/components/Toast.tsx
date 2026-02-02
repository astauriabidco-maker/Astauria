import { create } from 'zustand';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (type, message, duration = 4000) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ toasts: [...state.toasts, { id, type, message, duration }] }));
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
            }, duration);
        }
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper functions
export const toast = {
    success: (message: string) => useToastStore.getState().addToast('success', message),
    error: (message: string) => useToastStore.getState().addToast('error', message),
    info: (message: string) => useToastStore.getState().addToast('info', message),
    warning: (message: string) => useToastStore.getState().addToast('warning', message),
};

// Toast Container Component
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-amber-500',
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => {
                const Icon = icons[t.type];
                return (
                    <div
                        key={t.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[300px] animate-in slide-in-from-right duration-300 ${colors[t.type]}`}
                    >
                        <Icon size={20} className={iconColors[t.type]} />
                        <span className="flex-1 text-sm font-medium">{t.message}</span>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="p-1 hover:bg-black/5 rounded transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
