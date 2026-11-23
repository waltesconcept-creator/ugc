import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Join Creator — Social Commerce Platform for Creators & Brands',
  description: 'Create your Creator account to share content, book UGC campaigns, and earn with affiliate commerce.',
};

export default function JoinPage() {
  return <AuthPageContent initialMode="register" />;
}
