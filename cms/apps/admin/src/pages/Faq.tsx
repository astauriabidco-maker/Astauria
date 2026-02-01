import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';

export default function Faq() {
    const { data: faqItems, isLoading } = useQuery({
        queryKey: ['faq'],
        queryFn: async () => (await api.get('/faq')).data,
    });

    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
                    <p className="text-gray-500">Gérez les questions fréquentes ({faqItems?.length || 0} questions)</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
                    <Plus size={18} />
                    <span>Ajouter</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="divide-y divide-gray-100">
                        {(faqItems || []).map((faq: any) => (
                            <div key={faq.id} className="p-4">
                                <div
                                    className="flex items-start gap-3 cursor-pointer"
                                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${faq.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <h3 className="font-medium text-gray-900">{faq.question}</h3>
                                        </div>
                                        {expandedId === faq.id && (
                                            <p className="mt-3 text-gray-600 text-sm leading-relaxed pl-4 border-l-2 border-gold-500">
                                                {faq.answer}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                            <Pencil size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                        {expandedId === faq.id ? (
                                            <ChevronUp size={18} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={18} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!faqItems || faqItems.length === 0) && (
                            <div className="p-12 text-center text-gray-400">Aucune question FAQ</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
