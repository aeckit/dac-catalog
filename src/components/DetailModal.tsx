import { createSignal, createEffect, onMount, onCleanup, Show } from 'solid-js';
import type { CatalogItem } from '../types';
import {
  DacProvider,
  DacCanvas,
  DacInspector,
  DacZoomControls,
  DacPlaybackControls,
  useDac,
} from '@aeckit/dac-solid';
import { renderSolvedDetail, PaperTheme, BlueprintTheme } from '@aeckit/dac-renderer-svg';
import { solveDetailDocument } from '@aeckit/dac-json-solver';
import { X, Copy, Check, Download, ExternalLink } from 'lucide-solid';

export interface DetailModalProps {
  item: CatalogItem | null;
  nestedDocs?: Map<string, any>;
  theme?: 'light' | 'dark';
  onClose: () => void;
}

// Inner controller to auto-center and zoom into the geometry when modal opens
function ModalCanvasController(props: { doc: any }) {
  const { fitView } = useDac();

  createEffect(() => {
    const _ = props.doc;
    setTimeout(() => fitView(), 60);
    setTimeout(() => fitView(), 240);
  });

  return null;
}

// Inner Modal content that runs inside DacProvider
function ModalContent(props: {
  item: CatalogItem;
  theme?: 'light' | 'dark';
  nestedDocs?: Map<string, any>;
  onClose: () => void;
}) {
  const { doc } = useDac();
  const [viewMode, setViewMode] = createSignal<'form' | 'json'>('form');
  const [copied, setCopied] = createSignal(false);

  const handleCopyJson = async () => {
    const currentDoc = doc();
    if (!currentDoc) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentDoc, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleExportSvg = () => {
    const currentDoc = doc();
    if (!currentDoc) return;

    try {
      const resolver = (id: string) => props.nestedDocs?.get(id);
      const solved = solveDetailDocument(currentDoc, 24, 18, resolver);
      const svgTheme = props.theme === 'dark' ? BlueprintTheme : PaperTheme;
      const svgString = renderSolvedDetail(solved, false, svgTheme);

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${props.item.id || 'detail'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  const getPlaygroundUrl = () => {
    const currentDoc = doc();
    if (!currentDoc) return '#';
    try {
      const encoded = encodeURIComponent(JSON.stringify(currentDoc));
      return `https://aeckit.github.io/dac/#doc=${encoded}`;
    } catch {
      return 'https://aeckit.github.io/dac/';
    }
  };

  return (
    <div class="w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 transition-colors pointer-events-auto">
      
      {/* Modal Header */}
      <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 whitespace-nowrap">
            {props.item.metadata.category}
          </span>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
            {props.item.metadata.title}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onClose}
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Body: Left Canvas + Right Inspector */}
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Interactive Canvas */}
        <div class="flex-1 h-full min-h-[350px] relative bg-white dark:bg-slate-950 overflow-hidden">
          <ModalCanvasController doc={doc()} />
          <DacCanvas showGizmoActions={false} showGizmoHandles={false} />
          {/* Floating Playback & Zoom Controls in Canvas */}
          <div class="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-2 pointer-events-none">
            <div class="pointer-events-auto">
              <DacPlaybackControls />
            </div>
            <div class="pointer-events-auto">
              <DacZoomControls style={{ margin: '0' }} />
            </div>
          </div>
        </div>

        {/* Side Controls Panel */}
        <div 
          class="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-72 md:h-full z-20"
          style={{
            "--app-bg-panel": "transparent",
            "--app-bg-main": props.theme === "dark" ? "#0f172a" : "#f8fafc",
            "--app-border": props.theme === "dark" ? "rgba(51, 65, 85, 0.8)" : "rgba(203, 213, 225, 0.8)",
            "--app-text": props.theme === "dark" ? "#f8fafc" : "#0f172a",
            "--app-text-muted": props.theme === "dark" ? "#94a3b8" : "#64748b"
          }}
        >
          
          {/* Form vs JSON Toggle Header */}
          <div class="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Properties
            </span>

            <div class="flex rounded-md p-0.5 bg-slate-200 dark:bg-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                class={`px-3 py-1 rounded-sm font-medium transition-colors ${
                  viewMode() === 'form'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setViewMode('json')}
                class={`px-3 py-1 rounded-sm font-medium transition-colors ${
                  viewMode() === 'json'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div class="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* 1. FORM VIEW: Canonical DacInspector from @aeckit/dac-solid */}
            <Show when={viewMode() === 'form'}>
              <div class="[&>div]:!p-0 [&>div]:!bg-transparent [&>div]:!overflow-visible space-y-5 font-mono text-xs">
                <DacInspector />
              </div>
            </Show>

            {/* 2. JSON VIEW: Live Document JSON */}
            <Show when={viewMode() === 'json'}>
              <div class="h-full flex flex-col min-h-[300px]">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {props.item.fileName}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    class="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    {copied() ? <Check class="w-3 h-3 text-emerald-500" /> : <Copy class="w-3 h-3" />}
                    {copied() ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre class="flex-1 bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto select-all leading-relaxed">
                  {JSON.stringify(doc(), null, 2)}
                </pre>
              </div>
            </Show>

          </div>

          {/* Bottom Actions Bar */}
          <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2 font-mono">
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              >
                {copied() ? <Check class="w-3.5 h-3.5 text-emerald-500" /> : <Copy class="w-3.5 h-3.5" />}
                {copied() ? 'Copied JSON!' : 'Copy JSON'}
              </button>

              <button
                type="button"
                onClick={handleExportSvg}
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                title="Export SVG"
              >
                <Download class="w-3.5 h-3.5" />
                SVG
              </button>
            </div>

            <a
              href={getPlaygroundUrl()}
              target="_blank"
              rel="noreferrer"
              class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
            >
              <ExternalLink class="w-3.5 h-3.5" />
              Open in Playground
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailModal(props: DetailModalProps) {
  // Handle escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <Show when={props.item}>
      {(item) => (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-950/60 backdrop-blur-md">
          <DacProvider
            doc={JSON.parse(JSON.stringify(item().doc))}
            nestedDocs={props.nestedDocs}
            canvasTheme={props.theme === 'dark' ? BlueprintTheme : PaperTheme}
          >
            <ModalContent
              item={item()}
              theme={props.theme}
              nestedDocs={props.nestedDocs}
              onClose={props.onClose}
            />
          </DacProvider>
        </div>
      )}
    </Show>
  );
}
