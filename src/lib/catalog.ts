import type { CatalogItem, CatalogItemMetadata } from '../types';

// Load all JSON files in the catalog directory
const catalogFiles = import.meta.glob('/catalog/*.json', { eager: true });

// Build a map of nested constructs/documents so ConstructReferences resolve
export const catalogNestedDocs = new Map<string, any>();

export const catalogItems: CatalogItem[] = [];

for (const path in catalogFiles) {
  const mod = catalogFiles[path] as any;
  const doc = mod.default || mod;
  const fileName = path.split('/').pop() || '';

  // Register in nestedDocs map
  catalogNestedDocs.set(fileName, doc);

  const rawMeta = doc.metadata || {};
  const id = rawMeta.id || fileName.replace(/\.json$/, '');
  
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
    metadata,
    doc,
  });
}

// Helper to get all categories
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  catalogItems.forEach(item => {
    if (item.metadata.category) {
      categories.add(item.metadata.category);
    }
  });
  return Array.from(categories).sort();
}

// Helper to get all tags
export function getAllTags(): string[] {
  const tags = new Set<string>();
  catalogItems.forEach(item => {
    item.metadata.tags.forEach(t => tags.add(t));
  });
  return Array.from(tags).sort();
}

// Search and filter catalog items
export function filterCatalogItems(
  items: CatalogItem[],
  query: string,
  selectedCategory: string | null
): CatalogItem[] {
  const q = query.trim().toLowerCase();

  return items.filter(item => {
    // Category filter
    if (selectedCategory && selectedCategory !== 'All' && item.metadata.category !== selectedCategory) {
      return false;
    }

    // Query filter
    if (!q) return true;

    const matchTitle = item.metadata.title.toLowerCase().includes(q);
    const matchDesc = item.metadata.description.toLowerCase().includes(q);
    const matchCategory = item.metadata.category.toLowerCase().includes(q);
    const matchTags = item.metadata.tags.some(t => t.toLowerCase().includes(q));
    const matchNotes = item.metadata.notes?.some(n => n.toLowerCase().includes(q));

    return matchTitle || matchDesc || matchCategory || matchTags || matchNotes;
  });
}
