import '../../packages/ui/tokens.css';

export const metadata = { title: 'CITYAGENT — Find accommodation without the guesswork' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f8fafc' }}>{children}</body>
    </html>
  );
}
