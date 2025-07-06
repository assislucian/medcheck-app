export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Guide {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}
