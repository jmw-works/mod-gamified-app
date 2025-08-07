import { useState, type ReactNode } from 'react';
import styles from './SectionAccordion.module.css';

interface SectionAccordionProps {
  title: string;
  children: ReactNode;
  locked?: boolean;
}

export default function SectionAccordion({ title, children, locked = false }: SectionAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const headerClasses = [styles.header];
  if (expanded) headerClasses.push(styles.expanded);
  if (locked) headerClasses.push(styles.locked);

  return (
    <section>
      <button
        type="button"
        className={headerClasses.join(' ')}
        onClick={() => setExpanded((prev) => !prev)}
        disabled={locked}
      >
        <span>{title}</span>
        <span className={styles.arrow} aria-hidden />
      </button>
      {expanded && <div>{children}</div>}
    </section>
  );
}
