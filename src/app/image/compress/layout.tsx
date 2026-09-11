import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor | ToolDock',
  description: 'Reduce image file sizes instantly.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/image/compress`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
