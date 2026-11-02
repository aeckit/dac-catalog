import { Search, X, Layers, Github, BookOpen } from 'lucide-solid';

export interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function Header(props: HeaderProps) {
  return (
    <header class="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top row: Brand & Links */}
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-lg">
              📐
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-medium tracking-wider uppercase text-amber-500">aeckit</span>
                <span class="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">v0.1</span>
              </div>
              <h1 class="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
                DaC Catalog
                <span class="text-xs font-normal text-slate-400 hidden sm:inline">• Parametric 2D CAD Gallery</span>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a
              href="https://github.com/aeckit/dac"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <Github class="w-4 h-4" />
              <span class="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Middle row: Search Bar */}
        <div class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search details by title, tags, lumber size, or notes..."
              value={props.searchQuery}
              onInput={(e) => props.onSearchChange(e.currentTarget.value)}
              class="w-full pl-10 pr-9 py-2 text-sm rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none placeholder:text-slate-500 text-slate-200"
            />
            {props.searchQuery && (
              <button
                onClick={() => props.onSearchChange('')}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X class="w-4 h-4" />
              </button>
            )}
          </div>
          <div class="text-xs text-slate-400 whitespace-nowrap px-1 self-center">
            Showing <span class="font-semibold text-slate-200">{props.filteredCount}</span> of {props.totalCount} details
          </div>
        </div>

        {/* Bottom row: Category Pills */}
        <div class="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => props.onSelectCategory('All')}
            class={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              props.selectedCategory === 'All'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            All Details
          </button>
          {props.categories.map((cat) => (
            <button
              onClick={() => props.onSelectCategory(cat)}
              class={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                props.selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
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
