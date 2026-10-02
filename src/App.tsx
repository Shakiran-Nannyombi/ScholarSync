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
  BookmarkCheck
} from 'lucide-react';
import { SAMPLE_ABSTRACTS, SampleAbstract } from './data/sampleAbstracts';
import { analyzeAbstract, StructuredResult } from './services/analyzer';

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [analysisMode, setAnalysisMode] = useState<'full' | 'summary-only' | 'citations-only'>('full');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCitationTab, setActiveCitationTab] = useState<'apa' | 'mla' | 'chicago' | 'bibtex'>('apa');
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [copiedFull, setCopiedFull] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<StructuredResult | null>(null);
  const [savedLibrary, setSavedLibrary] = useState<StructuredResult[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with the landmark Transformer paper on initial load for immediate visual clarity and delight
  useEffect(() => {
    const saved = localStorage.getItem('scholarsync_library');
    if (saved) {
      try {
        setSavedLibrary(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // Default load sample to show the complete, polished layout immediately
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
    handleAnalyze(sample.abstract);
  };

  const handleClear = () => {
    setInputText('');
    setSelectedSampleId('');
    if (textareaRef.current) {
      textareaRef.current.focus();
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

## Executive Summary
${currentResult.summary.executive}

### Core Hypothesis
${currentResult.summary.coreHypothesis}

### Key Findings
${currentResult.summary.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## Methodology
- **Research Design:** ${currentResult.methodology.design}
- **Dataset / Sample:** ${currentResult.methodology.datasetOrSample}
- **Validation:** ${currentResult.methodology.validationApproach}
- **Limitations:** ${currentResult.methodology.limitations.join('; ')}

## Key Claims & Empirical Evidence
${currentResult.claims.map((c) => `- **Claim:** ${c.claim}\n  - *Evidence:* ${c.evidence} (Confidence: ${c.confidence})`).join('\n')}

## Citations
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Navigation: Slim, clean header bar with logo (left) and user profile icon (right) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: ScholarSync Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform duration-200 hover:scale-105">
              {/* Minimalist academic nexus icon */}
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
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Research Assistant
              </span>
            </div>
          </div>

          {/* Right: Actions & User Profile Icon */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="relative flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
              title="Saved Syntheses"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Notebook</span>
              {savedLibrary.length > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-blue-600 text-white">
                  {savedLibrary.length}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {/* Profile Icon with Dropdown */}
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
                      Default Citation
                    </div>
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
                      <span>Engine: Gemma 3.8 Academic</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid: Two-column grid system with generous white space */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input / Command */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Input Header & Prompt */}
            <div className="flex items-center justify-between">
              <label htmlFor="research-input" className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Research Input</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {wordCount > 0 ? `${wordCount} words` : 'Abstract or inquiry'}
                </span>
              </label>

              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Clean White Rounded Textarea */}
            <div className="relative group">
              <textarea
                id="research-input"
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste abstract or research query..."
                rows={12}
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed p-4 rounded-xl border border-slate-200 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 resize-y min-h-[220px]"
              />

              {/* Character and word indicators */}
              <div className="absolute bottom-3 right-3 text-[11px] text-slate-400 pointer-events-none select-none">
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
                    <span>Synthesizing literature...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Ask Gemma</span>
                  </>
                )}
              </button>

              {/* Mode Selector */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-600 shadow-sm">
                <button
                  onClick={() => setAnalysisMode('full')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    analysisMode === 'full'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Full Synthesis
                </button>
                <button
                  onClick={() => setAnalysisMode('citations-only')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    analysisMode === 'citations-only'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Citations
                </button>
              </div>
            </div>

            {/* Quick Sample Abstracts Selector: High Functionality & Zero Clutter */}
            <div className="pt-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Or load landmark paper
                </span>
                <span className="text-[11px] text-slate-400">Click to test</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_ABSTRACTS.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`text-left p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between ${
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

            {/* Research Assistant Guidelines Card: Minimalist, Calm */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-semibold text-slate-900">Academic Verification Standards</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ScholarSync verifies claims against primary experimental methodology, identifies sample size constraints, and produces verified citations in APA, MLA, Chicago, and BibTeX standards.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Results (Clean card stack area with structured results) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            
            {/* Results Header Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Structured Findings
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
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all ${
                      isSaved
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title={isSaved ? 'Saved to library' : 'Save to library'}
                  >
                    {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleCopyFullMarkdown}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    title="Copy entire synthesis as Markdown"
                  >
                    {copiedFull ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFull ? 'Copied' : 'Export MD'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results Content Stack */}
            {isLoading ? (
              /* Loading State: Calm skeleton pulse */
              <div className="space-y-4 animate-pulse">
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                  <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-16 bg-slate-50 rounded w-full"></div>
                </div>
              </div>
            ) : currentResult ? (
              <div className="space-y-4">
                
                {/* CARD 1: Executive Summary & Core Hypothesis */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                  
                  {/* Card Header: Domain badge & Title */}
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {currentResult.field}
                      </span>
                      {currentResult.year && (
                        <span className="text-[11px] font-medium text-slate-500">
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

                  {/* Key Takeaways with Cobalt Blue Bullet Accents */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Key Empirical Takeaways
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

                  {/* Domain Tags */}
                  {currentResult.summary.domainTags && currentResult.summary.domainTags.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {currentResult.summary.domainTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CARD 2: Formatted Academic Citations */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Academic Citation
                      </h3>
                    </div>

                    {/* Format Tabs: Cobalt Blue ONLY for active state */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                      {(['apa', 'mla', 'chicago', 'bibtex'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveCitationTab(tab)}
                          className={`px-2.5 py-1 rounded font-medium uppercase tracking-wider text-[11px] transition-colors ${
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
                      {currentResult.doi ? `DOI: ${currentResult.doi}` : 'Direct Citation Reference'}
                    </div>

                    <div className="flex items-center gap-2">
                      {activeCitationTab === 'bibtex' && (
                        <button
                          onClick={handleDownloadBibtex}
                          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.bib</span>
                        </button>
                      )}

                      <button
                        onClick={handleCopyCitation}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded transition-all duration-200 ${
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

                {/* CARD 3: Methodology & Experimental Rigor (Only in Full Mode) */}
                {analysisMode === 'full' && (
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Methodology & Constraints
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                          Research Design
                        </span>
                        <p className="text-slate-800 leading-relaxed">
                          {currentResult.methodology.design}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                          Dataset / Sample Corpus
                        </span>
                        <p className="text-slate-800 leading-relaxed">
                          {currentResult.methodology.datasetOrSample}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                        Identified Limitations & Boundary Conditions
                      </span>
                      <ul className="space-y-1.5">
                        {currentResult.methodology.limitations.map((limit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="text-slate-400 mt-0.5">—</span>
                            <span>{limit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* CARD 4: Claims & Evidence Matrix */}
                {analysisMode === 'full' && currentResult.claims.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Primary Claims & Verification
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {currentResult.claims.length} claims extracted
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentResult.claims.map((claimObj, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-lg p-3 border border-slate-200/70 text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900 leading-snug">
                              {claimObj.claim}
                            </p>
                            <span
                              className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${
                                claimObj.confidence === 'High'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {claimObj.confidence} Confidence
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            <strong className="text-slate-700">Evidence: </strong>
                            {claimObj.evidence}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* Empty state: Calm, inviting slate container */
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  Ready to Synthesize Research
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Paste any paper abstract or research inquiry in the command panel to generate structured executive findings, methodology constraints, and four-format citations.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
                  <span>Select a landmark paper on the left to view immediate sample analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

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
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {savedLibrary.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">No saved papers yet</p>
                  <p className="mt-1">Click "Save" on any structured result to store it here.</p>
                </div>
              ) : (
                savedLibrary.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-600/50 hover:shadow-xs transition-all cursor-pointer group"
                    onClick={() => {
                      setCurrentResult(item);
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
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1"
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

      {/* Slim Footer: Minimalist, Calm */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ScholarSync</span>
            <span>· Academic Distillation Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Calm & Focused Academic Interface</span>
            <span>·</span>
            <span>Zero Slop · Verified Citations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
