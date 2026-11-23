import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Sign In — Creator',
  description: 'Sign in to your Creator account to watch, book UGC campaigns, and manage affiliate commerce.',
};

export default function LoginPage() {
  return <AuthPageContent initialMode="login" />;
}
