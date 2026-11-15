import { Metadata } from 'next';
import { AuthPageContent } from '@/components/auth/AuthPageContent';

export const metadata: Metadata = {
  title: 'Join KRE8TOR — Global UGC Creator Network',
  description: 'Create your UGC creator or brand profile on KRE8TOR and start collaborating.',
};

export default function JoinPage() {
  return <AuthPageContent initialMode="register" />;
}
