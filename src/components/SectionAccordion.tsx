import {
  useState,
  type ReactNode,
  Children,
  isValidElement,
  cloneElement,
} from 'react';
import type { HandleAnswer, SubmitArgs } from '../types/QuestionTypes';
import styles from './SectionAccordion.module.css';

interface SectionAccordionProps {
  title: string;
  children: ReactNode;
  locked?: boolean;
  sectionId?: string;
}

export default function SectionAccordion({
  title,
  children,
  locked = false,
  sectionId,
}: SectionAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const headerClasses = [styles.header];
  if (expanded) headerClasses.push(styles.expanded);
  if (locked) headerClasses.push(styles.locked);

  const enhancedChildren = expanded
    ? Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const props = child.props as { handleAnswer?: HandleAnswer };
        if (props.handleAnswer) {
          const original = props.handleAnswer;
          return cloneElement(child, {
            handleAnswer: (args: SubmitArgs) =>
              original({ ...args, sectionId }),
          });
        }
        return child;
      })
    : null;

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
      {expanded && <div>{enhancedChildren}</div>}
    </section>
  );
}
