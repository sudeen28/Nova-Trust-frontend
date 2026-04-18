import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata = {
  title: 'Nova Trust — Private Banking',
  description: 'Exclusive private banking platform',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,       // prevents zoom on input focus on iOS
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('nova-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', saved);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--s2)',
                  color: 'var(--t1)',
                  border: '1px solid rgba(255,106,0,0.2)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                },
                success: { iconTheme: { primary: '#FF6A00', secondary: 'var(--s2)' } },
                error:   { iconTheme: { primary: '#f87171', secondary: 'var(--s2)' } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
