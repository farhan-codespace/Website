import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { formatBytes } from '../ImageCompressor/utils';

interface MergeFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

export function PdfMerger() {
  const [items, setItems] = useState<MergeFileItem[]>([]);
  const [mergedFileName, setMergedFileName] = useState('merged-document.pdf');
  const [isMerging, setIsMerging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    const validFiles = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid PDF documents.');
      return;
    }

    setErrorMessage(null);
    setSuccessInfo(null);

    const newItems: MergeFileItem[] = [];
    for (const f of validFiles) {
      try {
        const buffer = await f.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          name: f.name,
          size: f.size,
          pageCount: pdf.getPageCount(),
          buffer,
        });
      } catch (err) {
        console.warn('Could not read PDF:', f.name);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    setSuccessInfo(null);
  };

  const handleMergePdf = async () => {
    if (items.length < 2) {
      setErrorMessage('Please upload at least 2 PDF documents to merge.');
      return;
    }

    try {
      setIsMerging(true);
      setErrorMessage(null);

      const mergedDoc = await PDFDocument.create();

      for (const item of items) {
        const srcDoc = await PDFDocument.load(item.buffer);
        const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }

      const mergedBytes = await mergedDoc.save();
      const bufferSlice = mergedBytes.buffer.slice(
        mergedBytes.byteOffset,
        mergedBytes.byteOffset + mergedBytes.byteLength
      );
      const blob = new Blob([bufferSlice as ArrayBuffer], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      const cleanName = mergedFileName.endsWith('.pdf') ? mergedFileName : `${mergedFileName}.pdf`;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      setSuccessInfo(`Successfully merged ${items.length} PDFs into ${cleanName}!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsMerging(false);
    }
  };

  const totalPages = items.reduce((acc, it) => acc + it.pageCount, 0);
  const totalSize = items.reduce((acc, it) => acc + it.size, 0);

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
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
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Drop multiple PDF files here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select 2 or more PDF documents. Files are processed 100% locally in browser memory.
            </p>
          </div>
        </div>
      </div>

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

      {/* File List & Controls */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {items.length} PDF Document{items.length !== 1 ? 's' : ''} Ready to Merge
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total: {totalPages} pages • {formatBytes(totalSize)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                + Add More PDFs
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* List of PDFs */}
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.pageCount} page{item.pageCount !== 1 ? 's' : ''} • {formatBytes(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Output Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Output File Name</label>
              <input
                type="text"
                value={mergedFileName}
                onChange={(e) => setMergedFileName(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleMergePdf}
              disabled={isMerging || items.length < 2}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isMerging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Merging {items.length} Documents...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Merge {items.length} PDFs Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
