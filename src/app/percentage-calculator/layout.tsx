import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Percentage Calculator | ToolDock',
  description: 'Quickly calculate percentages and percentage changes.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/percentage-calculator`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
