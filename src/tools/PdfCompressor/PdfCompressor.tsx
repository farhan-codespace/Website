import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
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

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);

  // Compression presets: 'extreme' | 'recommended' | 'low'
  const [preset, setPreset] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    try {
      setErrorMessage(null);
      setCompressedSize(null);
      setDownloadBlobUrl(null);
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setOriginalSize(selectedFile.size);

      const buffer = await selectedFile.arrayBuffer();
      setArrayBuffer(buffer);

      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0), useSystemFonts: true }).promise;
      setTotalPages(pdf.numPages);
    } catch (err: any) {
      setErrorMessage('Failed to read PDF document.');
    }
  };

  const handleCompress = async () => {
    if (!arrayBuffer || totalPages === 0) return;

    try {
      setIsCompressing(true);
      setErrorMessage(null);

      const pdfjsLib = await getPdfJs();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0), useSystemFonts: true }).promise;

      // Quality & Scale settings based on preset
      let scale = 1.25;
      let quality = 0.72;

      if (preset === 'extreme') {
        scale = 0.9;
        quality = 0.55;
      } else if (preset === 'low') {
        scale = 1.8;
        quality = 0.88;
      }

      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setProgress({ current: i, total: pdfDoc.numPages });
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        const embeddedImage = await newPdf.embedJpg(jpegDataUrl);

        // Maintain original PDF aspect ratio
        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const compressedBytes = await newPdf.save();
      const bufferSlice = compressedBytes.buffer.slice(
        compressedBytes.byteOffset,
        compressedBytes.byteOffset + compressedBytes.byteLength
      );
      const blob = new Blob([bufferSlice as ArrayBuffer], { type: 'application/pdf' });
      setCompressedSize(blob.size);

      const downloadUrl = URL.createObjectURL(blob);
      setDownloadBlobUrl(downloadUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Compression failed. Please try another preset.');
    } finally {
      setIsCompressing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!downloadBlobUrl) return;
    const a = document.createElement('a');
    a.href = downloadBlobUrl;
    const cleanName = fileName.replace(/\.pdf$/i, '');
    a.download = `${cleanName}-compressed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const savingsPercent =
    compressedSize && originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

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
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Drop your PDF here to compress, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Reduce file size up to 80% directly in your browser. No files uploaded to servers.
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
                  {totalPages} pages • Original size: {formatBytes(originalSize)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setArrayBuffer(null);
                setCompressedSize(null);
                setDownloadBlobUrl(null);
              }}
              className="px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Choose Different PDF
            </button>
          </div>

          {/* Preset Selector */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Compression Level</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPreset('extreme')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  preset === 'extreme'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-sm text-slate-100">Extreme</span>
                <span className="block text-xs text-slate-400 mt-1">Maximum reduction for emailing or forms</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('recommended')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  preset === 'recommended'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-400'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block font-bold text-sm text-slate-100">Recommended</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">Popular</span>
                </div>
                <span className="block text-xs text-slate-400 mt-1">Ideal balance of clarity & small file size</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('low')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  preset === 'low'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-sm text-slate-100">Low Compression</span>
                <span className="block text-xs text-slate-400 mt-1">High quality, slight size reduction</span>
              </button>
            </div>

            {/* Action or Result Bar */}
            {!compressedSize ? (
              <button
                type="button"
                onClick={handleCompress}
                disabled={isCompressing}
                className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Compressing Page {progress?.current || 1} of {progress?.total || totalPages}...
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Compress PDF Now</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-300">
                      Reduced by {savingsPercent}% ({formatBytes(originalSize)} → {formatBytes(compressedSize)})
                    </p>
                    <p className="text-xs text-emerald-400/80">Ready for instant download</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
            )}
          </div>
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
