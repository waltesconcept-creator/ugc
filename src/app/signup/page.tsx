import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Sign Up — Creator',
  description: 'Sign up for Creator to showcase your creator portfolio or hire creators worldwide.',
};

export default function SignUpPage() {
  return <AuthPageContent initialMode="register" />;
}
