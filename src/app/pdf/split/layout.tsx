import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Split PDF | ToolDock',
  description: 'Extract pages from a PDF document securely.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/pdf/split`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
