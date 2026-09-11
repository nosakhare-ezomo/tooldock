import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PDF | ToolDock',
  description: 'Reduce PDF file size without losing quality.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/pdf/compress`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
