export type DocumentKind = 'detail' | 'construct' | 'sheet' | 'titleblock';

export interface CatalogItemMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  notes?: string[];
  author?: string;
}

export interface CatalogItem {
  id: string;
  fileName: string;
  kind: DocumentKind;
  metadata: CatalogItemMetadata;
  doc: any;
  thumbnailSvg?: string;
}
