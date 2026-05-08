import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';

export const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 sm:py-10">
        <div className="shell">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

