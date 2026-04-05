import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Nova Trust — Digital Banking',
  description: 'Your premium digital banking experience',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0A1628',
                color: '#fff',
                border: '1px solid rgba(240, 180, 41, 0.3)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#F0B429', secondary: '#0A1628' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
