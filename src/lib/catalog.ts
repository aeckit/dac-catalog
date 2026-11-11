import type { CatalogItem, CatalogItemMetadata, DocumentKind } from '../types';

// Load all JSON files recursively in the catalog directory
const catalogFiles = import.meta.glob('/catalog/**/*.json', { eager: true });

// Build a map of nested constructs/documents so ConstructReferences resolve
export const catalogNestedDocs = new Map<string, any>();

export const catalogItems: CatalogItem[] = [];

for (const path in catalogFiles) {
  const mod = catalogFiles[path] as any;
  const doc = mod.default || mod;
  const fileName = path.split('/').pop() || '';

  // Register in nestedDocs map under multiple common lookup keys
  catalogNestedDocs.set(fileName, doc);
  catalogNestedDocs.set(fileName.replace(/\.json$/, ''), doc);
  if (doc?.id) catalogNestedDocs.set(doc.id, doc);

  const rawMeta = doc.metadata || {};
  const id = rawMeta.id || fileName.replace(/\.json$/, '');
  if (rawMeta.id) catalogNestedDocs.set(rawMeta.id, doc);

  // Determine DocumentKind strictly based on folder location (Strict Folder Isolation)
  let kind: DocumentKind = 'detail';
  if (path.includes('/constructs/')) {
    kind = 'construct';
  } else if (path.includes('/details/')) {
    kind = 'detail';
  } else if (path.includes('/sheets/')) {
    kind = 'sheet';
  } else if (path.includes('/titleblocks/') || path.includes('/title-blocks/')) {
    kind = 'titleblock';
  } else if (doc?.type === 'CAD::Construct') {
    // Fallback for unorganized files in root catalog/
    kind = 'construct';
  } else if (doc?.type === 'CAD::SheetConfiguration' || doc?.type === 'CAD::Project') {
    kind = 'sheet';
  } else if (doc?.type === 'CAD::TitleBlock') {
    kind = 'titleblock';
  } else {
    kind = 'detail';
  }

  const metadata: CatalogItemMetadata = {
    id,
    title: rawMeta.title || id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    description: rawMeta.description || 'Parametric Drawing-as-Code architectural detail.',
    category: rawMeta.category || 'General',
    tags: Array.isArray(rawMeta.tags) ? rawMeta.tags : [],
    notes: Array.isArray(rawMeta.notes) ? rawMeta.notes : (rawMeta.notes ? [rawMeta.notes] : []),
    author: rawMeta.author || 'aeckit',
  };

  catalogItems.push({
    id,
    fileName,
    kind,
    metadata,
    doc,
  });
}

// Helper to get categories scoped to a specific DocumentKind
export function getCategoriesForKind(items: CatalogItem[], kind: DocumentKind): string[] {
  const categories = new Set<string>();
  items
    .filter(item => item.kind === kind)
    .forEach(item => {
      if (item.metadata.category) {
        categories.add(item.metadata.category);
      }
    });
  return Array.from(categories).sort();
}

// Helper to compute counts per DocumentKind
export function getKindCounts(items: CatalogItem[]): Record<DocumentKind, number> {
  const counts: Record<DocumentKind, number> = {
    detail: 0,
    construct: 0,
    sheet: 0,
    titleblock: 0,
  };
  items.forEach(item => {
    if (counts[item.kind] !== undefined) {
      counts[item.kind]++;
    }
  });
  return counts;
}

// Search and filter catalog items
export function filterCatalogItems(
  items: CatalogItem[],
  query: string,
  selectedCategory: string | null,
  activeKind: DocumentKind = 'detail'
): CatalogItem[] {
  const q = query.trim().toLowerCase();

  return items.filter(item => {
    // 1. Kind filter (e.g. 'detail' vs 'construct')
    if (item.kind !== activeKind) {
      return false;
    }

    // 2. Category filter
    if (selectedCategory && selectedCategory !== 'All' && item.metadata.category !== selectedCategory) {
      return false;
    }

    // 3. Query filter
    if (!q) return true;

    const matchTitle = item.metadata.title.toLowerCase().includes(q);
    const matchDesc = item.metadata.description.toLowerCase().includes(q);
    const matchCategory = item.metadata.category.toLowerCase().includes(q);
    const matchTags = item.metadata.tags.some(t => t.toLowerCase().includes(q));
    const matchNotes = item.metadata.notes?.some(n => n.toLowerCase().includes(q));

    return matchTitle || matchDesc || matchCategory || matchTags || matchNotes;
  });
}
