import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';
import './globals.css';
const pixel = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
});
export const metadata: Metadata = {
  title: 'SAVEPOINT | Build a better tomorrow',
  description:
    'A pixel-art budgeting adventure. Track expenses, grow your savings, and complete your daily quests.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={pixel.variable}>{children}</body>
    </html>
  );
}
