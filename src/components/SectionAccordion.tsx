import {
  useState,
  type ReactNode,
  Children,
  isValidElement,
  cloneElement,
} from 'react';
import type { HandleAnswer, SubmitArgs } from '../types/QuestionTypes';
import styles from './SectionAccordion.module.css';
import { FaCheckCircle, FaLock } from 'react-icons/fa';

interface SectionAccordionProps {
  title: string;
  children: ReactNode;
  locked?: boolean;
  sectionId?: string;
  completed?: boolean;
}

export default function SectionAccordion({
  title,
  children,
  locked = false,
  sectionId,
  completed = false,
}: SectionAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const headerClasses = [styles.header];
  if (expanded) headerClasses.push(styles.expanded);
  if (locked) headerClasses.push(styles.locked);
  if (completed) headerClasses.push(styles.completed);

  const enhancedChildren = expanded
    ? Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const props = child.props as { handleAnswer?: HandleAnswer };
        if (props.handleAnswer) {
          const original = props.handleAnswer;
          return cloneElement(
            child as React.ReactElement<{ handleAnswer?: HandleAnswer }>,
            {
              handleAnswer: (args: SubmitArgs) =>
                original({ ...args, sectionId }),
            },
          );
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
        aria-disabled={locked}
      >
        <span>{title}</span>
        <div className={styles.icons}>
          {locked && <FaLock className={styles.lock} aria-hidden />}
          {completed && !locked && <FaCheckCircle className={styles.check} aria-hidden />}
          <span className={styles.arrow} aria-hidden />
        </div>
      </button>
      {expanded && <div>{enhancedChildren}</div>}
    </section>
  );
}
