// app/lib/definitions.ts

// WAJIB ada kata 'export' di depan agar bisa dianggap module
export interface ProjectCardProps {
  href: string;
  title: string;
  subtitle: string;
}

export type Project = {
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
};

export type Template = {
  id: number;
  title: string;
  author: string;
  category?: string;
};