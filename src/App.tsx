import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdSlot } from './components/layout/AdSlot';
import { SeoSection } from './components/common/SeoSection';
import { AffiliateBanner } from './components/common/AffiliateBanner';
import { TipJarModal } from './components/common/TipJarModal';
import { CookieConsent } from './components/common/CookieConsent';

import { PrivacyPolicyModal } from './components/legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/legal/TermsOfServiceModal';
import { ContactUsModal } from './components/legal/ContactUsModal';
import { AboutUsModal } from './components/legal/AboutUsModal';

import { ImageCompressor } from './tools/ImageCompressor/ImageCompressor';
import { PdfConverter } from './tools/PdfConverter/PdfConverter';
import { PdfChat } from './tools/PdfChat/PdfChat';
import { QrCodeGenerator } from './tools/QrCodeGenerator/QrCodeGenerator';
import { MarkdownEditor } from './tools/MarkdownEditor/MarkdownEditor';
import { SocialTagGenerator } from './tools/SocialTagGenerator/SocialTagGenerator';
import { DeveloperFormatter } from './tools/DeveloperFormatter/DeveloperFormatter';
import { FreelanceCalculator } from './tools/FreelanceCalculator/FreelanceCalculator';
import { PdfSigner } from './tools/PdfSigner/PdfSigner';
import { PdfMerger } from './tools/PdfMerger/PdfMerger';
import { PdfSplitter } from './tools/PdfSplitter/PdfSplitter';
import { PdfCompressor } from './tools/PdfCompressor/PdfCompressor';
import { PdfToImage } from './tools/PdfToImage/PdfToImage';
import { TrustBadge } from './components/common/TrustBadge';

import { ToolId } from './types';
import { TOOLS_METADATA } from './utils/seoData';
import { useTheme } from './hooks/useTheme';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'contact' | 'about' | null;

