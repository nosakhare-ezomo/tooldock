import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Generator | ToolDock',
  description: 'Create scannable QR codes for URLs, Wi-Fi, and text.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/qr-code-generator`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
