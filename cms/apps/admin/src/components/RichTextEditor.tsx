import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Strikethrough,
    Link as LinkIcon, Image as ImageIcon,
    List, ListOrdered, Heading1, Heading2,
    Quote, Code, Undo, Redo, Unlink,
    Sparkles, Loader2, ChevronDown, ChevronUp,
    Wand2, RefreshCw, Maximize2, MessageSquare,
    Lightbulb, Target, ListChecks, Megaphone
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { toast } from './Toast';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const PROMPT_TEMPLATES = [
    { label: 'Introduction persuasive', icon: Lightbulb, prompt: 'Rédigez une introduction persuasive et engageante' },
    { label: 'Appel à l\'action', icon: Megaphone, prompt: 'Rédigez un appel à l\'action convaincant invitant le lecteur à contacter Astauria' },
    { label: 'Liste d\'avantages', icon: ListChecks, prompt: 'Rédigez une liste de 5 avantages clés avec des données chiffrées' },
    { label: 'Conclusion', icon: Target, prompt: 'Rédigez une conclusion percutante qui résume les points clés et ouvre sur l\'avenir' },
];

const TONES = [
    { value: 'professional', label: 'Professionnel' },
    { value: 'friendly', label: 'Amical' },
    { value: 'expert', label: 'Expert' },
    { value: 'persuasive', label: 'Persuasif' },
] as const;

interface AiHistoryItem {
    action: string;
    prompt: string;
    result: string;
    timestamp: number;
}

