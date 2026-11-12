export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface PdfDocumentContent {
  fileName: string;
  fileSize: number;
  totalPages: number;
  fullText: string;
  pages: ExtractedPage[];
  wordCount: number;
  charCount: number;
}

let cachedPdfJs: any = null;

async function getPdfJs() {
  if (!cachedPdfJs) {
    cachedPdfJs = await import('pdfjs-dist');
    if (typeof window !== 'undefined') {
      try {
        cachedPdfJs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${cachedPdfJs.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      } catch {
        // inline fallback
      }
    }
  }
  return cachedPdfJs;
}

/**
 * Extracts all text content from an ArrayBuffer of a PDF document using PDF.js.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfDocumentContent> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const pdfjsLib = await getPdfJs();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;
    const pages: ExtractedPage[] = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress(pageNum, totalPages);
      }

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pages.push({
        pageNumber: pageNum,
        text: pageText,
      });

      fullText += `\n\n--- Page ${pageNum} ---\n` + pageText;
    }

    const words = fullText.trim().split(/\s+/).filter(Boolean).length;
    const chars = fullText.length;

    return {
      fileName: file.name,
      fileSize: file.size,
      totalPages,
      fullText: fullText.trim(),
      pages,
      wordCount: words,
      charCount: chars,
    };
  } catch (err: any) {
    console.warn('PDF.js failed, attempting native text stream recovery:', err);
    return await fallbackExtractPdfText(file, arrayBuffer);
  }
}

/**
 * Fallback lightweight text recovery directly parsing PDF operators if PDF.js encounters worker issues.
 */
async function fallbackExtractPdfText(file: File, arrayBuffer: ArrayBuffer): Promise<PdfDocumentContent> {
  const uint8 = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(uint8);

  const textSnippets: string[] = [];
  // Match text in parentheses followed by Tj or inside TJ arrays [(...)] TJ
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(rawString)) !== null) {
    if (match[1] && match[1].trim()) {
      textSnippets.push(match[1]);
    }
  }

  // Also match text in array brackets [ (Hello) -20 (World) ] TJ
  const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = arrayTjRegex.exec(rawString)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^)]+)\)/g);
    if (subMatches) {
      subMatches.forEach((s) => {
        const cleaned = s.slice(1, -1).trim();
        if (cleaned) textSnippets.push(cleaned);
      });
    }
  }

  const recoveredText = textSnippets.join(' ').replace(/\\([()\\])/g, '$1');
  const pages: ExtractedPage[] = [
    {
      pageNumber: 1,
      text: recoveredText || 'Text could not be extracted (document may be scanned or encrypted).',
    },
  ];

  const words = recoveredText.trim().split(/\s+/).filter(Boolean).length;

  return {
    fileName: file.name,
    fileSize: file.size,
    totalPages: 1,
    fullText: recoveredText || 'No selectable text found. If this is a scanned PDF, optical character recognition (OCR) may be required.',
    pages,
    wordCount: words,
    charCount: recoveredText.length,
  };
}
