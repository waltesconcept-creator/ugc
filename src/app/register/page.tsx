import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Register — Creator',
  description: 'Register your Creator account to watch, book UGC campaigns, and earn with affiliate commerce.',
};

export default function RegisterPage() {
  return <AuthPageContent initialMode="register" />;
}
