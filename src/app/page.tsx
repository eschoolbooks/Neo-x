
import type { Metadata } from 'next';
import HomeClient from '@/components/home-client';

export const metadata: Metadata = {
  icons: {
    icon: '/ESBlogo.png',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
