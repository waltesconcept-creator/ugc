import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Register — KRE8TOR Creator Network',
  description: 'Register your KRE8TOR account to start discovering and booking UGC campaigns.',
};

export default function RegisterPage() {
  return <AuthPageContent initialMode="register" />;
}
