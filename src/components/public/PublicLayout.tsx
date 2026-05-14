import type { ReactNode } from 'react';
import { PublicNav } from './PublicNav';
import { SocialLinks } from './SocialLinks';
import { Footer } from './Footer';

interface PublicLayoutProps {
  children: ReactNode;
  withSocialLinks?: boolean;
}

export function PublicLayout({ children, withSocialLinks = true }: PublicLayoutProps) {
  return (
    <div
      style={{
        background: 'var(--negro)',
        color: 'var(--blanco)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--theme-transition)',
      }}
    >
      <PublicNav />
      <main style={{ flex: 1 }}>{children}</main>
      {withSocialLinks ? <SocialLinks /> : null}
      <Footer />
    </div>
  );
}
