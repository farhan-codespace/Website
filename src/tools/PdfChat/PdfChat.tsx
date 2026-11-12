import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Bot,
  User,
  Send,
  Sparkles,
  RefreshCw,
  Key,
  Copy,
  Check,
  Download,
  AlertCircle,
  Settings,
  ChevronDown,
  Layers,
  BookOpen,
  HelpCircle,
  ListOrdered,
  Lightbulb,
  ExternalLink,
  X
} from 'lucide-react';
import { extractTextFromPdf, PdfDocumentContent } from './pdfExtractor';
import {
  ChatMessage,
  AiConfig,
  loadAiConfig,
  saveAiConfig,
  queryPdfAi
} from './aiService';
import { useClipboard } from '../../hooks/useClipboard';

export function PdfChat() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState<PdfDocumentContent | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => loadAiConfig());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [activePreviewPage, setActivePreviewPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { copy, copiedKey } = useClipboard();

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Load sample demo document
  const loadSampleDocument = () => {
    const sampleText = `--- Page 1 ---
OmniTool Engine: Modern Client-Side Web Architecture & Whitepaper
Published: October 2026 • Prepared by the OmniTool Open-Source Architecture Team

1. EXECUTIVE SUMMARY
OmniTool is a next-generation suite of browser-executed web applications delivering zero-backend-cost utilities. By harnessing HTML5 Canvas, Web Workers, WebAssembly, and modern Web Crypto APIs, OmniTool enables users to perform image compression, PDF document assembly, QR synthesis, code formatting, and financial calculations directly inside client memory.

2. CORE PRIVACY PARADIGM
Traditional cloud converters require users to upload confidential documents to centralized server farms. This introduces recurring server infrastructure costs, bandwidth bottlenecks, and significant corporate compliance liabilities under GDPR and CCPA. OmniTool eliminates remote server transmission entirely. Data processed within OmniTool never leaves the client browser.

--- Page 2 ---
3. PERFORMANCE BENCHMARKS
- Average Image Compression Latency: 42ms (client-side) vs 1,840ms (remote roundtrip)
- Server Cost per Million Transactions: $0.00 forever
- Lighthouse Core Web Vitals Score: 99/100
- Cumulative Layout Shift (CLS): 0.000 (Monetization ad containers are pre-allocated with fixed CSS aspect ratios)

4. MONETIZATION & SUSTAINABILITY
OmniTool maintains free global access through non-intrusive Google AdSense advertising containers. All advertising slots adhere strictly to standard IAB specifications (728x90 leaderboard and 300x250 inline rectangles) with zero layout shifting.

5. ACTION ITEMS & NEXT STEPS
- [x] Implement in-browser PDF text extraction and AI question answering.
- [x] Configure Google Gemini API and local heuristic fallback.
- [ ] Deploy Edge CDN caching for production static assets.`;

    const sampleDoc: PdfDocumentContent = {
      fileName: 'OmniTool-Architecture-Whitepaper.pdf',
      fileSize: 48200,
      totalPages: 2,
      fullText: sampleText,
      pages: [
        {
          pageNumber: 1,
          text: sampleText.split('--- Page 2 ---')[0].replace('--- Page 1 ---', '').trim(),
        },
        {
          pageNumber: 2,
          text: (sampleText.split('--- Page 2 ---')[1] || '').trim(),
        },
      ],
      wordCount: 238,
      charCount: sampleText.length,
    };

    setPdfContent(sampleDoc);
    setParseError(null);
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `### 📄 Demo Document Loaded: **${sampleDoc.fileName}**\n\nI have indexed **${sampleDoc.totalPages} pages** (${sampleDoc.wordCount} words) in browser memory.\n\nYou can click any prompt below or ask your own question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setParseError('Please upload a valid PDF document (.pdf).');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseError(null);
    setPdfContent(null);
    setParseProgress({ current: 0, total: 1 });

    try {
      const content = await extractTextFromPdf(selectedFile, (cur, tot) => {
        setParseProgress({ current: cur, total: tot });
      });

      setPdfContent(content);
      setMessages([
        {
          id: 'ready',
          sender: 'assistant',
          text: `### 📄 Document Ready: **${content.fileName}**\n\nSuccessfully extracted **${content.totalPages} pages** (${content.wordCount.toLocaleString()} words) 100% in local memory.\n\nAsk any question, or select a quick action below to summarize or find key takeaways!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Error parsing PDF:', err);
      setParseError('Unable to extract text from this PDF. It may be encrypted or contain only scanned images.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || !pdfContent || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputText('');
    setIsGenerating(true);

    try {
      const response = await queryPdfAi(
        prompt,
        pdfContent.fullText,
        newHistory,
        aiConfig,
        pdfContent.pages
      );

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedPages: response.referencedPages,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: `⚠️ **Processing Error:** ${err.message || 'Failed to complete query'}. \n\nYou can switch to the local smart engine in Settings if your cloud API key is invalid.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSettings = (newConfig: AiConfig) => {
    setAiConfig(newConfig);
    saveAiConfig(newConfig);
    setShowSettingsModal(false);
  };

  const exportChatHistory = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfContent?.fileName || 'document'}-ai-chat.md`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone if no document loaded */}
      {!pdfContent && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-900/60 shadow-sm'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {isParsing ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {isParsing ? 'Extracting Text In-Memory...' : 'Upload PDF Document to Chat'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Drag and drop any PDF file. Text is extracted 100% locally in your browser memory for private AI analysis.
                </p>
              </div>

              {isParsing ? (
                <div className="w-full max-w-xs space-y-2 pt-2">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.round((parseProgress.current / Math.max(parseProgress.total, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Extracting Page {parseProgress.current} of {parseProgress.total}...
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    🔒 Zero Cloud Uploads
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                    ⚡ Instant PDF.js Parsing
                  </span>
                </div>
              )}

              {/* Try Demo Document Button */}
              {!isParsing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSampleDocument();
                  }}
                  className="mt-2 text-xs inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-4 py-2 min-h-[40px] rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try with Architecture Demo PDF</span>
                </button>
              )}
            </div>
          </div>

          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Interactive Chat Workspace */}
      {pdfContent && (
        <div className="space-y-4">
          {/* Document Header & Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                  {pdfContent.fileName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pdfContent.totalPages} Pages • {pdfContent.wordCount.toLocaleString()} words • {(pdfContent.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTextPreview(!showTextPreview)}
                className="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5"
                title="Inspect extracted text page by page"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showTextPreview ? 'Hide Text' : 'View Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5"
                title="Configure AI Model & API Key"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Engine:</span>
                <span className="text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                  {aiConfig.provider}
                </span>
              </button>

              <button
                type="button"
                onClick={exportChatHistory}
                disabled={messages.length <= 1}
                className="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 disabled:opacity-40"
                title="Export conversation history to markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Chat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPdfContent(null);
                  setFile(null);
                  setMessages([]);
                }}
                className="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-rose-200 dark:border-rose-900 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New PDF</span>
              </button>
            </div>
          </div>

          {/* Extracted Text Inspector Drawer (Collapsible) */}
          {showTextPreview && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Extracted Document Text (Page {activePreviewPage} of {pdfContent.totalPages})
                </span>
                <div className="flex items-center gap-1.5">
                  {pdfContent.pages.map((p) => (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => setActivePreviewPage(p.pageNumber)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                        activePreviewPage === p.pageNumber
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      P. {p.pageNumber}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {pdfContent.pages.find((p) => p.pageNumber === activePreviewPage)?.text || 'No text on this page.'}
              </div>
            </div>
          )}

          {/* 1-Click Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Quick Actions:
            </span>
            <button
              type="button"
              onClick={() => handleSendMessage('Summarize this document in a bullet-point executive summary.')}
              disabled={isGenerating}
              className="px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Summarize Document</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('What are the key takeaways, core findings, and conclusions?')}
              disabled={isGenerating}
              className="px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Key Takeaways</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('Extract all action items, tasks, and recommendations from this document.')}
              disabled={isGenerating}
              className="px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <ListOrdered className="w-3.5 h-3.5 text-emerald-500" />
              <span>Action Items</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('Generate a list of frequently asked questions (FAQs) and answers based on this text.')}
              disabled={isGenerating}
              className="px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              <span>Generate FAQs</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="h-[460px] md:h-[520px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isAssistant
                        ? m.isError
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                          : 'bg-indigo-600 text-white'
                        : 'bg-slate-800 dark:bg-slate-700 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-1.5 max-w-[85%] sm:max-w-[75%]`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? m.isError
                            ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                            : 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                        {m.text}
                      </div>

                      {/* Cited Page Badges */}
                      {m.referencedPages && m.referencedPages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 mt-2 text-[11px] text-slate-500">
                          <span className="font-semibold">References:</span>
                          {m.referencedPages.map((pg) => (
                            <span
                              key={pg}
                              className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
                            >
                              Page {pg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    <div
                      className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                        isAssistant ? '' : 'justify-end'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {isAssistant && (
                        <button
                          type="button"
                          onClick={() => copy(m.text, m.id)}
                          className="hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
                          title="Copy response"
                        >
                          {copiedKey === m.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedKey === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking / Generating Skeleton Indicator */}
            {isGenerating && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Synthesizing answer from document content...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* User Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              placeholder="Ask anything about this PDF document..."
              className="flex-1 px-4 py-3 min-h-[48px] text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="px-6 py-3 min-h-[48px] text-xs sm:text-sm font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      )}

      {/* AI Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          config={aiConfig}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

interface SettingsModalProps {
  config: AiConfig;
  onSave: (newConfig: AiConfig) => void;
  onClose: () => void;
}

function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      provider,
      apiKey,
      model,
      customEndpoint,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">AI Provider & Model Settings</h3>
              <p className="text-xs text-slate-500">Configure your preferred intelligence engine</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select AI Engine
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('local');
                  setModel('local-smart');
                }}
                className={`p-3 rounded-xl border text-xs text-center transition-all ${
                  provider === 'local'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="block font-bold">Local Smart</span>
                <span className="text-[10px] opacity-80">Free • 0 Setup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setModel('gemini-1.5-flash');
                }}
                className={`p-3 rounded-xl border text-xs text-center transition-all ${
                  provider === 'gemini'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="block font-bold">Google Gemini</span>
                <span className="text-[10px] opacity-80">Free API Key</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setModel('gpt-4o-mini');
                }}
                className={`p-3 rounded-xl border text-xs text-center transition-all ${
                  provider === 'openai'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="block font-bold">OpenAI / Groq</span>
                <span className="text-[10px] opacity-80">BYOK Pro</span>
              </button>
            </div>
          </div>

          {provider === 'local' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                100% In-Browser Extractive NLP
              </span>
              <p className="text-[11px] leading-relaxed">
                Processes document excerpts and summaries locally in your browser memory. Requires zero API keys and never communicates with external servers.
              </p>
            </div>
          )}

          {provider !== 'local' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>API Key</span>
                  {provider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-500 hover:underline inline-flex items-center gap-0.5"
                    >
                      Get Free Gemini Key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400">
                  🔒 Stored strictly in your browser local storage. Never transmitted to our servers.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {provider === 'openai' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Custom Endpoint URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="https://api.openai.com/v1/chat/completions"
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Compatible with OpenRouter, Groq, DeepSeek, and local Ollama proxies.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[40px] text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 min-h-[40px] text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
