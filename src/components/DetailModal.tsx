import { createSignal, createEffect, onMount, onCleanup, Show } from 'solid-js';
import type { CatalogItem } from '../types';
import { DacProvider, DacCanvas, DocumentParametersInspector } from '@aeckit/dac-solid';
import { renderDetail, renderSolvedDetail, CadTheme } from '@aeckit/dac-renderer-svg';
import { solveDetailDocument } from '@aeckit/dac-json-solver';
import { X, Copy, Check, Download, ExternalLink, Sliders, FileText, Info } from 'lucide-solid';

export interface DetailModalProps {
  item: CatalogItem | null;
  nestedDocs?: Map<string, any>;
  onClose: () => void;
}

export function DetailModal(props: DetailModalProps) {
  const [workingDoc, setWorkingDoc] = createSignal<any>(null);
  const [copied, setCopied] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'parameters' | 'notes' | 'info'>('parameters');

  // Sync working copy when item changes
  createEffect(() => {
    if (props.item) {
      setWorkingDoc(JSON.parse(JSON.stringify(props.item.doc)));
      // Default to parameters if present, else notes
      const hasParams = props.item.doc?.parameters && Object.keys(props.item.doc.parameters).length > 0;
      setActiveTab(hasParams ? 'parameters' : 'notes');
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
      const solved = solveDetailDocument(doc, resolver);
      const svgString = renderSolvedDetail(solved, false, 'dark');

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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-950/80 backdrop-blur-md">
        <div class="w-full max-w-6xl h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
          
          {/* Modal Header */}
          <div class="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/50">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                {props.item?.metadata.category}
              </span>
              <h2 class="text-base font-bold text-slate-100 line-clamp-1">
                {props.item?.metadata.title}
              </h2>
            </div>

            <div class="flex items-center gap-2">
              <button
                onClick={props.onClose}
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Close (Esc)"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body: Left Canvas + Right Inspector */}
          <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Interactive Canvas */}
            <div class="flex-1 h-full min-h-[350px] relative bg-slate-950">
              <Show when={workingDoc()}>
                <DacProvider
                  doc={workingDoc()}
                  nestedDocs={props.nestedDocs}
                  onChange={(updatedDoc) => setWorkingDoc(updatedDoc)}
                  canvasTheme="dark"
                >
                  <DacCanvas />
                </DacProvider>
              </Show>
            </div>

            {/* Side Controls Panel */}
            <div class="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/40 flex flex-col h-72 md:h-full">
              
              {/* Tab Selector */}
              <div class="flex border-b border-slate-800 bg-slate-950/40">
                <button
                  onClick={() => setActiveTab('parameters')}
                  class={`flex-1 py-2 text-xs font-medium border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab() === 'parameters'
                      ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders class="w-3.5 h-3.5" />
                  Parameters
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  class={`flex-1 py-2 text-xs font-medium border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab() === 'notes'
                      ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText class="w-3.5 h-3.5" />
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  class={`flex-1 py-2 text-xs font-medium border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab() === 'info'
                      ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Info class="w-3.5 h-3.5" />
                  Info
                </button>
              </div>

              {/* Tab Content */}
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <Show when={activeTab() === 'parameters'}>
                  <div>
                    <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Dynamic Controls
                    </h3>
                    <Show
                      when={workingDoc()?.parameters && Object.keys(workingDoc().parameters).length > 0}
                      fallback={
                        <p class="text-xs text-slate-500 italic">
                          This detail does not have direct document parameters. Inspect its geometry or copy the JSON to add custom parameters.
                        </p>
                      }
                    >
                      <DocumentParametersInspector
                        doc={workingDoc()}
                        onDocChange={(updated) => setWorkingDoc({ ...updated })}
                      />
                    </Show>
                  </div>
                </Show>

                <Show when={activeTab() === 'notes'}>
                  <div class="space-y-3">
                    <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                      Architectural Notes & Specs
                    </h3>
                    <Show
                      when={props.item?.metadata.notes && props.item.metadata.notes.length > 0}
                      fallback={<p class="text-xs text-slate-500 italic">No notes specified for this detail.</p>}
                    >
                      <ul class="space-y-2">
                        {props.item?.metadata.notes?.map((note, idx) => (
                          <li class="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                            <span class="text-amber-500 font-mono text-[10px] mt-0.5">{idx + 1}.</span>
                            <span class="leading-relaxed">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </Show>
                  </div>
                </Show>

                <Show when={activeTab() === 'info'}>
                  <div class="space-y-3">
                    <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                      Detail Specifications
                    </h3>
                    <div class="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                      <div class="flex justify-between">
                        <span class="text-slate-500">Document Type:</span>
                        <span class="font-mono text-slate-200">{props.item?.doc.type}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Scale:</span>
                        <span class="font-mono text-slate-200">{props.item?.doc.scale || 'N/A'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Version:</span>
                        <span class="font-mono text-slate-200">{props.item?.doc.version || '1.0'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Author:</span>
                        <span class="text-slate-200">{props.item?.metadata.author || 'aeckit'}</span>
                      </div>
                    </div>

                    <div class="pt-2">
                      <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">Tags</span>
                      <div class="flex flex-wrap gap-1">
                        {props.item?.metadata.tags.map((tag) => (
                          <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Show>
              </div>

              {/* Bottom Actions Bar */}
              <div class="p-3 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copied() ? <Check class="w-3.5 h-3.5 text-emerald-400" /> : <Copy class="w-3.5 h-3.5" />}
                    {copied() ? 'Copied JSON!' : 'Copy JSON'}
                  </button>

                  <button
                    onClick={handleExportSvg}
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
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