export default function RichTextEditor({ content, onChange, placeholder = 'Commencez à écrire...' }: RichTextEditorProps) {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTone, setAiTone] = useState<string>('professional');
    const [aiHistory, setAiHistory] = useState<AiHistoryItem[]>([]);
    const [providerInfo, setProviderInfo] = useState<{provider: string; model: string} | null>(null);
    const promptInputRef = useRef<HTMLTextAreaElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-gold-600 underline' } }),
            Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
            Placeholder.configure({ placeholder }),
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-gray-200',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Fetch AI provider info on mount
    useEffect(() => {
        api.get('/ai/provider').then(res => setProviderInfo(res.data)).catch(() => {});
    }, []);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL du lien:', previousUrl);
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL de l\'image:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    const callAi = async (action: string, text: string, extraParams: Record<string, string> = {}) => {
        try {
            setIsAiLoading(true);
            const { data } = await api.post('/ai/generate', {
                action,
                text,
                tone: aiTone,
                ...extraParams
            });

            if (data.content) {
                // Add to history
                setAiHistory(prev => [
                    { action, prompt: text.substring(0, 80), result: data.content, timestamp: Date.now() },
                    ...prev.slice(0, 4) // Keep last 5
                ]);
                return data.content;
            }
            return null;
        } catch {
            toast.error('Erreur lors de la génération IA.');
            return null;
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleQuickAction = async (action: 'reformulate' | 'expand' | 'generate') => {
        if (!editor) return;
        const selection = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');

        if (action !== 'generate' && !selectedText) {
            toast.warning('Sélectionnez du texte à modifier.');
            return;
        }

        let payloadText = selectedText;
        if (action === 'generate') {
            const prompt = window.prompt('Que souhaitez-vous que l\'IA rédige ?');
            if (!prompt) return;
            payloadText = prompt;
        }

        const result = await callAi(action, payloadText);
        if (result) {
            editor.chain().focus().insertContent(result).run();
            toast.success('Texte IA inséré avec succès.');
        }
    };

    const handlePanelGenerate = async () => {
        if (!editor || !aiPrompt.trim()) {
            toast.warning('Entrez une instruction pour l\'IA.');
            return;
        }

        const result = await callAi('generate', aiPrompt);
        if (result) {
            editor.chain().focus().insertContent(result).run();
            toast.success('Texte IA inséré avec succès.');
            setAiPrompt('');
        }
    };

    const handleTemplateClick = async (template: typeof PROMPT_TEMPLATES[0]) => {
        if (!editor) return;
        const result = await callAi('generate', template.prompt);
        if (result) {
            editor.chain().focus().insertContent(result).run();
            toast.success(`${template.label} généré(e) avec succès.`);
        }
    };

    const insertFromHistory = (item: AiHistoryItem) => {
        if (!editor) return;
        editor.chain().focus().insertContent(item.result).run();
        toast.success('Contenu ré-inséré depuis l\'historique.');
    };

    if (!editor) return null;

    const ToolbarButton = ({
        onClick, isActive = false, disabled = false, children, title
    }: {
        onClick: () => void; isActive?: boolean; disabled?: boolean; children: React.ReactNode; title?: string;
    }) => (
        <button
            type="button" onClick={onClick} disabled={disabled} title={title}
            className={`p-2 rounded transition-colors ${isActive
                ? 'bg-navy-800 text-gold-400'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-white/10 mx-1" />;

    return (
        <div className="glass-input rounded-lg overflow-hidden flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/5 shrink-0">
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler">
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refaire">
                    <Redo size={16} />
                </ToolbarButton>
                <Divider />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Titre H1">
                    <Heading1 size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Titre H2">
                    <Heading2 size={16} />
                </ToolbarButton>
                <Divider />

                {/* AI Quick Actions */}
                <div className="flex items-center gap-1 bg-gradient-to-r from-gold-500/10 to-purple-500/10 px-2 py-1 rounded-lg border border-gold-500/20">
                    <Sparkles size={14} className="text-gold-400" />
                    <ToolbarButton onClick={() => handleQuickAction('generate')} disabled={isAiLoading} title="Rédiger un paragraphe">
                        {isAiLoading ? <Loader2 size={14} className="animate-spin text-gold-400" /> : <Wand2 size={14} className="text-gold-400" />}
                    </ToolbarButton>
                    <ToolbarButton onClick={() => handleQuickAction('reformulate')} disabled={isAiLoading || editor.state.selection.empty} title="Reformuler la sélection">
                        <RefreshCw size={14} className="text-gold-400" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => handleQuickAction('expand')} disabled={isAiLoading || editor.state.selection.empty} title="Développer la sélection">
                        <Maximize2 size={14} className="text-gold-400" />
                    </ToolbarButton>
                    <button
                        type="button"
                        onClick={() => { setIsAiPanelOpen(!isAiPanelOpen); setTimeout(() => promptInputRef.current?.focus(), 100); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-gold-400 hover:bg-gold-500/10 rounded transition-colors"
                        title="Ouvrir le panneau IA"
                    >
                        <MessageSquare size={12} />
                        {isAiPanelOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Gras"><Bold size={16} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italique"><Italic size={16} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Barré"><Strikethrough size={16} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code"><Code size={16} /></ToolbarButton>
                <Divider />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Liste à puces"><List size={16} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Liste numérotée"><ListOrdered size={16} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citation"><Quote size={16} /></ToolbarButton>
                <Divider />
                <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Ajouter un lien"><LinkIcon size={16} /></ToolbarButton>
                {editor.isActive('link') && (
                    <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Retirer le lien"><Unlink size={16} /></ToolbarButton>
                )}
                <ToolbarButton onClick={addImage} title="Insérer une image"><ImageIcon size={16} /></ToolbarButton>
            </div>

            {/* AI Panel */}
            {isAiPanelOpen && (
                <div className="border-b border-white/10 bg-gradient-to-r from-navy-900/95 to-navy-800/95 p-4 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-gold-400 animate-pulse" />
                            <span className="text-sm font-bold text-white text-glow">Assistant IA Astauria</span>
                            {providerInfo && (
                                <span className="text-[10px] font-mono bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/20">
                                    {providerInfo.provider === 'mock' ? 'SIMULATION' : providerInfo.model}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-400">Ton :</label>
                            <select
                                value={aiTone}
                                onChange={e => setAiTone(e.target.value)}
                                className="text-xs bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                            >
                                {TONES.map(t => (
                                    <option key={t.value} value={t.value} className="bg-navy-900">{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Prompt templates */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {PROMPT_TEMPLATES.map((tp) => (
                            <button
                                key={tp.label}
                                type="button"
                                onClick={() => handleTemplateClick(tp)}
                                disabled={isAiLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-gold-500/10 hover:text-gold-400 hover:border-gold-500/20 transition-all disabled:opacity-40"
                            >
                                <tp.icon size={12} />
                                {tp.label}
                            </button>
                        ))}
                    </div>

                    {/* Free prompt */}
                    <div className="flex gap-2">
                        <textarea
                            ref={promptInputRef}
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePanelGenerate(); } }}
                            placeholder="Décrivez ce que l'IA doit rédiger..."
                            rows={2}
                            className="flex-1 bg-black/20 border border-white/10 text-white text-sm rounded-lg px-3 py-2 resize-none placeholder:text-gray-500 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handlePanelGenerate}
                            disabled={isAiLoading || !aiPrompt.trim()}
                            className="self-end px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold text-sm hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] disabled:opacity-40 transition-all flex items-center gap-2"
                        >
                            {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            Générer
                        </button>
                    </div>

                    {/* History */}
                    {aiHistory.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Historique récent</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {aiHistory.map((item, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => insertFromHistory(item)}
                                        className="shrink-0 text-left max-w-[200px] px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <p className="text-[10px] text-gold-400 font-medium">{item.action}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{item.prompt}...</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loading overlay */}
            {isAiLoading && (
                <div className="bg-gradient-to-r from-gold-500/5 to-purple-500/5 border-b border-gold-500/10 px-4 py-2 flex items-center gap-3 shrink-0">
                    <Loader2 size={16} className="animate-spin text-gold-400" />
                    <span className="text-xs text-gold-400 font-medium animate-pulse">L'IA rédige votre contenu...</span>
                </div>
            )}

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto w-full">
                <EditorContent editor={editor} className="h-full w-full" />
            </div>
        </div>
    );
}
