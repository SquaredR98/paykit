export interface Author {
  id: string;
  name: string;
  initials: string;
  bio?: string;
  avatar?: string;
}

export const authors: Record<string, Author> = {
  'ravi-ranjan': {
    id: 'ravi-ranjan',
    name: 'Ravi Ranjan',
    initials: 'RR',
    bio: 'Building the unified payment SDK at PayKit',
  },
  'meera-kulkarni': {
    id: 'meera-kulkarni',
    name: 'Meera Kulkarni',
    initials: 'MK',
    bio: 'Type systems and developer experience',
  },
  'dev-sharma': {
    id: 'dev-sharma',
    name: 'Dev Sharma',
    initials: 'DS',
    bio: 'Security and reliability engineering',
  },
};

export function getAuthor(id: string): Author | undefined {
  return authors[id];
}
