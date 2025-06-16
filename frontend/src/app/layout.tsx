import '@/styles/globals.css';
import '@/styles/themes/tokens.css';
import '@/styles/themes/dark.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata = {
  title: 'Game Night Concierge - Theme Demo',
  description: 'Theme system demonstration for Game Night Concierge',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
