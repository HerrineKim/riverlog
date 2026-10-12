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
