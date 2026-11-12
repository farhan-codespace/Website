import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { formatBytes } from '../ImageCompressor/utils';

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);

  // Split mode: 'range' | 'all'
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [pageRange, setPageRange] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessInfo(null);
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);

      const buffer = await selectedFile.arrayBuffer();
      setArrayBuffer(buffer);

      const pdf = await PDFDocument.load(buffer);
      const pages = pdf.getPageCount();
      setTotalPages(pages);
      setPageRange(pages > 1 ? `1-${Math.min(3, pages)}` : '1');
    } catch (err: any) {
      setErrorMessage('Failed to load PDF document. Please verify the file is not encrypted.');
    }
  };

  // Helper to parse page range string like "1-3, 5, 8-10" into 0-indexed page numbers
  const parseRangeIndices = (rangeStr: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(/[,;\s]+/).filter(Boolean);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(maxPages, Math.max(start, end));
          for (let p = from; p <= to; p++) {
            indices.add(p - 1);
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          indices.add(pageNum - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplitPdf = async () => {
    if (!arrayBuffer || totalPages === 0) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const srcPdf = await PDFDocument.load(arrayBuffer);

      if (splitMode === 'range') {
        const targetIndices = parseRangeIndices(pageRange, totalPages);
        if (targetIndices.length === 0) {
          setErrorMessage(`Invalid page range. Please enter valid pages between 1 and ${totalPages}.`);
          setIsProcessing(false);
          return;
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(srcPdf, targetIndices);
        copiedPages.forEach((p) => newPdf.addPage(p));

        const newPdfBytes = await newPdf.save();
        const bufferSlice = newPdfBytes.buffer.slice(
          newPdfBytes.byteOffset,
          newPdfBytes.byteOffset + newPdfBytes.byteLength
        );
        const blob = new Blob([bufferSlice as ArrayBuffer], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        const baseName = fileName.replace(/\.pdf$/i, '');
        a.download = `${baseName}-extracted-p${pageRange.replace(/[\s,]+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        setSuccessInfo(`Successfully extracted ${targetIndices.length} page(s) into your new PDF!`);
      } else {
        // Extract each page as individual PDF
        for (let i = 0; i < totalPages; i++) {
          const singlePdf = await PDFDocument.create();
          const [copiedPage] = await singlePdf.copyPages(srcPdf, [i]);
          singlePdf.addPage(copiedPage);

          const bytes = await singlePdf.save();
          const bufferSlice = bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength
          );
          const blob = new Blob([bufferSlice as ArrayBuffer], { type: 'application/pdf' });
          const downloadUrl = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = downloadUrl;
          const baseName = fileName.replace(/\.pdf$/i, '');
          a.download = `${baseName}-page-${i + 1}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        }
        setSuccessInfo(`Successfully exported all ${totalPages} individual PDF pages!`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
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
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Drop your PDF here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Extract page ranges or split into separate single-page documents.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Document Loaded Controls */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm">
                  {fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalPages} total pages • {formatBytes(fileSize)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setArrayBuffer(null);
                setSuccessInfo(null);
              }}
              className="px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Choose Different PDF
            </button>
          </div>

          {/* Split Settings */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Split Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSplitMode('range')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  splitMode === 'range'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-sm text-slate-100">Extract Specific Pages</span>
                <span className="block text-xs text-slate-400 mt-1">
                  Extract custom pages or ranges into a single merged output file.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  splitMode === 'all'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-sm text-slate-100">Split All Pages</span>
                <span className="block text-xs text-slate-400 mt-1">
                  Export each page as an individual standalone PDF file.
                </span>
              </button>
            </div>

            {splitMode === 'range' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Page Range (1 to {totalPages})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                  <div className="text-xs text-slate-400">
                    Example: <span className="font-mono text-indigo-400">1-{Math.min(totalPages, 3)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSplitPdf}
                disabled={isProcessing}
                className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Document Pages...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{splitMode === 'range' ? 'Extract & Download PDF' : 'Download All Pages'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-400 hover:text-white">&times;</button>
        </div>
      )}

      {successInfo && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}
    </div>
  );
}
