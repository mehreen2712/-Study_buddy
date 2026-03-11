import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  Send, 
  Loader2, 
  Sparkles, 
  GraduationCap,
  ChevronRight,
  Copy,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getStudyBuddyResponse, StudyMode } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ content: string; mode: StudyMode } | null>(null);
  const [activeMode, setActiveMode] = useState<StudyMode>('solve');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAction = async (mode: StudyMode) => {
    if (!input.trim()) return;
    
    setLoading(true);
    setActiveMode(mode);
    
    const result = await getStudyBuddyResponse(input, mode);
    setResponse({ content: result, mode });
    setLoading(false);
  };

  useEffect(() => {
    if (response && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response.content);
    }
  };

  const reset = () => {
    setInput('');
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">StudyBuddy<span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={reset}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Welcome Section */}
        {!response && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              What are we learning today?
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Ask a question, paste a topic, or drop a problem. I'm here to help you master your studies.
            </p>
          </motion.div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your question or topic here..."
            className="w-full p-6 text-lg border-none focus:ring-0 resize-none min-h-[160px] placeholder:text-slate-300"
          />
          
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <ActionButton 
                icon={<CheckCircle2 size={18} />} 
                label="Solve" 
                active={activeMode === 'solve'}
                onClick={() => handleAction('solve')}
                disabled={loading || !input.trim()}
                variant="indigo"
              />
              <ActionButton 
                icon={<BookOpen size={18} />} 
                label="Notes" 
                active={activeMode === 'notes'}
                onClick={() => handleAction('notes')}
                disabled={loading || !input.trim()}
                variant="emerald"
              />
              <ActionButton 
                icon={<Lightbulb size={18} />} 
                label="Examples" 
                active={activeMode === 'examples'}
                onClick={() => handleAction('examples')}
                disabled={loading || !input.trim()}
                variant="amber"
              />
            </div>
            
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Powered by Gemini 3.1 Pro
            </div>
          </div>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-slate-500"
            >
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-lg font-medium animate-pulse">Thinking and analyzing...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence mode="wait">
          {response && !loading && (
            <motion.div 
              key={response.mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              ref={resultRef}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    response.mode === 'solve' && "bg-indigo-100 text-indigo-600",
                    response.mode === 'notes' && "bg-emerald-100 text-emerald-600",
                    response.mode === 'examples' && "bg-amber-100 text-amber-600"
                  )}>
                    {response.mode === 'solve' && <CheckCircle2 size={20} />}
                    {response.mode === 'notes' && <BookOpen size={20} />}
                    {response.mode === 'examples' && <Lightbulb size={20} />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 capitalize">
                    {response.mode === 'solve' ? 'Solution' : response.mode === 'notes' ? 'Study Notes' : 'Illustrative Examples'}
                  </h3>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-slate-600 prose-li:text-slate-600">
                <Markdown>{response.content}</Markdown>
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="text-sm font-medium">Back to top</span>
                  <ChevronRight size={16} className="-rotate-90 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Study smarter, not harder.</span>
          </div>
          <p className="text-slate-400 text-xs">
            © 2026 StudyBuddy AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  variant: 'indigo' | 'emerald' | 'amber';
}

function ActionButton({ icon, label, active, onClick, disabled, variant }: ActionButtonProps) {
  const variants = {
    indigo: "hover:bg-indigo-600 hover:text-white border-indigo-200 text-indigo-600 active:bg-indigo-700",
    emerald: "hover:bg-emerald-600 hover:text-white border-emerald-200 text-emerald-600 active:bg-emerald-700",
    amber: "hover:bg-amber-600 hover:text-white border-amber-200 text-amber-600 active:bg-amber-700"
  };

  const activeVariants = {
    indigo: "bg-indigo-600 text-white border-indigo-600",
    emerald: "bg-emerald-600 text-white border-emerald-600",
    amber: "bg-amber-600 text-white border-amber-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
        active ? activeVariants[variant] : variants[variant],
        !active && "bg-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
