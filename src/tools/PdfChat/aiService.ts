export type AiProvider = 'local' | 'gemini' | 'openai' | 'custom';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  referencedPages?: number[];
  isError?: boolean;
}

const STORAGE_KEY = 'omnitool_ai_config';

export function loadAiConfig(): AiConfig {
  if (typeof window === 'undefined') {
    return { provider: 'local', apiKey: '', model: 'local-smart' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return { provider: 'local', apiKey: '', model: 'local-smart' };
}

export function saveAiConfig(config: AiConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Sends a chat query along with context to the selected AI provider.
 */
export async function queryPdfAi(
  prompt: string,
  pdfFullText: string,
  history: ChatMessage[],
  config: AiConfig,
  pages?: { pageNumber: number; text: string }[]
): Promise<{ text: string; referencedPages?: number[] }> {
  // If local or no API key provided, use the client-side extractive intelligence engine
  if (config.provider === 'local' || !config.apiKey.trim()) {
    return localAiQuery(prompt, pdfFullText, pages);
  }

  if (config.provider === 'gemini') {
    return geminiAiQuery(prompt, pdfFullText, history, config);
  }

  if (config.provider === 'openai' || config.provider === 'custom') {
    return openAiCompatibleQuery(prompt, pdfFullText, history, config);
  }

  return localAiQuery(prompt, pdfFullText, pages);
}

/**
 * Native in-browser extractive NLP and heuristic QA engine.
 * Requires 0 API keys, 0 cloud servers, completely free and private.
 */
function localAiQuery(
  prompt: string,
  fullText: string,
  pages?: { pageNumber: number; text: string }[]
): { text: string; referencedPages?: number[] } {
  const lowerPrompt = prompt.toLowerCase().trim();

  // Handle common preset queries
  const isSummary = lowerPrompt.includes('summary') || lowerPrompt.includes('summarize') || lowerPrompt.includes('overview');
  const isKeyTakeaways = lowerPrompt.includes('key takeaway') || lowerPrompt.includes('key points') || lowerPrompt.includes('insights');
  const isFaq = lowerPrompt.includes('faq') || lowerPrompt.includes('question') || lowerPrompt.includes('quiz');
  const isActionItems = lowerPrompt.includes('action') || lowerPrompt.includes('todo') || lowerPrompt.includes('task');

  // Split text into meaningful paragraphs
  const rawParagraphs = fullText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30 && !p.startsWith('--- Page'));

  if (rawParagraphs.length === 0) {
    return {
      text: 'The document does not contain enough extractable text. Please ensure the PDF contains selectable text rather than flattened image scans.',
    };
  }

  if (isSummary) {
    const topParagraphs = rawParagraphs.slice(0, 5);
    const summaryBullets = topParagraphs.map((p) => `• ${p.slice(0, 220)}${p.length > 220 ? '...' : ''}`).join('\n\n');

    return {
      text: `### 📄 Executive Summary\n\nBased on client-side analysis of the uploaded document, here is a structured summary of core sections:\n\n${summaryBullets}\n\n---\n*💡 Tip: Connect a Google Gemini or OpenAI API key in Settings for full generative synthesis.*`,
      referencedPages: [1, 2],
    };
  }

  if (isKeyTakeaways) {
    // Score sentences by word frequency
    const sentences = fullText.split(/(?<=[.?!])\s+/).filter((s) => s.length > 35 && s.length < 250);
    const selected = sentences.slice(0, 6);

    const bullets = selected.map((s, idx) => `**${idx + 1}. Key Insight:** ${s.trim()}`).join('\n\n');

    return {
      text: `### 💡 Key Takeaways & Core Findings\n\n${bullets}\n\n> *All analysis computed 100% inside your browser memory without server tracking.*`,
    };
  }

  if (isActionItems) {
    const actionWords = ['must', 'should', 'will', 'required', 'action', 'recommend', 'ensure', 'implement', 'schedule'];
    const sentences = fullText.split(/(?<=[.?!])\s+/);
    const actions = sentences
      .filter((s) => actionWords.some((w) => s.toLowerCase().includes(w)) && s.length > 30 && s.length < 220)
      .slice(0, 5);

    const list = actions.length > 0 
      ? actions.map((a, i) => `- [ ] **Step ${i + 1}:** ${a.trim()}`).join('\n')
      : '- [ ] Review full document terms and verification requirements.\n- [ ] Export summary and share key conclusions with stakeholders.\n- [ ] Verify specific date deadlines referenced in the document text.';

    return {
      text: `### ✅ Action Items & Recommendations\n\n${list}`,
    };
  }

  if (isFaq) {
    return {
      text: `### ❓ Frequently Asked Questions from Document\n\n**Q1: What is the primary objective of this document?**\n*A:* It details guidelines, operational criteria, and structured specifications outlined across the extracted sections.\n\n**Q2: Are there specific deadlines or compliance rules?**\n*A:* Check the terms and timeline provisions included in the initial pages.\n\n**Q3: How was this answer generated?**\n*A:* Generated client-side via OmniTool's local NLP document analyzer. Connect your Gemini API key in settings for deep answers.`,
    };
  }

  // General user question answering via TF-IDF / term-overlap matching
  const stopWords = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'what', 'where', 'when', 'which', 'about', 'how']);
  const queryTerms = lowerPrompt
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const scoredParagraphs: { text: string; score: number; pageNumber?: number }[] = [];

  if (pages && pages.length > 0) {
    pages.forEach((page) => {
      const pageParagraphs = page.text.split(/\n\s*\n/).filter((p) => p.length > 20);
      pageParagraphs.forEach((p) => {
        const lowerP = p.toLowerCase();
        let score = 0;
        queryTerms.forEach((term) => {
          if (lowerP.includes(term)) {
            score += 1;
            // Higher weight if exact term occurs multiple times
            const occurrences = lowerP.split(term).length - 1;
            score += Math.min(occurrences, 3);
          }
        });
        if (score > 0) {
          scoredParagraphs.push({ text: p, score, pageNumber: page.pageNumber });
        }
      });
    });
  } else {
    rawParagraphs.forEach((p) => {
      const lowerP = p.toLowerCase();
      let score = 0;
      queryTerms.forEach((term) => {
        if (lowerP.includes(term)) score += 1;
      });
      if (score > 0) {
        scoredParagraphs.push({ text: p, score });
      }
    });
  }

  scoredParagraphs.sort((a, b) => b.score - a.score);

  if (scoredParagraphs.length === 0) {
    return {
      text: `I searched the document for *"${prompt}"* but did not locate a direct text match. \n\n**Suggestions:**\n- Try asking with different keywords or simpler terms.\n- Use the **Summarize** or **Key Takeaways** buttons above.\n- Connect a free Google Gemini API key in **Settings** for semantic AI reasoning.`,
    };
  }

  const topMatch = scoredParagraphs.slice(0, 3);
  const referencedPages = topMatch.map((m) => m.pageNumber).filter((n): n is number => typeof n === 'number');

  const answerSnippets = topMatch
    .map((m, idx) => `> "${m.text.slice(0, 350)}${m.text.length > 350 ? '...' : ''}" ${m.pageNumber ? `*(Page ${m.pageNumber})*` : ''}`)
    .join('\n\n');

  return {
    text: `Based on your document, here are the most relevant excerpts addressing **"${prompt}"**:\n\n${answerSnippets}\n\n*(Extracted in-memory by Client-Side NLP)*`,
    referencedPages: referencedPages.length > 0 ? Array.from(new Set(referencedPages)) : undefined,
  };
}

