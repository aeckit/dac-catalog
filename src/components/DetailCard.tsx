import type { CatalogItem } from '../types';
import { ThumbnailViewer } from './ThumbnailViewer';

export interface DetailCardProps {
  item: CatalogItem;
  nestedDocs?: Map<string, any>;
  theme?: 'light' | 'dark';
  onSelect: (item: CatalogItem) => void;
}

export function DetailCard(props: DetailCardProps) {
  return (
    <div
      onClick={() => props.onSelect(props.item)}
      class="flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer"
    >
      {/* Thumbnail Area */}
      <div class="h-48 w-full border-b border-slate-200 dark:border-slate-800/80 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ThumbnailViewer doc={props.item.doc} nestedDocs={props.nestedDocs} theme={props.theme} />
        
        {/* Category Badge */}
        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 backdrop-blur-sm">
            {props.item.metadata.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
            {props.item.metadata.title}
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {props.item.metadata.description}
          </p>
        </div>

        {/* Tags */}
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-1">
          {props.item.metadata.tags.slice(0, 4).map((tag) => (
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono">
              #{tag}
            </span>
          ))}
          {props.item.metadata.tags.length > 4 && (
            <span class="text-[10px] px-1.5 py-0.5 text-slate-400 dark:text-slate-500 font-mono">
              +{props.item.metadata.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
