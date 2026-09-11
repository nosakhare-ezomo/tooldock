import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image to PDF | ToolDock',
  description: 'Convert JPG, PNG, and other images to a single PDF.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/img-to-pdf`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
