import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Sign In — Creator',
  description: 'Sign in to your Creator account.',
};

export default function SignInPage() {
  return <AuthPageContent initialMode="login" />;
}
