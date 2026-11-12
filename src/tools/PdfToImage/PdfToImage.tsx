import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles
} from 'lucide-react';
import { formatBytes } from '../ImageCompressor/utils';

let cachedPdfJs: any = null;
async function getPdfJs() {
  if (!cachedPdfJs) {
    cachedPdfJs = await import('pdfjs-dist');
    if (typeof window !== 'undefined') {
      try {
        cachedPdfJs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${cachedPdfJs.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      } catch {
        // fallback
      }
    }
  }
  return cachedPdfJs;
}

interface PageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);

  // Settings
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [scale, setScale] = useState<number>(2.0); // 2x DPR standard high-res
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    try {
      setErrorMessage(null);
      setPageImages([]);
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);

      const buffer = await selectedFile.arrayBuffer();
      setArrayBuffer(buffer);

      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0), useSystemFonts: true }).promise;
      setTotalPages(pdf.numPages);
    } catch (err: any) {
      setErrorMessage('Failed to load PDF document.');
    }
  };

  const handleConvert = async () => {
    if (!arrayBuffer || totalPages === 0) return;

    try {
      setIsConverting(true);
      setErrorMessage(null);
      setPageImages([]);

      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0), useSystemFonts: true }).promise;

      const converted: PageImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ current: i, total: pdf.numPages });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, 0.92);

        converted.push({
          pageNumber: i,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPageImages(converted);
    } catch (err: any) {
      setErrorMessage(err.message || 'Conversion failed.');
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  };

  const downloadSinglePage = (pageImg: PageImage) => {
    const cleanName = fileName.replace(/\.pdf$/i, '');
    const a = document.createElement('a');
    a.href = pageImg.dataUrl;
    a.download = `${cleanName}-page-${pageImg.pageNumber}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllPages = () => {
    pageImages.forEach((img, idx) => {
      setTimeout(() => downloadSinglePage(img), idx * 250);
    });
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Drop your PDF here to convert to Images, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Export each page as crystal-clear PNG, JPG, or WebP. 100% Client-Side.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm">{fileName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalPages} pages • {formatBytes(fileSize)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setArrayBuffer(null);
                setPageImages([]);
              }}
              className="px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Choose Different PDF
            </button>
          </div>

          {/* Options */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Image Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                        format === fmt
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400'
                          : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt === 'jpeg' ? 'JPG' : fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Resolution / Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Standard', value: 1.5 },
                    { label: '2x High Res', value: 2.0 },
                    { label: '3x Ultra HD', value: 3.0 },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setScale(s.value)}
                      className={`min-h-[44px] py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                        scale === s.value
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400'
                          : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Converting Page {progress?.current || 1} of {progress?.total || totalPages}...
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Convert {totalPages} Pages to {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>

          {/* Converted Previews */}
          {pageImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-sm font-bold text-slate-200">
                  {pageImages.length} Image{pageImages.length !== 1 ? 's' : ''} Ready
                </p>
                <button
                  type="button"
                  onClick={downloadAllPages}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All Images</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pageImages.map((img) => (
                  <div
                    key={img.pageNumber}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 group hover:border-indigo-500/50 transition-all shadow-md"
                  >
                    <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={img.dataUrl}
                        alt={`Page ${img.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-slate-300">Page {img.pageNumber}</span>
                      <button
                        type="button"
                        onClick={() => downloadSinglePage(img)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium flex items-center gap-1 transition-colors min-h-[36px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-400 hover:text-white">&times;</button>
        </div>
      )}
    </div>
  );
}
