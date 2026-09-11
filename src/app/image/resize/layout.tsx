import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer | ToolDock',
  description: 'Resize images to specific dimensions.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/image/resize`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