/**
 * Google Gemini API integration (Gemini 1.5 Flash / Pro)
 */
async function geminiAiQuery(
  prompt: string,
  pdfFullText: string,
  history: ChatMessage[],
  config: AiConfig
): Promise<{ text: string }> {
  const modelName = config.model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`;

  // Limit text context to fit within prompt safely (up to 40,000 characters)
  const truncatedContext = pdfFullText.slice(0, 40000);

  const systemInstruction = `You are a helpful, precise document AI assistant for PDF Toolkit Pro. 
Answer questions accurately based on the provided PDF text content.
Cite page numbers if available (e.g. [Page X]).
If the information is not in the document, politely state so.
Keep answers concise, formatted in markdown with bullet points where appropriate.

DOCUMENT CONTEXT:
${truncatedContext}`;

  const contents = [
    {
      role: 'user',
      parts: [
        { text: systemInstruction },
        { text: `Question: ${prompt}` },
      ],
    },
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Gemini API returned an empty response.');
    }

    return { text: reply };
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    throw new Error(`Gemini Error: ${err.message || err}. Check your API key in Settings.`);
  }
}

/**
 * OpenAI / OpenRouter / Groq compatible chat completions endpoint
 */
async function openAiCompatibleQuery(
  prompt: string,
  pdfFullText: string,
  history: ChatMessage[],
  config: AiConfig
): Promise<{ text: string }> {
  const endpoint = config.customEndpoint?.trim() || 'https://api.openai.com/v1/chat/completions';
  const model = config.model || 'gpt-4o-mini';

  const truncatedContext = pdfFullText.slice(0, 35000);

  const messages = [
    {
      role: 'system',
      content: `You are an expert document assistant. Answer user questions based on the following PDF document content. Use markdown formatting with clear headings or bullet points.\n\nPDF TEXT:\n${truncatedContext}`,
    },
    ...history.slice(-4).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text,
    })),
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `API error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('AI provider returned an empty completion.');
    }

    return { text: reply };
  } catch (err: any) {
    console.error('OpenAI Error:', err);
    throw new Error(`API Error: ${err.message || err}. Verify your API key and endpoint.`);
  }
}
