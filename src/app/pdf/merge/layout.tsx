import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merge PDF | ToolDock',
  description: 'Combine multiple PDFs into one quickly and securely.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/pdf/merge`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
