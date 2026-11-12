import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Type, Eraser, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { SignatureInkColor, INK_COLORS, TYPED_FONTS } from './signatureTypes';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string, width: number, height: number) => void;
}

export function SignaturePadModal({ isOpen, onClose, onSaveSignature }: SignaturePadModalProps) {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [selectedColor, setSelectedColor] = useState<SignatureInkColor>('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  
  // Typed mode state
  const [typedName, setTypedName] = useState('Jane Doe');
  const [selectedFont, setSelectedFont] = useState(TYPED_FONTS[0].id);

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef<{ x: number; y: number }[][]>([]);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  if (!isOpen) return null;

  // Initialize canvas with high DPR
  useEffect(() => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    redrawCanvas();
  }, [mode]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth;

    strokesRef.current.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        // Use smooth midpoint quadratic curves
        const midX = (stroke[i - 1].x + stroke[i].x) / 2;
        const midY = (stroke[i - 1].y + stroke[i].y) / 2;
        ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, midX, midY);
      }
      ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
      ctx.stroke();
    });
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    currentStrokeRef.current = [{ x, y }];
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth;

    const stroke = currentStrokeRef.current;
    if (stroke.length > 2) {
      const p1 = stroke[stroke.length - 2];
      const p2 = stroke[stroke.length - 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
    redrawCanvas();
  };

  const clearCanvas = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    redrawCanvas();
  };

  const undoLastStroke = () => {
    strokesRef.current.pop();
    redrawCanvas();
  };

  // Convert typed name into high-resolution transparent PNG
  const renderTypedSignature = (): { dataUrl: string; width: number; height: number } => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 600;
    offscreen.height = 200;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return { dataUrl: '', width: 160, height: 60 };

    const fontObj = TYPED_FONTS.find((f) => f.id === selectedFont) || TYPED_FONTS[0];
    ctx.font = `64px ${fontObj.css}`;
    ctx.fillStyle = selectedColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signature', 300, 100);

    return {
      dataUrl: offscreen.toDataURL('image/png'),
      width: 180,
      height: 65,
    };
  };

  const handleSave = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || strokesRef.current.length === 0) {
        alert('Please draw your signature first.');
        return;
      }
      // Export high-resolution transparent PNG
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl, 160, 70);
    } else {
      if (!typedName.trim()) {
        alert('Please enter your name to generate a signature.');
        return;
      }
      const rendered = renderTypedSignature();
      onSaveSignature(rendered.dataUrl, rendered.width, rendered.height);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative text-slate-800 dark:text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Create Your Digital Signature
              </h3>
              <p className="text-xs text-slate-500">
                100% In-Browser • Never stored on any server
              </p>
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

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 ${
                mode === 'draw'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw Signature</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('type')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 ${
                mode === 'type'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Type Handwritten Signature</span>
            </button>
          </div>

          {/* Color & Style Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Ink Color:</span>
              <div className="flex items-center gap-1.5">
                {INK_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => {
                      setSelectedColor(col.value);
                      if (mode === 'draw') redrawCanvas();
                    }}
                    title={col.label}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor === col.value
                        ? 'border-indigo-500 scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.value }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width or Font Controls */}
            {mode === 'draw' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Width:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                  {[2, 3.5, 5].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setStrokeWidth(w);
                        redrawCanvas();
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                        strokeWidth === w
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {w === 2 ? 'Fine' : w === 3.5 ? 'Medium' : 'Bold'}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Draw Canvas Area */}
          {mode === 'draw' ? (
            <div className="space-y-2">
              <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 overflow-hidden touch-none select-none">
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  className="w-full h-full cursor-crosshair"
                />

                <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sign with stylus, finger touch, or mouse</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={undoLastStroke}
                  className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 inline-flex items-center gap-1 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          ) : (
            /* Type Signature Mode */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Type Your Full Name / Initials
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 min-h-[48px] text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Font Style Selector Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Handwritten Script Style
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TYPED_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        selectedFont === font.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50 dark:bg-slate-900/60'
                      }`}
                    >
                      <div
                        className="text-2xl sm:text-3xl py-1 truncate"
                        style={{ fontFamily: font.css, color: selectedColor }}
                      >
                        {typedName || 'Signature'}
                      </div>
                      <span className="text-[10px] text-slate-400 block pt-1">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-950/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 min-h-[44px] text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
}
