import { Search, X, Github, Sun, Moon, ExternalLink } from 'lucide-solid';
import { Show } from 'solid-js';
import type { DocumentKind } from '../types';

export interface HeaderProps {
  activeKind: DocumentKind;
  onSelectKind: (kind: DocumentKind) => void;
  kindCounts: Record<DocumentKind, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
  filteredCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header(props: HeaderProps) {
  return (
    <header class="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top row: Brand & Segmented Kind Toggle & Actions */}
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="flex items-center">
            <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              The DaC Catalog
            </h1>
          </div>

          {/* Segmented Document Kind Toggle (No 'All' option; expandable for Sheets & Title Blocks) */}
          <div class="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono self-center">
            <button
              type="button"
              onClick={() => props.onSelectKind('detail')}
              class={`px-3.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                props.activeKind === 'detail'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Details</span>
              <span class={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                props.activeKind === 'detail'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {props.kindCounts.detail}
              </span>
            </button>

            <button
              type="button"
              onClick={() => props.onSelectKind('construct')}
              class={`px-3.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                props.activeKind === 'construct'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Constructs</span>
              <span class={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                props.activeKind === 'construct'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {props.kindCounts.construct}
              </span>
            </button>

            {/* Future Document Kinds: Sheet & TitleBlock */}
            <Show when={props.kindCounts.sheet > 0}>
              <button
                type="button"
                onClick={() => props.onSelectKind('sheet')}
                class={`px-3.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                  props.activeKind === 'sheet'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>Sheets</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-800 text-slate-500">
                  {props.kindCounts.sheet}
                </span>
              </button>
            </Show>

            <Show when={props.kindCounts.titleblock > 0}>
              <button
                type="button"
                onClick={() => props.onSelectKind('titleblock')}
                class={`px-3.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                  props.activeKind === 'titleblock'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>Title Blocks</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-800 text-slate-500">
                  {props.kindCounts.titleblock}
                </span>
              </button>
            </Show>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-auto">
            <a
              href="https://aeckit.github.io/dac/"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs leading-4 font-mono font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Open DaC Playground"
            >
              <span>Playground</span>
              <ExternalLink class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </a>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={props.onToggleTheme}
              class="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title={`Switch to ${props.theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {props.theme === 'light' ? (
                <Moon class="w-4 h-4 text-slate-700" />
              ) : (
                <Sun class="w-4 h-4 text-amber-400" />
              )}
            </button>

            <a
              href="https://github.com/aeckit/dac-catalog"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="View on GitHub"
            >
              <Github class="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Middle row: Search Bar */}
        <div class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${props.activeKind === 'detail' ? 'details' : 'constructs'} by title, tags, or notes...`}
              value={props.searchQuery}
              onInput={(e) => props.onSearchChange(e.currentTarget.value)}
              class="w-full pl-10 pr-9 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
            />
            {props.searchQuery && (
              <button
                onClick={() => props.onSearchChange('')}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X class="w-4 h-4" />
              </button>
            )}
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap px-1 self-center font-mono">
            Showing <span class="font-semibold text-slate-800 dark:text-slate-200">{props.filteredCount}</span> of {props.totalCount} {props.activeKind}s
          </div>
        </div>

        {/* Bottom row: Category Pills */}
        <div class="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          <button
            onClick={() => props.onSelectCategory('All')}
            class={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              props.selectedCategory === 'All'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Categories
          </button>
          {props.categories.map((cat) => (
            <button
              onClick={() => props.onSelectCategory(cat)}
              class={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                props.selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
