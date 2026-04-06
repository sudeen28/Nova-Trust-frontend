import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Nova Trust — Private Banking',
  description: 'Exclusive private banking platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { background: '#161616', color: '#F0F0F0', border: '1px solid rgba(255,106,0,0.2)', borderRadius: '12px', fontSize: '13px', fontFamily: 'Inter,sans-serif' },
            success: { iconTheme: { primary: '#FF6A00', secondary: '#161616' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#161616' } },
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
