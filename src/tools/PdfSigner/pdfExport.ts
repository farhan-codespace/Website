import { PDFDocument } from 'pdf-lib';
import { PlacedItem } from './signatureTypes';

/**
 * Renders non-signature items (checkmark, text, date) to crisp transparent PNG data URLs
 * at high resolution (3x DPR) to avoid WinAnsi encoding issues with special characters in pdf-lib.
 */
export function renderItemToPng(item: PlacedItem): string {
  if (item.dataUrl) return item.dataUrl;

  const canvas = document.createElement('canvas');
  const dpr = 3; // 3x high resolution for sharp print output
  const w = Math.max(1, Math.round(item.width));
  const h = Math.max(1, Math.round(item.height));
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  if (item.type === 'checkmark') {
    ctx.strokeStyle = item.color || '#1e40af';
    ctx.lineWidth = Math.max(2.5, w * 0.12);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.52);
    ctx.lineTo(w * 0.42, h * 0.78);
    ctx.lineTo(w * 0.82, h * 0.22);
    ctx.stroke();
  } else {
    // text or date
    const fontSize = item.fontSize || 14;
    ctx.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = item.color || '#0f172a';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(item.text || '', 4, h / 2);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Creates an in-memory sample 1-page agreement for users to immediately test the signer
 * without needing an existing PDF on their device.
 */
export async function createDemoAgreementPdf(): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points
  const { width, height } = page.getSize();

  // Draw Header Banner
  page.drawRectangle({
    x: 40,
    y: height - 90,
    width: width - 80,
    height: 50,
    color: { type: 'RGB', red: 0.08, green: 0.12, blue: 0.18 } as any,
  });

  const titleFont = await pdfDoc.embedFont('Helvetica-Bold' as any);
  const bodyFont = await pdfDoc.embedFont('Helvetica' as any);

  page.drawText('STANDARD SERVICES & NON-DISCLOSURE AGREEMENT', {
    x: 55,
    y: height - 68,
    size: 13,
    font: titleFont,
    color: { type: 'RGB', red: 1, green: 1, blue: 1 } as any,
  });

  const agreementDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  page.drawText(`Effective Date: ${agreementDate}`, {
    x: 55,
    y: height - 120,
    size: 10,
    font: bodyFont,
    color: { type: 'RGB', red: 0.3, green: 0.35, blue: 0.4 } as any,
  });

  const lines = [
    '1. PARTIES & PURPOSE',
    'This Agreement is entered into between Client ("Disclosing Party") and Service Provider ("Recipient").',
    'Both parties agree to collaborate in good faith under local privacy and commercial laws.',
    '',
    '2. CONFIDENTIALITY & CLIENT-SIDE SECURITY',
    'Recipient warrants that all customer data, documents, and digital artifacts will be processed strictly',
    'client-side within local device memory. Zero telemetry or unencrypted data will be transmitted.',
    '',
    '3. TERMS OF ENGAGEMENT',
    'The services shall be performed diligently and in compliance with modern industry standards.',
    'Either party may terminate this agreement upon 30 days written notice.',
    '',
    '4. ACKNOWLEDGEMENT & EXECUTION',
    'By signing below, the parties acknowledge and approve the terms set forth herein.',
  ];

  let currentY = height - 150;
  for (const line of lines) {
    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
      currentY -= 8;
      page.drawText(line, {
        x: 55,
        y: currentY,
        size: 11,
        font: titleFont,
        color: { type: 'RGB', red: 0.1, green: 0.15, blue: 0.25 } as any,
      });
      currentY -= 18;
    } else if (line === '') {
      currentY -= 10;
    } else {
      page.drawText(line, {
        x: 55,
        y: currentY,
        size: 10,
        font: bodyFont,
        color: { type: 'RGB', red: 0.25, green: 0.28, blue: 0.32 } as any,
      });
      currentY -= 15;
    }
  }

  // Draw Signature Boxes
  const sigY = 130;
  // Box 1
  page.drawRectangle({
    x: 55,
    y: sigY,
    width: 220,
    height: 70,
    borderColor: { type: 'RGB', red: 0.8, green: 0.83, blue: 0.88 } as any,
    borderWidth: 1,
    color: { type: 'RGB', red: 0.98, green: 0.99, blue: 1.0 } as any,
  });
  page.drawText('Authorized Signature (Place your signature here)', {
    x: 60,
    y: sigY + 8,
    size: 7.5,
    font: bodyFont,
    color: { type: 'RGB', red: 0.5, green: 0.55, blue: 0.6 } as any,
  });

  // Box 2 (Date)
  page.drawRectangle({
    x: 310,
    y: sigY,
    width: 220,
    height: 70,
    borderColor: { type: 'RGB', red: 0.8, green: 0.83, blue: 0.88 } as any,
    borderWidth: 1,
    color: { type: 'RGB', red: 0.98, green: 0.99, blue: 1.0 } as any,
  });
  page.drawText('Date & Designation', {
    x: 315,
    y: sigY + 8,
    size: 7.5,
    font: bodyFont,
    color: { type: 'RGB', red: 0.5, green: 0.55, blue: 0.6 } as any,
  });

  // Footer note
  page.drawText('Generated for testing with PDF Toolkit Pro - 100% In-Browser Privacy Preserving Signature Engine', {
    x: 55,
    y: 40,
    size: 8,
    font: bodyFont,
    color: { type: 'RGB', red: 0.6, green: 0.65, blue: 0.7 } as any,
  });

  const bytes = await pdfDoc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * Loads the original PDF document, maps placed elements onto each target page
 * taking into account coordinate flips and aspect ratios, and triggers client-side download.
 */
export async function signAndExportPdf(
  originalBuffer: ArrayBuffer,
  items: PlacedItem[],
  originalFileName: string
): Promise<void> {
  const pdfDoc = await PDFDocument.load(originalBuffer);
  const pages = pdfDoc.getPages();

  for (const item of items) {
    const pageIdx = item.pageNumber - 1;
    if (pageIdx < 0 || pageIdx >= pages.length) continue;

    const page = pages[pageIdx];
    const { width: pdfW, height: pdfH } = page.getSize();

    // Canvas width & height used as viewport reference when placing
    const cw = item.canvasWidth > 0 ? item.canvasWidth : pdfW;
    const ch = item.canvasHeight > 0 ? item.canvasHeight : pdfH;

    const scaleX = pdfW / cw;
    const scaleY = pdfH / ch;

    const targetWidth = item.width * scaleX;
    const targetHeight = item.height * scaleY;
    const targetX = item.x * scaleX;
    // PDF coordinates have (0,0) at bottom-left, while canvas has (0,0) at top-left
    const targetY = pdfH - (item.y * scaleY) - targetHeight;

    const pngUrl = renderItemToPng(item);
    if (!pngUrl) continue;

    const embeddedImage = await pdfDoc.embedPng(pngUrl);
    page.drawImage(embeddedImage, {
      x: targetX,
      y: targetY,
      width: targetWidth,
      height: targetHeight,
    });
  }

  const modifiedBytes = await pdfDoc.save();
  const bufferSlice = modifiedBytes.buffer.slice(
    modifiedBytes.byteOffset,
    modifiedBytes.byteOffset + modifiedBytes.byteLength
  );
  const blob = new Blob([bufferSlice as ArrayBuffer], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  const cleanName = (originalFileName || 'document.pdf').replace(/\.pdf$/i, '');
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${cleanName}-signed.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
