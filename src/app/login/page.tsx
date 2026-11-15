import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Sign In — KRE8TOR Creator Network',
  description: 'Sign in to your KRE8TOR creator or brand account.',
};

export default function LoginPage() {
  return <AuthPageContent initialMode="login" />;
}
