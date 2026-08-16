import './styles.css';

interface SplitViewProps {
  leftLabel?: string;
  rightLabel?: string;
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitView({ leftLabel, rightLabel, left, right }: SplitViewProps) {
  return (
    <div className="pk-split">
      <div className="pk-split__panel">
        {leftLabel && <span className="pk-split__label">{leftLabel}</span>}
        {left}
      </div>
      <div className="pk-split__panel">
        {rightLabel && <span className="pk-split__label">{rightLabel}</span>}
        {right}
      </div>
    </div>
  );
}
