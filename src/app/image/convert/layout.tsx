import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Converter | ToolDock',
  description: 'Convert images between different formats.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/image/convert`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
