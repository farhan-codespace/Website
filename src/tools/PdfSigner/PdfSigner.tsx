import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  Upload,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Trash2,
  Type,
  Calendar,
  CheckSquare,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Move,
  Lock,
  Layers,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PlacedItem, SignatureInkColor, INK_COLORS } from './signatureTypes';
import { SignaturePadModal } from './SignaturePadModal';
import { signAndExportPdf, createDemoAgreementPdf } from './pdfExport';

let cachedPdfJs: any = null;
async function getPdfJs() {
  if (!cachedPdfJs) {
    cachedPdfJs = await import('pdfjs-dist');
    if (typeof window !== 'undefined') {
      try {
        cachedPdfJs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${cachedPdfJs.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      } catch {
        // inline worker fallback
      }
    }
  }
  return cachedPdfJs;
}

export function PdfSigner() {
  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('sample-agreement.pdf');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.2);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Placed annotations
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeInkColor, setActiveInkColor] = useState<SignatureInkColor>('#0f172a');

  // Canvas DOM references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Current canvas viewport size
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });

  // Dragging & Resizing tracking state
  const dragRef = useRef<{
    isDragging: boolean;
    isResizing: boolean;
    itemId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  }>({
    isDragging: false,
    isResizing: false,
    itemId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
  });

  // Load a file dropped or selected
  const handleFileUpload = async (uploadedFile: File) => {
    if (!uploadedFile.name.toLowerCase().endsWith('.pdf') && uploadedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    try {
      setIsLoadingPdf(true);
      setErrorMessage(null);
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      const buffer = await uploadedFile.arrayBuffer();
      setArrayBuffer(buffer);
      setItems([]);
      setCurrentPage(1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF file.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Load in-browser Demo Agreement
  const handleLoadDemo = async () => {
    try {
      setIsLoadingPdf(true);
      setErrorMessage(null);
      const demoBuffer = await createDemoAgreementPdf();
      setArrayBuffer(demoBuffer);
      setFile(null);
      setFileName('Demo-Service-Agreement.pdf');
      setItems([]);
      setCurrentPage(1);
    } catch (err: any) {
      setErrorMessage('Failed to generate demo agreement.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Render PDF page to HTML canvas
  const renderPage = useCallback(
    async (pageIndex: number) => {
      if (!arrayBuffer || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const pdfjsLib = await getPdfJs();
        if (!pdfDocRef.current || pdfDocRef.current.isDestroyed) {
          pdfDocRef.current = await pdfjsLib.getDocument({
            data: arrayBuffer.slice(0),
            useSystemFonts: true,
          }).promise;
          setTotalPages(pdfDocRef.current.numPages);
        }

        const page = await pdfDocRef.current.getPage(pageIndex);
        const viewport = page.getViewport({ scale: zoomScale });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setCanvasDimensions({ width: viewport.width, height: viewport.height });

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('PDF Render Error:', err);
        }
      }
    },
    [arrayBuffer, zoomScale]
  );

  useEffect(() => {
    if (arrayBuffer) {
      renderPage(currentPage);
    }
  }, [arrayBuffer, currentPage, zoomScale, renderPage]);

  // Handle adding signature from SignaturePadModal
  const handleSaveSignature = (dataUrl: string, originalW: number, originalH: number) => {
    const defaultWidth = Math.min(220, canvasDimensions.width * 0.4);
    const aspect = originalH / (originalW || 1);
    const defaultHeight = defaultWidth * (aspect || 0.45);

    const newItem: PlacedItem = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'signature',
      pageNumber: currentPage,
      x: Math.max(20, (canvasDimensions.width - defaultWidth) / 2),
      y: Math.max(20, (canvasDimensions.height - defaultHeight) / 2),
      width: Math.round(defaultWidth),
      height: Math.round(defaultHeight),
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      dataUrl,
      color: activeInkColor,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Handle adding text field
  const handleAddText = () => {
    const newItem: PlacedItem = {
      id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'text',
      pageNumber: currentPage,
      x: Math.max(20, (canvasDimensions.width - 180) / 2),
      y: Math.max(20, (canvasDimensions.height - 36) / 2),
      width: 180,
      height: 36,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      text: 'Full Legal Name',
      fontSize: 14,
      color: activeInkColor,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Handle adding formatted date
  const handleAddDate = () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const newItem: PlacedItem = {
      id: `date_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'date',
      pageNumber: currentPage,
      x: Math.max(20, (canvasDimensions.width - 150) / 2),
      y: Math.max(20, (canvasDimensions.height - 36) / 2),
      width: 150,
      height: 36,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      text: today,
      fontSize: 13,
      color: activeInkColor,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Handle adding checkmark
  const handleAddCheckmark = () => {
    const newItem: PlacedItem = {
      id: `check_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'checkmark',
      pageNumber: currentPage,
      x: Math.max(20, (canvasDimensions.width - 32) / 2),
      y: Math.max(20, (canvasDimensions.height - 32) / 2),
      width: 32,
      height: 32,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      color: activeInkColor,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Item deletion
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  // Pointer drag & resize handlers
  const onPointerDownItem = (e: React.PointerEvent, item: PlacedItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);

    dragRef.current = {
      isDragging: true,
      isResizing: false,
      itemId: item.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
      initialW: item.width,
      initialH: item.height,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerDownResize = (e: React.PointerEvent, item: PlacedItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);

    dragRef.current = {
      isDragging: false,
      isResizing: true,
      itemId: item.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
      initialW: item.width,
      initialH: item.height,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { isDragging, isResizing, itemId, startX, startY, initialX, initialY, initialW, initialH } =
      dragRef.current;
    if (!itemId || (!isDragging && !isResizing)) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;

        if (isDragging) {
          const newX = Math.max(0, Math.min(canvasDimensions.width - it.width, initialX + deltaX));
          const newY = Math.max(0, Math.min(canvasDimensions.height - it.height, initialY + deltaY));
          return { ...it, x: Math.round(newX), y: Math.round(newY) };
        }

        if (isResizing) {
          const newW = Math.max(40, Math.min(canvasDimensions.width - it.x, initialW + deltaX));
          const newH = Math.max(20, Math.min(canvasDimensions.height - it.y, initialH + deltaY));
          return { ...it, width: Math.round(newW), height: Math.round(newH) };
        }

        return it;
      })
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.itemId) {
      dragRef.current.isDragging = false;
      dragRef.current.isResizing = false;
      dragRef.current.itemId = null;
    }
  };

  // Download final signed PDF
  const handleExport = async () => {
    if (!arrayBuffer) return;
    try {
      setIsExporting(true);
      setErrorMessage(null);
      await signAndExportPdf(arrayBuffer, items, fileName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Current page items
  const currentPageItems = items.filter((it) => it.pageNumber === currentPage);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Zero CLS Header Ad Container */}
      <div id="ad-slot-header" className="min-h-[90px] w-full flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800/80 mb-6 overflow-hidden">
        <span className="text-xs font-mono tracking-wider text-slate-500 uppercase">Interactive PDF Workspace Sponsor</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <PenTool className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Digital PDF Signature & Form Filler
              </h1>
            </div>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Legally sign contracts, fill out PDF documents, and place digital ink stamps 100% locally in your browser. Zero cloud upload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side Privacy</span>
            </div>
            {!arrayBuffer && (
              <button
                onClick={handleLoadDemo}
                disabled={isLoadingPdf}
                className="min-h-[48px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try Demo Agreement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-400 hover:text-rose-200">
            &times;
          </button>
        </div>
      )}

      {/* Main Workspace */}
      {!arrayBuffer ? (
        /* Empty State / Upload Zone */
        <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-8 sm:p-14 text-center bg-slate-900/40 backdrop-blur-sm transition-all">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
            id="pdf-signer-upload"
          />
          <label htmlFor="pdf-signer-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
              {isLoadingPdf ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-100">Click to upload PDF or drag and drop</p>
              <p className="text-sm text-slate-400 mt-1">Supports standard PDF contracts, invoices, and legal forms</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Fast • Secure • No Server Transmission</span>
            </div>
          </label>

          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-sm text-slate-400">Don't have a PDF ready?</span>
            <button
              onClick={handleLoadDemo}
              disabled={isLoadingPdf}
              className="min-h-[48px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-indigo-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Load Sample Non-Disclosure Agreement</span>
            </button>
          </div>
        </div>
      ) : (
        /* Document Editor View */
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
            {/* File Info */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{fileName}</p>
                <p className="text-xs text-slate-400">
                  Page {currentPage} of {totalPages} • {items.length} annotation{items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-700/80 text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold px-2 text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-700/80 text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1">
              <button
                onClick={() => setZoomScale((z) => Math.max(0.7, z - 0.15))}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-700/80 text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-300">{Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.15))}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-700/80 text-slate-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomScale(1.2)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors text-xs"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>

            {/* Change File & Download Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setArrayBuffer(null);
                  setFile(null);
                  setItems([]);
                }}
                className="min-h-[48px] px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                Change PDF
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="min-h-[48px] px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Signed PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Toolbar for Adding Elements */}
          <div className="bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-3 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="min-h-[48px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <PenTool className="w-4 h-4" />
                <span>Add Signature</span>
              </button>
              <button
                onClick={handleAddText}
                className="min-h-[48px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Type className="w-4 h-4 text-indigo-400" />
                <span>Text Box</span>
              </button>
              <button
                onClick={handleAddDate}
                className="min-h-[48px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Date</span>
              </button>
              <button
                onClick={handleAddCheckmark}
                className="min-h-[48px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <span>Checkmark</span>
              </button>
            </div>

            {/* Ink Color Selector & Clear */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1.5 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Ink:</span>
                {INK_COLORS.map((col) => (
                  <button
                    key={col.value}
                    onClick={() => setActiveInkColor(col.value)}
                    className={`w-6 h-6 rounded-full border border-white/20 transition-all ${
                      activeInkColor === col.value ? 'scale-125 ring-2 ring-indigo-400' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col.value }}
                    title={col.label}
                  />
                ))}
              </div>

              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  className="min-h-[44px] px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition-colors flex items-center gap-1.5"
                  title="Clear all placed items"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Items</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Document Page Container */}
          <div
            ref={containerRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="w-full overflow-auto bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-8 flex items-center justify-center min-h-[600px] select-none"
          >
            <div
              className="relative shadow-2xl rounded-sm overflow-hidden bg-white"
              style={{
                width: canvasDimensions.width,
                height: canvasDimensions.height,
              }}
              onClick={() => setSelectedItemId(null)}
            >
              {/* PDF Background Canvas */}
              <canvas ref={canvasRef} className="block w-full h-full" />

              {/* Interactive SVG/HTML Placed Items Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {currentPageItems.map((item) => {
                  const isSelected = selectedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onPointerDown={(e) => onPointerDownItem(e, item)}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute pointer-events-auto cursor-move transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-transparent shadow-xl rounded-sm'
                          : 'hover:ring-1 hover:ring-indigo-400/60'
                      }`}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                      }}
                    >
                      {/* Signature Item */}
                      {item.type === 'signature' && item.dataUrl && (
                        <img
                          src={item.dataUrl}
                          alt="Signature"
                          className="w-full h-full object-contain pointer-events-none select-none"
                          draggable={false}
                        />
                      )}

                      {/* Checkmark Item */}
                      {item.type === 'checkmark' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full pointer-events-none">
                            <path
                              d="M5 13l4 4L19 7"
                              stroke={item.color || activeInkColor}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Text or Date Item */}
                      {(item.type === 'text' || item.type === 'date') && (
                        <input
                          type="text"
                          value={item.text || ''}
                          onChange={(e) => {
                            const newText = e.target.value;
                            setItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, text: newText } : it))
                            );
                          }}
                          className="w-full h-full bg-transparent border-none outline-none font-sans font-medium px-1 leading-none"
                          style={{
                            color: item.color || activeInkColor,
                            fontSize: `${item.fontSize || 14}px`,
                          }}
                        />
                      )}

                      {/* Active Item Action Handles */}
                      {isSelected && (
                        <>
                          {/* Delete Bubble */}
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Resize Handle (bottom right) */}
                          <div
                            onPointerDown={(e) => onPointerDownResize(e, item)}
                            className="absolute -bottom-2 -right-2 w-5 h-5 bg-indigo-600 hover:bg-indigo-500 border border-white rounded-full cursor-se-resize shadow-md flex items-center justify-center z-20"
                            title="Drag to resize"
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zero CLS Inline Ad Container */}
      <div id="ad-slot-inline" className="min-h-[100px] w-full flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800/80 my-8 overflow-hidden">
        <span className="text-xs font-mono tracking-wider text-slate-500 uppercase">Trusted Client Utilities Network</span>
      </div>

      {/* Educational & Features Section (AdSense High Content Quality Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">100% In-Browser Privacy</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your legal contracts, confidential NDAs, and signature graphics never leave your device memory. All embedding and cryptographic PDF operations occur within your browser's local sandbox.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <PenTool className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Smooth Touch & Stylus Ink</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Draw with a mouse, trackpad, touchscreen, or Apple Pencil / stylus. Quadratic curve smoothing ensures fluid, realistic signature strokes with standard legal ink tones.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Multi-Page Positioning</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Place multiple signatures, initial checkmarks, names, and date stamps across any page of multi-page agreements with precise coordinate mapping.
          </p>
        </div>
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSignature={handleSaveSignature}
      />
    </div>
  );
}
