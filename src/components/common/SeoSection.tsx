import React, { useState, useEffect } from 'react';
import { ChevronDown, ShieldCheck, Zap, CloudOff, HelpCircle, ChevronRight, Home } from 'lucide-react';
import { ToolMetadata } from '../../types';

interface SeoSectionProps {
  metadata: ToolMetadata;
}

export function SeoSection({ metadata }: SeoSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamically update document title, description, canonical link, and JSON-LD schemas
  useEffect(() => {
    // 1. Title & Meta Description
    document.title = `${metadata.name} — PDF Toolkit Pro`;
    
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', metadata.description);

    // 2. Canonical URL Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', metadata.canonicalUrl);

    // 3. OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${metadata.name} — PDF Toolkit Pro`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', metadata.description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', metadata.canonicalUrl);

    // 4. Dynamic Structured Schemas (FAQPage + WebApplication + BreadcrumbList)
    const existingScript = document.getElementById('dynamic-seo-schema');
    if (existingScript) existingScript.remove();

    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': metadata.name,
        'description': metadata.description,
        'url': metadata.canonicalUrl,
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'All modern web browsers (Chrome, Edge, Firefox, Safari)',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'featureList': metadata.steps.map((s) => s.title),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': metadata.faqs.map((faq) => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
          },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://pdf-toolkit-pro-eight.vercel.app/',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': metadata.shortName,
            'item': metadata.canonicalUrl,
          },
        ],
      },
    ];

    const script = document.createElement('script');
    script.id = 'dynamic-seo-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('dynamic-seo-schema');
      if (el) el.remove();
    };
  }, [metadata]);

  return (
    <div className="mt-16 space-y-12 border-t border-slate-200 dark:border-slate-800/80 pt-12">
      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </a>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">Tools</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{metadata.shortName}</span>
      </nav>

      {/* 1. How to use this tool in 3 steps (H2 Hierarchy) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Step-By-Step Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            How to Use {metadata.shortName} Online
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Fast, secure, and executed 100% locally in your browser memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metadata.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-colors"
            >
              <div className="text-4xl font-black text-indigo-100 dark:text-indigo-950/80 absolute -top-1 -right-1 pointer-events-none select-none">
                0{idx + 1}
              </div>
              <div className="relative space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Why Client-Side Processing Callout */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-slate-50 to-indigo-50/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border border-indigo-200/60 dark:border-indigo-900/50 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Security & Performance Architecture
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Why 100% Client-Side Processing Matters for Document Privacy
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Unlike legacy online converters that upload your confidential PDFs, contracts, and images to third-party cloud servers, PDF Toolkit Pro operates strictly inside your browser sandbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Zero Server Uploads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your legal documents and signatures never leave your device. Compliant with HIPAA, GDPR, and enterprise confidentiality policies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Zero Network Lag</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No waiting for upload queues or remote processing jobs. Operations begin immediately using your local hardware acceleration.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              <CloudOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Unlimited & Free Forever</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Because computing runs in client RAM rather than paid cloud server fleets, all tools are free without arbitrary file size caps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Frequently Asked Questions with FAQPage Schema (H2) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Answers & Clarifications
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Frequently Asked Questions about {metadata.shortName}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Everything you need to know about privacy, security, and document handling.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {metadata.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
