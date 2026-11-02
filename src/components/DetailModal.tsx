import { createSignal, createEffect, onMount, onCleanup, Show } from 'solid-js';
import type { CatalogItem } from '../types';
import { DacProvider, DacCanvas, DacZoomControls, DocumentParametersInspector, useDac } from '@aeckit/dac-solid';
import { renderSolvedDetail } from '@aeckit/dac-renderer-svg';
import { solveDetailDocument } from '@aeckit/dac-json-solver';
import { X, Copy, Check, Download, ExternalLink, Sliders, Code2 } from 'lucide-solid';

export interface DetailModalProps {
  item: CatalogItem | null;
  nestedDocs?: Map<string, any>;
  theme?: 'light' | 'dark';
  onClose: () => void;
}

// Automatically triggers fit-to-view when modal opens or document changes
function AutoFitController(props: { doc: any }) {
  const { fitView } = useDac();

  createEffect(() => {
    const _ = props.doc;
    setTimeout(() => fitView(), 60);
    setTimeout(() => fitView(), 220);
  });

  return null;
}

export function DetailModal(props: DetailModalProps) {
  const [workingDoc, setWorkingDoc] = createSignal<any>(null);
  const [copied, setCopied] = createSignal(false);
  const [viewMode, setViewMode] = createSignal<'form' | 'json'>('form');

  // Sync working copy when item changes
  createEffect(() => {
    if (props.item) {
      setWorkingDoc(JSON.parse(JSON.stringify(props.item.doc)));
      setViewMode('form');
    } else {
      setWorkingDoc(null);
    }
  });

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

  const handleCopyJson = async () => {
    if (!workingDoc()) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(workingDoc(), null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleExportSvg = () => {
    const doc = workingDoc();
    if (!doc) return;

    try {
      const resolver = (id: string) => props.nestedDocs?.get(id);
      const solved = solveDetailDocument(doc, 24, 18, resolver);
      const svgString = renderSolvedDetail(solved, false, props.theme || 'light');

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${props.item?.id || 'detail'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  const getPlaygroundUrl = () => {
    const doc = workingDoc();
    if (!doc) return '#';
    try {
      const encoded = encodeURIComponent(JSON.stringify(doc));
      return `https://aeckit.github.io/dac/#doc=${encoded}`;
    } catch {
      return 'https://aeckit.github.io/dac/';
    }
  };

  return (
    <Show when={props.item}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-950/60 backdrop-blur-md">
        <div class="w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 transition-colors">
          
          {/* Modal Header */}
          <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 whitespace-nowrap">
                {props.item?.metadata.category}
              </span>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {props.item?.metadata.title}
              </h2>
            </div>

            <div class="flex items-center gap-2">
              <button
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
            <div class="flex-1 h-full min-h-[350px] relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
              <Show when={workingDoc()}>
                <DacProvider
                  doc={workingDoc()}
                  nestedDocs={props.nestedDocs}
                  onChange={(updatedDoc) => setWorkingDoc(updatedDoc)}
                  canvasTheme={props.theme || 'light'}
                >
                  <AutoFitController doc={workingDoc()} />
                  <DacCanvas />
                  {/* Floating Zoom & Fit Controls in Canvas */}
                  <div class="absolute bottom-3 left-3 z-10 pointer-events-auto">
                    <DacZoomControls />
                  </div>
                </DacProvider>
              </Show>
            </div>

            {/* Side Controls Panel */}
            <div class="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col h-72 md:h-full">
              
              {/* Form vs JSON Toggle Header (like solid-playground) */}
              <div class="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
                <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Properties
                </span>

                <div class="flex rounded-md p-0.5 bg-slate-200 dark:bg-slate-800 text-xs">
                  <button
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

              {/* Panel Content */}
              <div class="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* 1. FORM VIEW */}
                <Show when={viewMode() === 'form'}>
                  {/* Parameter Controls */}
                  <div>
                    <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Sliders class="w-3.5 h-3.5 text-amber-500" />
                      Dynamic Parameters
                    </h3>

                    <Show
                      when={workingDoc()?.parameters && Object.keys(workingDoc().parameters).length > 0}
                      fallback={
                        <p class="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                          This detail does not have direct document parameters. Inspect its geometry or copy the JSON to add custom parameters.
                        </p>
                      }
                    >
                      <div class="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <DocumentParametersInspector
                          doc={workingDoc()}
                          onDocChange={(updated) => setWorkingDoc({ ...updated })}
                        />
                      </div>
                    </Show>
                  </div>

                  {/* Specification Overview */}
                  <div>
                    <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Specifications
                    </h3>
                    <div class="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                      <div class="flex justify-between">
                        <span class="text-slate-500">Document Type:</span>
                        <span class="font-mono text-slate-800 dark:text-slate-200">{props.item?.doc.type}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Scale:</span>
                        <span class="font-mono text-slate-800 dark:text-slate-200">{props.item?.doc.scale || '1:1'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Version:</span>
                        <span class="font-mono text-slate-800 dark:text-slate-200">{props.item?.doc.version || '1.0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Architectural Notes at the Bottom */}
                  <Show when={props.item?.metadata.notes && props.item.metadata.notes.length > 0}>
                    <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Architectural Notes & Specs
                      </h3>
                      <ul class="space-y-2">
                        {props.item?.metadata.notes?.map((note, idx) => (
                          <li class="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                            <span class="text-amber-600 dark:text-amber-400 font-mono text-[10px] mt-0.5">{idx + 1}.</span>
                            <span class="leading-relaxed">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Show>
                </Show>

                {/* 2. JSON VIEW */}
                <Show when={viewMode() === 'json'}>
                  <div class="h-full flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {props.item?.fileName || 'document.json'}
                      </span>
                      <button
                        onClick={handleCopyJson}
                        class="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        {copied() ? <Check class="w-3 h-3 text-emerald-500" /> : <Copy class="w-3 h-3" />}
                        {copied() ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre class="flex-1 bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto select-all leading-relaxed">
                      {JSON.stringify(workingDoc(), null, 2)}
                    </pre>
                  </div>
                </Show>

              </div>

              {/* Bottom Actions Bar */}
              <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                  >
                    {copied() ? <Check class="w-3.5 h-3.5 text-emerald-500" /> : <Copy class="w-3.5 h-3.5" />}
                    {copied() ? 'Copied JSON!' : 'Copy JSON'}
                  </button>

                  <button
                    onClick={handleExportSvg}
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
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
                  class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  Open in Playground
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
