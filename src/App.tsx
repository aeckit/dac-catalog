import { createSignal, createMemo, createEffect } from 'solid-js';
import {
  catalogItems,
  catalogNestedDocs,
  getCategoriesForKind,
  getKindCounts,
  filterCatalogItems,
} from './lib/catalog';
import type { CatalogItem, DocumentKind } from './types';
import { Header } from './components/Header';
import { DetailCard } from './components/DetailCard';
import { DetailModal } from './components/DetailModal';
import { SearchX } from 'lucide-solid';

export default function App() {
  const [activeKind, setActiveKind] = createSignal<DocumentKind>('detail');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal('All');
  const [selectedItem, setSelectedItem] = createSignal<CatalogItem | null>(null);
  
  // Theme state: defaults to 'light'
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light');

  createEffect(() => {
    const isDark = theme() === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  });

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleSelectKind = (kind: DocumentKind) => {
    setActiveKind(kind);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const kindCounts = createMemo(() => getKindCounts(catalogItems));
  const categories = createMemo(() => getCategoriesForKind(catalogItems, activeKind()));

  const filteredItems = createMemo(() => {
    return filterCatalogItems(catalogItems, searchQuery(), selectedCategory(), activeKind());
  });

  return (
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sticky Header */}
      <Header
        activeKind={activeKind()}
        onSelectKind={handleSelectKind}
        kindCounts={kindCounts()}
        searchQuery={searchQuery()}
        onSearchChange={setSearchQuery}
        categories={categories()}
        selectedCategory={selectedCategory()}
        onSelectCategory={setSelectedCategory}
        totalCount={kindCounts()[activeKind()]}
        filteredCount={filteredItems().length}
        theme={theme()}
        onToggleTheme={toggleTheme}
      />

      {/* Main Gallery Area */}
      <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems().length === 0 ? (
          <div class="py-24 flex flex-col items-center justify-center text-center">
            <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <SearchX class="w-6 h-6" />
            </div>
            <h2 class="text-base font-semibold text-slate-800 dark:text-slate-200">
              No matching {activeKind()}s found
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              No architectural {activeKind()}s matched "{searchQuery()}". Try clearing filters or searching for terms like "timber", "joist", or "framing".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              class="mt-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems().map((item) => (
              <DetailCard
                item={item}
                nestedDocs={catalogNestedDocs}
                theme={theme()}
                onSelect={(selected) => setSelectedItem(selected)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer class="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/40 py-6 text-center text-xs text-slate-500 transition-colors font-mono">
        <p>
          Powered by <a href="https://github.com/aeckit/dac" target="_blank" rel="noreferrer" class="text-amber-600 dark:text-amber-500 hover:underline font-medium">DaC</a> • Submit a detail at <a href="https://github.com/aeckit/dac-catalog" target="_blank" rel="noreferrer" class="text-amber-600 dark:text-amber-500 hover:underline font-medium">dac-catalog</a>
        </p>
      </footer>

      {/* Detail Modal */}
      <DetailModal
        item={selectedItem()}
        nestedDocs={catalogNestedDocs}
        theme={theme()}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
