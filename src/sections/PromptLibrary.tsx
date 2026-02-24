import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Star, StarOff, Archive, Copy, ChevronDown, ChevronUp,
  Trash2, Tag, History, Sparkles, FolderOpen, Edit2, Check, X,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Prompt, PromptVersion, PromptCollection, PromptCategory, AIModel } from '@/types';

// ─── constants ────────────────────────────────────────────────────────────────

const AI_MODELS: { value: AIModel; label: string; color: string }[] = [
  { value: 'claude-opus',    label: 'Claude Opus',    color: 'bg-amber-500/10 text-amber-600' },
  { value: 'claude-sonnet',  label: 'Claude Sonnet',  color: 'bg-amber-500/10 text-amber-600' },
  { value: 'claude-haiku',   label: 'Claude Haiku',   color: 'bg-amber-500/10 text-amber-600' },
  { value: 'gpt-4o',         label: 'GPT-4o',         color: 'bg-green-500/10 text-green-600' },
  { value: 'gpt-4-turbo',    label: 'GPT-4 Turbo',    color: 'bg-green-500/10 text-green-600' },
  { value: 'gemini-pro',     label: 'Gemini Pro',     color: 'bg-blue-500/10 text-blue-600' },
  { value: 'gemini-flash',   label: 'Gemini Flash',   color: 'bg-blue-500/10 text-blue-600' },
  { value: 'mistral-large',  label: 'Mistral Large',  color: 'bg-purple-500/10 text-purple-600' },
  { value: 'llama-3',        label: 'Llama 3',        color: 'bg-rose-500/10 text-rose-600' },
  { value: 'custom',         label: 'Custom',         color: 'bg-gray-500/10 text-gray-600' },
];

const CATEGORIES: PromptCategory[] = [
  'coding', 'writing', 'analysis', 'brainstorming',
  'summarization', 'translation', 'roleplay', 'research',
  'productivity', 'creativity', 'other',
];

const COLLECTION_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#14b8a6',
];

const now = () => new Date().toISOString();

// ─── helpers ──────────────────────────────────────────────────────────────────

function modelBadge(model?: AIModel) {
  const m = AI_MODELS.find((a) => a.value === model);
  if (!m) return null;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.color}`}>
      {m.label}
    </span>
  );
}

function ratingStars(rating?: number) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= (rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

// ─── PromptEditor ─────────────────────────────────────────────────────────────

interface PromptEditorProps {
  prompt?: Partial<Prompt>;
  collections: PromptCollection[];
  onSave: (p: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function PromptEditor({ prompt, collections, onSave, onCancel }: PromptEditorProps) {
  const [title, setTitle]           = useState(prompt?.title ?? '');
  const [description, setDesc]      = useState(prompt?.description ?? '');
  const [content, setContent]       = useState(prompt?.versions?.at(-1)?.content ?? '');
  const [systemPrompt, setSys]      = useState(prompt?.versions?.at(-1)?.systemPrompt ?? '');
  const [category, setCat]          = useState<PromptCategory>(prompt?.category ?? 'other');
  const [model, setModel]           = useState<AIModel>(prompt?.versions?.at(-1)?.model ?? 'claude-sonnet');
  const [notes, setNotes]           = useState('');
  const [rating, setRating]         = useState<number>(prompt?.versions?.at(-1)?.rating ?? 0);
  const [tagInput, setTagInput]     = useState('');
  const [tags, setTags]             = useState<string[]>(prompt?.tags ?? []);
  const [collectionId, setCollId]   = useState(prompt?.collectionId ?? '');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    const existingVersions = prompt?.versions ?? [];
    const newVersion: PromptVersion = {
      version: existingVersions.length + 1,
      content: content.trim(),
      systemPrompt: systemPrompt.trim() || undefined,
      model, notes, rating: rating as PromptVersion['rating'],
      createdAt: now(),
    };
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      tags,
      collectionId: collectionId || undefined,
      versions: [...existingVersions, newVersion],
      isFavorite: prompt?.isFavorite ?? false,
      isArchived: prompt?.isArchived ?? false,
      usageCount: prompt?.usageCount ?? 0,
      lastUsedAt: prompt?.lastUsedAt,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Code Review Assistant" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
          <select value={category} onChange={(e) => setCat(e.target.value as PromptCategory)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
        <input value={description} onChange={(e) => setDesc(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="What does this prompt do?" />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">System Prompt (optional)</label>
        <textarea value={systemPrompt} onChange={(e) => setSys(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" placeholder="You are a helpful assistant that…" />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prompt Content *</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" placeholder="Write your prompt here. Use {{variable}} for dynamic parts." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value as AIModel)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
            {AI_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Collection</label>
          <select value={collectionId} onChange={(e) => setCollId(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
            <option value="">None</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating</label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s === rating ? 0 : s)}>
                <Star className={`w-5 h-5 transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tags</label>
        <div className="flex gap-2 mt-1">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} placeholder="Add tag…" className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted">
              {tag}
              <button onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Version Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="What changed in this version?" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
          <Check className="w-4 h-4 mr-1.5" />Save Prompt
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── PromptCard ───────────────────────────────────────────────────────────────

