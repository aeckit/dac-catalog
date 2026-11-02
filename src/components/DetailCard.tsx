import type { CatalogItem } from '../types';
import { ThumbnailViewer } from './ThumbnailViewer';
import { Layers, Sliders, ExternalLink } from 'lucide-solid';

export interface DetailCardProps {
  item: CatalogItem;
  nestedDocs?: Map<string, any>;
  onSelect: (item: CatalogItem) => void;
}

export function DetailCard(props: DetailCardProps) {
  const hasParams = () => {
    const params = props.item.doc?.parameters;
    return params && Object.keys(params).length > 0;
  };

  return (
    <div
      onClick={() => props.onSelect(props.item)}
      class="group flex flex-col bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Thumbnail Area */}
      <div class="h-48 w-full border-b border-slate-800/80 relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900/60">
        <ThumbnailViewer doc={props.item.doc} nestedDocs={props.nestedDocs} />
        
        {/* Top Badges */}
        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 backdrop-blur-sm">
            {props.item.doc.type === 'CAD::Construct' ? 'Construct' : 'Detail'}
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 backdrop-blur-sm">
            {props.item.metadata.category}
          </span>
        </div>

        {hasParams() && (
          <div class="absolute top-2.5 right-2.5">
            <span class="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 backdrop-blur-sm">
              <Sliders class="w-3 h-3" />
              Parametric
            </span>
          </div>
        )}

        {/* Hover overlay hint */}
        <div class="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <span class="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            Configure & Inspect Detail ↗
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 class="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {props.item.metadata.title}
          </h2>
          <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {props.item.metadata.description}
          </p>
        </div>

        {/* Tags */}
        <div class="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1">
          {props.item.metadata.tags.slice(0, 4).map((tag) => (
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
              #{tag}
            </span>
          ))}
          {props.item.metadata.tags.length > 4 && (
            <span class="text-[10px] px-1.5 py-0.5 text-slate-500 font-mono">
              +{props.item.metadata.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
