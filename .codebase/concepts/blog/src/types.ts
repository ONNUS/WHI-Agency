export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface ClientInfo {
  industry: string;
  location: string;
  profile: string;
}

export interface Vulnerability {
  title: string;
  desc: string;
}

export interface SolutionItem {
  num: string; // e.g. "01"
  title: string;
  desc: string;
  highlights?: string[];
}

export interface MetricItem {
  value: string; // e.g. "10X"
  label: string;
  desc: string;
}

export interface QuoteItem {
  text: string;
  author: string;
  role: string;
}

export interface BlogPost {
  id: string;
  type: 'case-study' | 'article';
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string; // full markdown text
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  published: boolean;
  author: Author;
  image: string;
  featured?: boolean;
  
  // Case Study specific fields
  logo?: string; // Puzzle/Letter U logo SVG or URL
  clientInfo?: ClientInfo;
  criticalVulnerabilities?: Vulnerability[];
  solutions?: SolutionItem[];
  results?: MetricItem[];
  quotes?: QuoteItem[];
}
