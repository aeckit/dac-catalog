import { createMemo } from 'solid-js';
import { solveDocumentGeometry } from '@aeckit/dac-json-solver';
import { renderSolvedGroups, getDefs, getStyles } from '@aeckit/dac-renderer-svg';

export interface ThumbnailViewerProps {
  doc: any;
  nestedDocs?: Map<string, any>;
  class?: string;
}

export function ThumbnailViewer(props: ThumbnailViewerProps) {
  const thumbnailSvg = createMemo(() => {
    try {
      const doc = props.doc;
      if (!doc || !Array.isArray(doc.geometry)) {
        return '';
      }

      const resolver = (id: string) => props.nestedDocs?.get(id);
      const groups = solveDocumentGeometry(doc, 1, {}, 0, resolver);
      const geometries = renderSolvedGroups(groups, 1, 0, false);

      // Compute bounding box
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let hasPoints = false;

      const includePoint = (x: number, y: number) => {
        if (!isNaN(x) && !isNaN(y)) {
          hasPoints = true;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      };

      for (const group of groups) {
        for (const shape of group.shapes as any[]) {
          if (shape.type === 'CAD::Shape::Rectangle') {
            includePoint(shape.x, shape.y);
            includePoint(shape.x + (shape.width || 0), shape.y + (shape.height || 0));
          } else if (shape.type === 'CAD::Shape::Line' || shape.type === 'CAD::Annotation::Dimension') {
            includePoint(shape.x1, shape.y1);
            includePoint(shape.x2, shape.y2);
          } else if (shape.type === 'CAD::Shape::Circle') {
            const r = shape.radius || 1;
            includePoint(shape.cx - r, shape.cy - r);
            includePoint(shape.cx + r, shape.cy + r);
          } else if (shape.type === 'CAD::Annotation::Text') {
            includePoint(shape.x, shape.y);
          }
        }
      }

      if (!hasPoints || maxX <= minX || maxY <= minY) {
        minX = -10;
        minY = -10;
        maxX = 30;
        maxY = 30;
      }

      const width = maxX - minX;
      const height = maxY - minY;
      const padding = Math.max(width, height) * 0.15 + 1;

      const vbX = minX - padding;
      const vbY = -(maxY + padding); // Flip for standard Cartesian to SVG Y
      const vbW = width + padding * 2;
      const vbH = height + padding * 2;

      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" class="w-full h-full pointer-events-none select-none">
          ${getDefs()}
          <g transform="scale(1, -1)">
            ${geometries}
          </g>
          ${getStyles('dark')}
        </svg>
      `;
    } catch (err) {
      console.error('Thumbnail generation error:', err);
      return '';
    }
  });

  return (
    <div 
      class={`w-full h-full flex items-center justify-center overflow-hidden bg-slate-900/60 rounded-t-lg relative ${props.class || ''}`}
      innerHTML={thumbnailSvg()}
    />
  );
}
