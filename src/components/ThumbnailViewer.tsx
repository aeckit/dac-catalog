import { createMemo } from 'solid-js';
import { renderThumbnailSvg } from '@aeckit/dac-renderer-svg';

export interface ThumbnailViewerProps {
  doc: any;
  nestedDocs?: Map<string, any>;
  theme?: 'light' | 'dark';
  class?: string;
}

export function ThumbnailViewer(props: ThumbnailViewerProps) {
  const thumbnailSvg = createMemo(() => {
    try {
      const doc = props.doc;
      if (!doc || !Array.isArray(doc.geometry)) {
        return '';
      }

      const constructResolver = (id: string) => props.nestedDocs?.get(id);
      return renderThumbnailSvg(doc, {
        theme: props.theme,
        constructResolver,
        paddingRatio: 0.15,
      });
    } catch (err) {
      console.error('Thumbnail generation error:', err);
      return '';
    }
  });

  return (
    <div 
      class={`w-full h-full flex items-center justify-center overflow-hidden rounded-t-lg relative ${
        props.theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-100/90'
      } ${props.class || ''}`}
      innerHTML={thumbnailSvg()}
    />
  );
}
