import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Password Generator | ToolDock',
  description: 'Generate secure, random passwords locally.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tooldock-ff.onrender.com'}/password-generator`
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
