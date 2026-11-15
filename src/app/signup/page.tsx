import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Sign Up — KRE8TOR Creator Network',
  description: 'Sign up for KRE8TOR to showcase your creator portfolio or hire creators worldwide.',
};

export default function SignUpPage() {
  return <AuthPageContent initialMode="register" />;
}