function resolveToolFromUrl(): ToolId {
  if (typeof window === 'undefined') return 'merge-pdf';
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const target = path || hash;

  if (target === 'merge-pdf' || target === 'merge' || target === 'combine-pdf') return 'merge-pdf';
  if (target === 'split-pdf' || target === 'split' || target === 'extract-pdf') return 'split-pdf';
  if (target === 'compress-pdf' || target === 'compress') return 'compress-pdf';
  if (target === 'pdf-to-image' || target === 'pdf2img' || target === 'pdf-to-png') return 'pdf-to-image';
  if (target === 'pdf-signer' || target === 'sign-pdf' || target === 'sign') return 'pdf-signer';
  if (target === 'chat-pdf' || target === 'chat') return 'chat-pdf';
  if (target === 'pdf-converter' || target === 'image-to-pdf' || target === 'img2pdf') return 'pdf-converter';
  if (target === 'image-compressor' || target === 'compress-image' || target === 'webp-converter') return 'image-compressor';
  if (target === 'qr-generator' || target === 'qr') return 'qr-generator';
  if (target === 'markdown-editor' || target === 'markdown') return 'markdown-editor';
  if (target === 'social-meta-tags' || target === 'social') return 'social-meta-tags';
  if (target === 'developer-tools' || target === 'json-tools') return 'developer-tools';
  if (target === 'freelance-calculator' || target === 'calculator') return 'freelance-calculator';

  if (TOOLS_METADATA[target as ToolId]) return target as ToolId;
  return 'merge-pdf';
}

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const [showDemoAds, setShowDemoAds] = useState(true);
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  // Distinct pushState and hash routing supporting direct landing URLs (/merge-pdf, /split-pdf, /compress-pdf, etc.)
  const [activeTool, setActiveTool] = useState<ToolId>(() => resolveToolFromUrl());

  // Listen to navigation events (supports browser back/forward and hash changes)
  useEffect(() => {
    const handleNavigation = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      if (rawHash === 'privacy') {
        setActiveModal('privacy');
      } else if (rawHash === 'terms') {
        setActiveModal('terms');
      } else if (rawHash === 'contact') {
        setActiveModal('contact');
      } else if (rawHash === 'about') {
        setActiveModal('about');
      } else {
        setActiveTool(resolveToolFromUrl());
      }
    };

    handleNavigation();

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  const handleSelectTool = (id: ToolId) => {
    setActiveTool(id);
    try {
      window.history.pushState(null, '', `/${id}`);
    } catch {
      window.location.hash = id;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModal = (type: 'privacy' | 'terms' | 'about' | 'contact') => {
    setActiveModal(type);
    window.location.hash = type;
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    try {
      window.history.pushState(null, '', `/${activeTool}`);
    } catch {
      window.location.hash = activeTool;
    }
  };

  const handleShowToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => {
      setGlobalToast(null);
    }, 4000);
  };

  const currentMetadata = TOOLS_METADATA[activeTool];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Global Toast Alert */}
      {globalToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{globalToast}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        showDemoAds={showDemoAds}
        onToggleDemoAds={() => setShowDemoAds(!showDemoAds)}
        onOpenModal={handleOpenModal}
        onOpenContact={() => handleOpenModal('contact')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Banner Ad Slot: Below Header (id="ad-slot-header", min-height 90px) */}
        <AdSlot type="header" showDemoContent={showDemoAds} />

        {/* Hero Section */}
        <section className="text-center py-6 sm:py-8 max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>100% In-Browser Execution • $0 Server Footprint</span>
            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Server Uploads
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {currentMetadata.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {currentMetadata.tagline}
          </p>
        </section>

        {/* Prominent Client-Side Security Trust Badge */}
        <div className="max-w-5xl mx-auto mb-6">
          <TrustBadge variant="prominent" />
        </div>

        {/* Main Tool View Container */}
        <div className="w-full max-w-5xl mx-auto">
          {activeTool === 'merge-pdf' && <PdfMerger />}
          {activeTool === 'split-pdf' && <PdfSplitter />}
          {activeTool === 'compress-pdf' && <PdfCompressor />}
          {activeTool === 'pdf-to-image' && <PdfToImage />}
          {activeTool === 'pdf-signer' && <PdfSigner />}
          {activeTool === 'chat-pdf' && <PdfChat />}
          {activeTool === 'pdf-converter' && <PdfConverter />}
          {activeTool === 'image-compressor' && <ImageCompressor />}
          {activeTool === 'qr-generator' && <QrCodeGenerator />}
          {activeTool === 'markdown-editor' && <MarkdownEditor />}
          {activeTool === 'social-meta-tags' && <SocialTagGenerator />}
          {activeTool === 'developer-tools' && <DeveloperFormatter />}
          {activeTool === 'freelance-calculator' && <FreelanceCalculator />}
        </div>

        {/* In-Content Ad Slot: Below the conversion action button (id="ad-slot-inline", min-height 250px) */}
        <div className="max-w-5xl mx-auto">
          <AdSlot type="inline" showDemoContent={showDemoAds} />
        </div>

        {/* Keyword-Rich Crawlable SEO Section (How-to, FAQs, JSON-LD Schema) */}
        <div className="max-w-5xl mx-auto">
          <SeoSection metadata={currentMetadata} />
        </div>

        {/* Affiliate & Creator Tools Banner */}
        <div className="max-w-5xl mx-auto">
          <AffiliateBanner />
        </div>

        {/* Bottom Ad Slot: Above Footer (id="ad-slot-footer", min-height 90px) */}
        <AdSlot type="footer" showDemoContent={showDemoAds} />
      </main>

      {/* Modern 3-Column Footer with Trust Badge & Modal Links */}
      <Footer
        onSelectTool={handleSelectTool}
        onOpenModal={handleOpenModal}
      />

      {/* Floating Sticky Tip Jar / Buy Me a Coffee */}
      <TipJarModal />

      {/* GDPR / AdSense Cookie Consent Banner */}
      <CookieConsent onOpenPrivacy={() => handleOpenModal('privacy')} />

      {/* Dedicated Legal & Trust Modals */}
      <PrivacyPolicyModal
        isOpen={activeModal === 'privacy'}
        onClose={handleCloseModal}
      />

      <TermsOfServiceModal
        isOpen={activeModal === 'terms'}
        onClose={handleCloseModal}
      />

      <ContactUsModal
        isOpen={activeModal === 'contact'}
        onClose={handleCloseModal}
        onShowToast={handleShowToast}
      />

      <AboutUsModal
        isOpen={activeModal === 'about'}
        onClose={handleCloseModal}
      />
    </div>
  );
}
