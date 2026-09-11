import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Counter | ToolDock',
  description: 'Count words, characters, and sentences instantly.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/word-counter`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