function PromptCard({
  prompt,
  onEdit, onDelete, onToggleFavorite, onCopy, onArchive,
}: {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onArchive: () => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const current = prompt.versions.at(-1);

  return (
    <Card className={`border-border/50 transition-all ${prompt.isArchived ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-semibold truncate">{prompt.title}</CardTitle>
              <Badge variant="outline" className="text-[10px] shrink-0">{prompt.category}</Badge>
              {current && modelBadge(current.model)}
            </div>
            {prompt.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{prompt.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onToggleFavorite} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'}`} />
            </button>
          </div>
        </div>
        {current && ratingStars(current.rating)}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Prompt preview */}
        <pre className="text-xs bg-muted/50 rounded-xl p-3 overflow-auto max-h-24 font-mono whitespace-pre-wrap leading-relaxed">
          {current?.content}
        </pre>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prompt.tags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
            ))}
          </div>
        )}

        {/* Version badge + history toggle */}
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowHistory((s) => !s)}
          >
            <History className="w-3.5 h-3.5" />
            v{current?.version} · {prompt.versions.length} version{prompt.versions.length !== 1 ? 's' : ''}
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex gap-1">
            <button onClick={onCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onArchive} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Version history */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/50 pt-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Version History</p>
                {[...prompt.versions].reverse().map((v) => (
                  <div key={v.version} className="text-xs flex gap-2 items-start">
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-muted font-mono">v{v.version}</span>
                    <div className="min-w-0">
                      <p className="text-muted-foreground truncate">{v.notes || 'No notes'}</p>
                      <p className="text-muted-foreground/60 text-[10px]">{v.createdAt.split('T')[0]}</p>
                    </div>
                    {modelBadge(v.model)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ─── Main PromptLibrary ───────────────────────────────────────────────────────

export default function PromptLibrary() {
  const [prompts, setPrompts]           = useState<Prompt[]>([]);
  const [collections, setCollections]   = useState<PromptCollection[]>([]);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState<PromptCategory | 'all'>('all');
  const [filterModel, setFilterModel]   = useState<AIModel | 'all'>('all');
  const [filterColl, setFilterColl]     = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView]                 = useState<'grid' | 'list'>('grid');
  const [editing, setEditing]           = useState<string | null>(null);   // prompt id or 'new'
  const [newCollName, setNewCollName]   = useState('');
  const [copied, setCopied]             = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState('library');

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const savePrompt = (id: string | null, data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (id === null) {
      setPrompts([...prompts, { ...data, id: uuidv4(), createdAt: now(), updatedAt: now() }]);
    } else {
      setPrompts(prompts.map((p) => p.id === id ? { ...p, ...data, updatedAt: now() } : p));
    }
    setEditing(null);
  };

  const deletePrompt = (id: string) => setPrompts(prompts.filter((p) => p.id !== id));

  const toggleFavorite = (id: string) =>
    setPrompts(prompts.map((p) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));

  const toggleArchive = (id: string) =>
    setPrompts(prompts.map((p) => p.id === id ? { ...p, isArchived: !p.isArchived } : p));

  const copyPrompt = (prompt: Prompt) => {
    const current = prompt.versions.at(-1);
    if (!current) return;
    navigator.clipboard.writeText(current.content).then(() => {
      setCopied(prompt.id);
      setTimeout(() => setCopied(null), 2000);
    });
    setPrompts(prompts.map((p) => p.id === prompt.id
      ? { ...p, usageCount: p.usageCount + 1, lastUsedAt: now() }
      : p
    ));
  };

  const addCollection = () => {
    if (!newCollName.trim()) return;
    setCollections([...collections, {
      id: uuidv4(), name: newCollName.trim(),
      color: COLLECTION_COLORS[collections.length % COLLECTION_COLORS.length],
      createdAt: now(),
    }]);
    setNewCollName('');
  };

  // ── Filters ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prompts.filter((p) => {
      if (!showArchived && p.isArchived) return false;
      if (filterCat !== 'all' && p.category !== filterCat) return false;
      if (filterColl !== 'all' && p.collectionId !== filterColl) return false;
      if (filterModel !== 'all') {
        const hasModel = p.versions.some((v) => v.model === filterModel);
        if (!hasModel) return false;
      }
      if (q) {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc  = p.description?.toLowerCase().includes(q);
        const matchTag   = p.tags.some((t) => t.includes(q));
        const matchContent = p.versions.some((v) => v.content.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag && !matchContent) return false;
      }
      return true;
    });
  }, [prompts, search, filterCat, filterColl, filterModel, showArchived]);

  const favorites = filtered.filter((p) => p.isFavorite);

  // ── Editing state ─────────────────────────────────────────────────────────

  const editingPrompt = editing && editing !== 'new'
    ? prompts.find((p) => p.id === editing)
    : undefined;

  if (editing) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
            <X className="w-4 h-4 mr-1" />Cancel
          </Button>
          <h2 className="text-lg font-semibold">
            {editing === 'new' ? 'New Prompt' : `Edit: ${editingPrompt?.title}`}
          </h2>
        </div>
        <PromptEditor
          prompt={editingPrompt}
          collections={collections}
          onSave={(data) => savePrompt(editing === 'new' ? null : editing, data)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Prompt Library
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Version-controlled prompts · multiple AI models · searchable collections
          </p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="w-4 h-4 mr-1.5" />New Prompt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Prompts', value: prompts.filter((p) => !p.isArchived).length },
          { label: 'Favourites',    value: prompts.filter((p) => p.isFavorite).length },
          { label: 'Collections',   value: collections.length },
          { label: 'Total Versions',value: prompts.reduce((s, p) => s + p.versions.length, 0) },
        ].map(({ label, value }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />Favourites
            {favorites.length > 0 && <span className="text-[10px] px-1.5 bg-yellow-400/20 text-yellow-600 rounded-full">{favorites.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="collections">
            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />Collections
          </TabsTrigger>
        </TabsList>

        {/* ── Library tab ── */}
        <TabsContent value="library" className="space-y-4">
          {/* Search + filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, tags, content…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value as typeof filterCat)} className="px-3 py-2 rounded-xl border border-border bg-card text-sm">
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterModel} onChange={(e) => setFilterModel(e.target.value as typeof filterModel)} className="px-3 py-2 rounded-xl border border-border bg-card text-sm">
              <option value="all">All Models</option>
              {AI_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={filterColl} onChange={(e) => setFilterColl(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-card text-sm">
              <option value="all">All Collections</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button variant={showArchived ? 'default' : 'outline'} size="sm" onClick={() => setShowArchived((s) => !s)}>
              <Archive className="w-3.5 h-3.5 mr-1" />{showArchived ? 'Hide Archived' : 'Archived'}
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No prompts yet. Click "New Prompt" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((prompt) => (
                <div key={prompt.id} className="relative">
                  {copied === prompt.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10">
                      <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                        <Check className="w-4 h-4" />Copied!
                      </div>
                    </div>
                  )}
                  <PromptCard
                    prompt={prompt}
                    onEdit={() => setEditing(prompt.id)}
                    onDelete={() => deletePrompt(prompt.id)}
                    onToggleFavorite={() => toggleFavorite(prompt.id)}
                    onCopy={() => copyPrompt(prompt)}
                    onArchive={() => toggleArchive(prompt.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Favourites tab ── */}
        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <StarOff className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No favourites yet. Star prompts you love.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favorites.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={() => setEditing(prompt.id)}
                  onDelete={() => deletePrompt(prompt.id)}
                  onToggleFavorite={() => toggleFavorite(prompt.id)}
                  onCopy={() => copyPrompt(prompt)}
                  onArchive={() => toggleArchive(prompt.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Collections tab ── */}
        <TabsContent value="collections" className="space-y-4">
          <div className="flex gap-2">
            <input
              value={newCollName}
              onChange={(e) => setNewCollName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCollection()}
              placeholder="New collection name…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button onClick={addCollection}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No collections. Group your prompts into themed folders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((coll) => {
                const count = prompts.filter((p) => p.collectionId === coll.id && !p.isArchived).length;
                return (
                  <Card
                    key={coll.id}
                    className="cursor-pointer hover:border-primary/40 transition-all border-border/50"
                    onClick={() => { setFilterColl(coll.id); setActiveTab('library'); }}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: coll.color + '20' }}
                      >
                        <FolderOpen style={{ color: coll.color }} className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{coll.name}</p>
                        <p className="text-xs text-muted-foreground">{count} prompt{count !== 1 ? 's' : ''}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
