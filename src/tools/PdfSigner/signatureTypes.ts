export type PlacedItemType = 'signature' | 'text' | 'date' | 'checkmark';

export interface PlacedItem {
  id: string;
  type: PlacedItemType;
  pageNumber: number; // 1-indexed
  x: number; // in pixels relative to viewport
  y: number; // in pixels relative to viewport
  width: number;
  height: number;
  canvasWidth: number; // reference canvas width
  canvasHeight: number; // reference canvas height
  dataUrl?: string; // For signature image (PNG with transparency)
  text?: string; // For text, date, checkmark
  color?: string; // Ink color (e.g. #0f172a, #1e40af)
  fontSize?: number;
  fontFamily?: string;
}

export type SignatureInkColor = '#0f172a' | '#1e40af' | '#047857';

export const INK_COLORS: { label: string; value: SignatureInkColor; ringColor: string }[] = [
  { label: 'Black Ink', value: '#0f172a', ringColor: 'ring-slate-900' },
  { label: 'Navy Blue Ink', value: '#1e40af', ringColor: 'ring-blue-700' },
  { label: 'Emerald Green', value: '#047857', ringColor: 'ring-emerald-700' },
];

export const TYPED_FONTS = [
  { id: 'caveat', name: 'Handwritten Script', css: "'Caveat', cursive" },
  { id: 'dancing', name: 'Elegant Cursive', css: "'Dancing Script', cursive" },
  { id: 'greatvibes', name: 'Classic Calligraphy', css: "'Great Vibes', cursive" },
  { id: 'serif-italic', name: 'Formal Italic', css: "Georgia, serif" },
];
