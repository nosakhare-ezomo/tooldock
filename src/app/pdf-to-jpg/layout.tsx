import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG | ToolDock',
  description: 'Convert PDF pages into high-quality JPG images.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/pdf-to-jpg`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
