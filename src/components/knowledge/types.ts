export type LiteNode = {
  id: string;
  name: string;
  href: string;
  category: string;
  color: string;
  depth: number;
  excerpt?: string;
  tags: string[];
  created?: string;
  updated?: string;
  isDoc: boolean; // has its own note body
  docCount: number;
  children: LiteNode[];
};

/** Sidebar tree node; folders have `children`, leaves are just a link. */
export type NavNode = {
  name: string;
  href: string;
  isDoc?: boolean; // folder with its own index note
  docCount?: number;
  color?: string; // top-level categories only
  children?: NavNode[];
};
