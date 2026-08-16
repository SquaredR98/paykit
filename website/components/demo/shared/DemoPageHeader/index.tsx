import './styles.css';

interface DemoPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function DemoPageHeader({ eyebrow, title, description }: DemoPageHeaderProps) {
  return (
    <header className="pk-demo-header">
      <span className="pk-demo-header__eyebrow">{eyebrow}</span>
      <h1 className="pk-demo-header__title">{title}</h1>
      <p className="pk-demo-header__desc">{description}</p>
    </header>
  );
}
