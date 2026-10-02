/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  Trash2,
  Bookmark,
  Share2,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileText,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  BookmarkCheck,
  UploadCloud,
  FileUp,
  GitBranch,
  Target,
  Compass,
  Zap,
  Globe,
  Code2,
  Database
} from 'lucide-react';
import { SAMPLE_ABSTRACTS, SampleAbstract } from './data/sampleAbstracts';
import { analyzeAbstract, StructuredResult } from './services/analyzer';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'studio'>('studio');
  const [inputText, setInputText] = useState<string>('');
  const [analysisMode, setAnalysisMode] = useState<'full' | 'summary-only' | 'citations-only'>('full');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCitationTab, setActiveCitationTab] = useState<'ieee' | 'apa' | 'mla' | 'chicago' | 'bibtex'>('ieee');
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [copiedFull, setCopiedFull] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<StructuredResult | null>(null);
  const [savedLibrary, setSavedLibrary] = useState<StructuredResult[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with the landmark Transformer paper on initial load
  useEffect(() => {
    const saved = localStorage.getItem('scholarsync_library');
    if (saved) {
      try {
        setSavedLibrary(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const defaultSample = SAMPLE_ABSTRACTS[0];
    setInputText(defaultSample.abstract);
    setSelectedSampleId(defaultSample.id);
    analyzeAbstract(defaultSample.abstract).then((res) => {
      setCurrentResult(res);
    });
  }, []);

  // Save library changes
  useEffect(() => {
    localStorage.setItem('scholarsync_library', JSON.stringify(savedLibrary));
  }, [savedLibrary]);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const target = textToAnalyze !== undefined ? textToAnalyze : inputText;
    if (!target.trim()) return;

    setIsLoading(true);
    try {
      const result = await analyzeAbstract(target, analysisMode);
      setCurrentResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SampleAbstract) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.abstract);
    setActiveView('studio');
    handleAnalyze(sample.abstract);
  };

  const handleClear = () => {
    setInputText('');
    setSelectedSampleId('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setSelectedSampleId('');
        handleAnalyze(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
          setSelectedSampleId('');
          handleAnalyze(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyCitation = () => {
    if (!currentResult) return;
    const text = currentResult.citations[activeCitationTab];
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleCopyFullMarkdown = () => {
    if (!currentResult) return;
    const md = `# ${currentResult.title}
*${currentResult.authors} (${currentResult.year})*
**Field:** ${currentResult.field} | **DOI:** ${currentResult.doi}

## 1. Executive Summary & Hypotheses
${currentResult.summary.executive}

**Core Hypothesis:** ${currentResult.summary.coreHypothesis}

### Key Empirical Findings
${currentResult.summary.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## 2. Ingestion: Objectives, Methodology & Results
- **Objectives:** ${currentResult.methodology.objectives}
- **Methods:** ${currentResult.methodology.methods}
- **Results:** ${currentResult.methodology.results}
- **Identified Limitations:** ${currentResult.methodology.limitations.join('; ')}

## 3. Cross-Referenced Literature Gaps & Thematic Overlaps
### Identified Research Gaps
${currentResult.researchGaps.map((g) => `- **Gap:** ${g.gap}\n  - *Opportunity:* ${g.opportunity}`).join('\n')}

### Thematic Overlaps
${currentResult.thematicOverlaps.map((t) => `- ${t}`).join('\n')}

## 4. Primary Claims & Empirical Evidence
${currentResult.claims.map((c) => `- **Claim:** ${c.claim}\n  - *Evidence:* ${c.evidence} (${c.confidence} Confidence)`).join('\n')}

## 5. Formatted Citations
### IEEE
${currentResult.citations.ieee}

### APA 7th
${currentResult.citations.apa}

### BibTeX
\`\`\`bibtex
${currentResult.citations.bibtex}
\`\`\`
`;
    navigator.clipboard.writeText(md);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!currentResult) return;
    const md = `# ${currentResult.title}
*${currentResult.authors} (${currentResult.year})*
**Field:** ${currentResult.field} | **DOI:** ${currentResult.doi}

## Executive Summary
${currentResult.summary.executive}

### Core Hypothesis
${currentResult.summary.coreHypothesis}

### Key Findings
${currentResult.summary.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## Ingestion Breakdown
- **Objectives:** ${currentResult.methodology.objectives}
- **Methods:** ${currentResult.methodology.methods}
- **Results:** ${currentResult.methodology.results}

## Research Gaps & Opportunities
${currentResult.researchGaps.map((g) => `- **Gap:** ${g.gap}\n  - *Actionable Opportunity:* ${g.opportunity}`).join('\n')}

## Citations
- **IEEE:** ${currentResult.citations.ieee}
- **APA:** ${currentResult.citations.apa}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentResult.title.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_')}_review.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBibtex = () => {
    if (!currentResult) return;
    const blob = new Blob([currentResult.citations.bibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentResult.title.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.bib`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isSaved = currentResult ? savedLibrary.some((item) => item.id === currentResult.id) : false;

  const handleToggleSave = () => {
    if (!currentResult) return;
    if (isSaved) {
      setSavedLibrary((prev) => prev.filter((item) => item.id !== currentResult.id));
    } else {
      setSavedLibrary((prev) => [currentResult, ...prev]);
    }
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Top Navigation: Modern Academic Slim Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Left: ScholarSync Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('studio')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M8 7h8" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold tracking-tight text-slate-900">
                  ScholarSync
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Academic Engine
                </span>
              </div>
            </button>

            {/* View Switcher: Landing vs Studio */}
            <nav className="hidden md:flex items-center space-x-1 border border-slate-200/80 rounded-lg p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setActiveView('landing')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'landing'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('studio')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'studio'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Research Studio
              </button>
            </nav>
          </div>

          {/* Right: Actions, Notebook, Profile */}
          <div className="flex items-center gap-3">
            {activeView === 'landing' && (
              <button
                onClick={() => setActiveView('studio')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Assistant</span>
              </button>
            )}

            <button
              onClick={() => setIsLibraryOpen(true)}
              className="relative flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
              title="Saved Syntheses"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Notebook</span>
              {savedLibrary.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-blue-600 text-white">
                  {savedLibrary.length}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center text-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                aria-label="User Profile"
              >
                <User className="w-4 h-4 text-slate-600" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200/80 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">Dr. S. Nannyombi</p>
                    <p className="text-[11px] text-slate-500 truncate">Academic Researcher · ScholarSync</p>
                  </div>
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Citation Preference
                    </div>
                    <button
                      onClick={() => {
                        setActiveCitationTab('ieee');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span>IEEE Citation Style</span>
                      {activeCitationTab === 'ieee' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveCitationTab('apa');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span>APA 7th Edition</span>
                      {activeCitationTab === 'apa' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveCitationTab('bibtex');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span>BibTeX (LaTeX)</span>
                      {activeCitationTab === 'bibtex' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <div className="px-4 py-2 flex items-center gap-2 text-slate-500 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>Vercel & Cloud Run Deployable</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* VIEW 1: LANDING PAGE */}
      {activeView === 'landing' && (
        <div className="flex-1 bg-white">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
            
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Modern Academic Assistant · Powered by Gemma & Google GenAI</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
                Accelerate Academic Discovery with Disciplined Visual Clarity.
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Ingest dense research papers, extract structured objectives, methods & results, cross-reference literature gaps, and generate validated IEEE & APA citations in seconds.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setActiveView('studio')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Open Research Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    handleSelectSample(SAMPLE_ABSTRACTS[0]);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-200 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Try Attention Is All You Need</span>
                </button>
              </div>

              {/* Quick Landmark Paper Pills */}
              <div className="mt-12 pt-8 border-t border-slate-100 max-w-3xl mx-auto">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Pre-Indexed Landmark Literature
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SAMPLE_ABSTRACTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-600 hover:bg-slate-50 text-xs text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span className="font-medium">{sample.title.slice(0, 32)}...</span>
                      <span className="text-[10px] text-slate-400 font-mono">({sample.year})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* 3 Core Agent Responsibilities Feature Grid */}
          <section className="py-20 bg-slate-50 border-b border-slate-200/80">
            <div className="max-w-6xl mx-auto px-6">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                  Core Logic Capabilities
                </h2>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Engineered for Rigorous Literature Reviews
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  Three foundational capabilities executing in harmony to transform raw paper text into verified research assets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Pillar 1: Objectives, Methods & Results Ingestion */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-400 block mb-1">
                    PILLAR 01
                  </span>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">
                    Ingestion & Extraction
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Parses uploaded paper text, LaTeX, or abstracts to instantly isolate research objectives, experimental methodology, and quantitative findings without conversational bloat.
                  </p>
                  <ul className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Executive 2-sentence distillation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Methodology & boundary limitations</span>
                    </li>
                  </ul>
                </div>

                {/* Pillar 2: Cross-Paper Synthesis & Research Gaps */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-400 block mb-1">
                    PILLAR 02
                  </span>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">
                    Cross-Reference & Gaps
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Identifies thematic overlaps with adjacent literature, surfaces experimental blind spots, and formulates actionable future research opportunities.
                  </p>
                  <ul className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Unaddressed research gap detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Thematic literature convergence matrix</span>
                    </li>
                  </ul>
                </div>

                {/* Pillar 3: IEEE & APA Citations + Markdown Review */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-400 block mb-1">
                    PILLAR 03
                  </span>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">
                    IEEE / APA & Markdown
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generates clean, standardized citations in IEEE, APA 7th, MLA, Chicago, and BibTeX, alongside full-structured Markdown literature review summaries.
                  </p>
                  <ul className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>1-click copy & .bib file export</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Downloadable .md review dossiers</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </section>

          {/* Vercel & Production Deployment Banner */}
          <section className="py-16 bg-white">
            <div className="max-w-5xl mx-auto px-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Production Ready Architecture</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Deployable on Vercel with Zero Configuration
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    Pre-configured with <code className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">vercel.json</code>, Edge-compatible Vite bundle, and isolated Serverless API functions ready for global deployment.
                  </p>
                </div>
                
                <button
                  onClick={() => setActiveView('studio')}
                  className="shrink-0 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Research Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* VIEW 2: INTERACTIVE RESEARCH STUDIO */}
      {activeView === 'studio' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Input / Command Panel */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              
              {/* Header with Mode & Actions */}
              <div className="flex items-center justify-between">
                <label htmlFor="research-input" className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Literature Ingestion</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {wordCount > 0 ? `${wordCount} words` : 'Paper text or abstract'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.md,.bib"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Upload .txt, .md, or .bib file"
                  >
                    <FileUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload</span>
                  </button>

                  {inputText && (
                    <button
                      onClick={handleClear}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea with Drag & Drop capability */}
              <div
                className={`relative group rounded-xl transition-all duration-200 ${
                  dragActive ? 'ring-2 ring-blue-600 bg-blue-50/20' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <textarea
                  id="research-input"
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste abstract, paper text, or research query... (or drag & drop .txt/.md file)"
                  rows={12}
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed p-4 rounded-xl border border-slate-200 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 resize-y min-h-[230px]"
                />

                <div className="absolute bottom-3 right-3 text-[11px] text-slate-400 pointer-events-none select-none font-mono">
                  {charCount > 0 && `${charCount} chars`}
                </div>
              </div>

              {/* Prominent "Ask Gemma" Blue Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => handleAnalyze()}
                  disabled={isLoading || !inputText.trim()}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 shadow-sm active:scale-[0.99] ${
                    isLoading || !inputText.trim()
                      ? 'bg-blue-600/70 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Gemma logic engine synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Synthesize with Gemma</span>
                    </>
                  )}
                </button>

                {/* Analysis Mode Toggle */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-600 shadow-sm">
                  <button
                    onClick={() => setAnalysisMode('full')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      analysisMode === 'full'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Full Review
                  </button>
                  <button
                    onClick={() => setAnalysisMode('citations-only')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      analysisMode === 'citations-only'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Citations Only
                  </button>
                </div>
              </div>

              {/* Sample Abstracts Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Landmark Sample Papers
                  </span>
                  <span className="text-[11px] text-slate-400">1-click test</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_ABSTRACTS.map((sample) => {
                    const isSelected = selectedSampleId === sample.id;
                    return (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className={`text-left p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-white border-blue-600 ring-1 ring-blue-600 shadow-sm'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full mb-1">
                          <span className="text-[10px] font-semibold tracking-wide uppercase text-slate-500">
                            {sample.field.split('·')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sample.year}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-900 line-clamp-1">
                          {sample.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agent System Directives Badge */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 mt-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Agent Responsibilities Active</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Automatic extraction of objectives, methods, quantitative results, cross-referenced research gaps, and formatted IEEE/APA citations.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Results Stack */}
            <div className="lg:col-span-7 flex flex-col space-y-5">
              
              {/* Results Header Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                    Structured Review Dossier
                  </h2>
                  {currentResult && (
                    <span className="text-xs text-slate-500">
                      · {currentResult.timestamp}
                    </span>
                  )}
                </div>

                {currentResult && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSave}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Saved in notebook' : 'Save in notebook'}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={handleDownloadMarkdown}
                      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Download complete literature review as Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </button>

                    <button
                      onClick={handleCopyFullMarkdown}
                      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Copy entire synthesis as Markdown"
                    >
                      {copiedFull ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFull ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Results Content Stack */}
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-16 bg-slate-50 rounded w-full"></div>
                  </div>
                </div>
              ) : currentResult ? (
                <div className="space-y-4">
                  
                  {/* CARD 1: Executive Summary & Core Hypothesis */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {currentResult.field}
                        </span>
                        {currentResult.year && (
                          <span className="text-[11px] font-medium text-slate-500 font-mono">
                            {currentResult.year}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 leading-snug">
                        {currentResult.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {currentResult.authors}
                      </p>
                    </div>

                    {/* Executive Summary (2 clear sentences) */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Executive Distillation
                      </h4>
                      <p className="text-sm text-slate-900 leading-relaxed">
                        {currentResult.summary.executive}
                      </p>
                    </div>

                    {/* Core Hypothesis */}
                    <div className="mb-4 bg-slate-50 border-l-2 border-blue-600 rounded-r-lg p-3 text-xs text-slate-800">
                      <span className="font-semibold text-slate-900">Core Hypothesis: </span>
                      {currentResult.summary.coreHypothesis}
                    </div>

                    {/* Key Findings */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Key Empirical Findings
                      </h4>
                      <ul className="space-y-2">
                        {currentResult.summary.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CARD 2: Ingestion - Objectives, Methods & Quantitative Results (Agent Responsibility 1) */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Ingestion: Objectives, Methods & Results
                      </h3>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                          Research Objectives
                        </span>
                        <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {currentResult.methodology.objectives}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                            Experimental Methods
                          </span>
                          <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {currentResult.methodology.methods}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                            Empirical Results
                          </span>
                          <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {currentResult.methodology.results}
                          </p>
                        </div>
                      </div>

                      {currentResult.methodology.limitations.length > 0 && (
                        <div className="pt-2">
                          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                            Identified Scope Constraints & Limitations
                          </span>
                          <ul className="space-y-1">
                            {currentResult.methodology.limitations.map((lim, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="text-slate-400 mt-0.5">—</span>
                                <span>{lim}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 3: Cross-Reference & Research Gaps (Agent Responsibility 2) */}
                  {analysisMode === 'full' && (
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-900">
                          Cross-Referenced Research Gaps & Thematic Overlaps
                        </h3>
                      </div>

                      {/* Gaps */}
                      <div className="space-y-3 mb-4">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                          Unaddressed Research Gaps
                        </span>
                        {currentResult.researchGaps.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1">
                            <p className="font-semibold text-slate-900">
                              Gap {idx + 1}: {item.gap}
                            </p>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              <span className="text-blue-600 font-semibold">Future Opportunity: </span>
                              {item.opportunity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Thematic Overlaps */}
                      {currentResult.thematicOverlaps.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">
                            Thematic Literature Overlaps
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentResult.thematicOverlaps.map((overlap, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700"
                              >
                                {overlap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CARD 4: Formatted Academic Citations (IEEE & APA) (Agent Responsibility 3) */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-900">
                          Formatted Academic Citations
                        </h3>
                      </div>

                      {/* Format Tabs: IEEE and APA prominent */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                        {(['ieee', 'apa', 'mla', 'bibtex'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveCitationTab(tab)}
                            className={`px-2.5 py-1 rounded font-medium uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                              activeCitationTab === tab
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Citation text box */}
                    <div className="relative group bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 mb-3">
                      <p className={`text-xs text-slate-800 leading-relaxed break-words ${
                        activeCitationTab === 'bibtex' ? 'font-mono whitespace-pre text-[11px]' : ''
                      }`}>
                        {currentResult.citations[activeCitationTab]}
                      </p>
                    </div>

                    {/* Actions: Copy & BibTeX Download */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-500 font-mono">
                        {currentResult.doi ? `DOI: ${currentResult.doi}` : 'Verified Academic String'}
                      </div>

                      <div className="flex items-center gap-2">
                        {activeCitationTab === 'bibtex' && (
                          <button
                            onClick={handleDownloadBibtex}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>.bib</span>
                          </button>
                        )}

                        <button
                          onClick={handleCopyCitation}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded transition-all duration-200 cursor-pointer ${
                            copiedCitation
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {copiedCitation ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Citation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty state */
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Ready for Literature Ingestion
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                    Paste an abstract or upload a paper document to generate structured objectives, methodology constraints, research gaps, and IEEE/APA citations.
                  </p>
                  <button
                    onClick={() => handleSelectSample(SAMPLE_ABSTRACTS[0])}
                    className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Load "Attention Is All You Need" Landmark Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>

          </div>
        </main>
      )}

      {/* Slide-out Research Notebook Drawer */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-2xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Research Notebook ({savedLibrary.length})
                </h3>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {savedLibrary.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">No saved syntheses yet</p>
                  <p className="mt-1">Click "Save" on any structured result to keep it in your local library.</p>
                </div>
              ) : (
                savedLibrary.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-600/50 hover:shadow-xs transition-all cursor-pointer group"
                    onClick={() => {
                      setCurrentResult(item);
                      setActiveView('studio');
                      setIsLibraryOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.field.split('·')[0]}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedLibrary((prev) => prev.filter((i) => i.id !== item.id));
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                        title="Remove from notebook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {item.summary.executive}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slim Modern Academic Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ScholarSync</span>
            <span>· Academic Research Assistant</span>
            <span className="hidden sm:inline">· Powered by Gemma Logic Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>White & Deep Navy Palette</span>
            <span>·</span>
            <span>IEEE / APA Standard</span>
            <span>·</span>
            <span>Deployable on Vercel</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
