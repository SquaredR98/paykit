import { DemoNav } from '@/components/demo/shared/DemoNav';
import './styles.css';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoNav />
      {children}
    </>
  );
}
