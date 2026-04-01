import { useState, useEffect } from 'react';
import { leadsService, Lead } from '../services/leads';
import { Mail, Building, Clock } from 'lucide-react';
import { toast } from '../components/Toast';

const COLUMNS = [
  { id: 'NEW', label: 'Nouveau', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'DISCOVERY', label: 'Découverte', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'POC', label: 'POC', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { id: 'CLOSED_WON', label: 'Gagné', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'CLOSED_LOST', label: 'Perdu', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDraggingId(null);
    const leadId = e.dataTransfer.getData('leadId');
    
    if (!leadId) return;

    const leadToMove = leads.find(l => l.id === leadId);
    if (!leadToMove || leadToMove.status === statusId) return;

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: statusId as any } : l));

    try {
      await leadsService.updateStatus(leadId, statusId);
      toast.success('Statut mis à jour');
    } catch (error) {
      // Revert on error
      toast.error('Erreur lors de la mise à jour');
      fetchLeads();
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm('Supprimer ce prospect définitivement ?')) return;
    try {
      await leadsService.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Prospect supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return <div className="text-white">Chargement du pipeline...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white text-glow mb-2">CRM des Ventes</h1>
          <p className="text-gold-400/80">Gérez vos demandes d'audit IA et vos prospects</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map(column => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80 glass-panel rounded-xl flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Colonne Header */}
            <div className={`px-4 py-3 border-b border-white/10 bg-white/5 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${column.color.split(' ')[1]}`}>{column.label}</span>
                <span className="bg-white/10 text-gray-300 text-xs py-1 px-2 rounded-full font-medium border border-white/5">
                  {leads.filter(l => l.status === column.id).length}
                </span>
              </div>
            </div>

            {/* Cartes Leads */}
            <div className="flex-1 p-3 flex flex-col gap-3 min-h-[500px] overflow-y-auto custom-scrollbar">
              {leads.filter(l => l.status === column.id).length === 0 && (
                <div className="text-center p-6 text-white/20 rounded-lg border border-dashed border-white/20 mt-2 font-medium">
                  Glissez ici
                </div>
              )}
              {leads
                .filter(l => l.status === column.id)
                .map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10 shadow-lg cursor-grab active:cursor-grabbing hover:border-gold-500/50 transition-all ${draggingId === lead.id ? 'opacity-50 scale-95' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{lead.name}</h3>
                      <button onClick={() => deleteLead(lead.id)} className="text-gray-500 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 rounded-md p-1">
                        &times;
                      </button>
                    </div>
                    
                    {lead.company && (
                      <div className="flex items-center text-xs text-gray-300 mb-1 gap-1.5 font-medium">
                        <Building size={12} className="text-gold-400" /> {lead.company}
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-400 mb-3 gap-1.5">
                      <Mail size={12} className="text-gold-400/70" /> <a href={`mailto:${lead.email}`} className="hover:text-gold-400 truncate transition-colors">{lead.email}</a>
                    </div>
                    
                    {lead.message && (
                      <div className="text-xs text-gray-300 bg-black/20 p-2.5 rounded-lg line-clamp-2 mb-3 border border-white/5 font-light leading-relaxed">
                        "{lead.message}"
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Clock size={12} className="text-gold-400/50" /> {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-300 font-medium tracking-wide text-[10px] uppercase">
                        {lead.source}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
