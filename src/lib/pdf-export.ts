import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { computeA4Pagination } from './trial-report';

export async function exportElementToA4Pdf(
  element: HTMLElement,
  fileName: string
): Promise<{ pageCount: number; fileName: string }> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không thể tạo ảnh A4 để xuất PDF.'));
    image.src = dataUrl;
  });

  const plan = computeA4Pagination(img.naturalWidth, img.naturalHeight);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let pageIdx = 0; pageIdx < plan.pageCount; pageIdx += 1) {
    if (pageIdx > 0) {
      pdf.addPage();
    }
    const yOffsetMm = -(pageIdx * plan.a4HeightMm);
    pdf.addImage(
      dataUrl,
      'PNG',
      0,
      yOffsetMm,
      plan.a4WidthMm,
      plan.scaledHeightMm,
      undefined,
      'FAST'
    );
  }

  pdf.save(fileName);
  return { pageCount: plan.pageCount, fileName };
}
