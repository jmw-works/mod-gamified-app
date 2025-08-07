import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ProgressContext from '../context/ProgressContext';
import type { Question } from '../types/QuestionTypes';
import styles from './SectionAccordion.module.css';

interface Props {
  title: string;
  educationalText?: string;
  questions: Question[];
  locked?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onComplete?: () => void;
}

export default function SectionAccordion({
  title,
  educationalText,
  questions,
  locked = false,
  expanded,
  onToggle,
  onComplete,
}: Props) {
  const progress = useContext(ProgressContext);
  const handleAnswer = progress?.handleAnswer;
  const answeredQuestions = progress?.answeredQuestions ?? [];

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const q of questions) {
      map[q.id] = answeredQuestions.includes(q.id);
    }
    return map;
  });
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string | null>>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const allCorrect = questions.every((q) => correctMap[q.id]);
    if (allCorrect && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }, [correctMap, questions, completed, onComplete]);

  const submitFor = (q: Question) => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userAnswer = (responses[q.id] ?? '').trim();
    const isCorrect =
      userAnswer.toLowerCase() === q.correctAnswer.trim().toLowerCase();

    await handleAnswer?.({
      questionId: q.id,
      userAnswer,
      isCorrect,
      xp: q.xpValue ?? undefined,
    });

    if (isCorrect) {
      setCorrectMap((prev) => ({ ...prev, [q.id]: true }));
      setFeedbackMap((prev) => ({ ...prev, [q.id]: 'Correct!' }));
      setTimeout(
        () => setFeedbackMap((prev) => ({ ...prev, [q.id]: null })),
        1000,
      );
      setResponses((prev) => ({ ...prev, [q.id]: '' }));
    } else {
      setFeedbackMap((prev) => ({ ...prev, [q.id]: 'Try again' }));
    }
  };

  return (
    <div className={styles.accordion}>
      <div
        className={`${styles.header} ${locked ? styles.locked : ''}`}
        onClick={!locked ? onToggle : undefined}
      >
        <span>{title}</span>
        <span
          className={`${styles.arrow} ${expanded ? styles.open : ''}`}
        ></span>
      </div>
      {expanded && !locked && (
        <div className={styles.content}>
          {educationalText && (
            <p className={styles.educationalText}>{educationalText}</p>
          )}
          {questions.map((q) => (
            <div key={q.id} className={styles.question}>
              <p>{q.text}</p>
              {correctMap[q.id] ? (
                <p className={styles.correct}>Correct!</p>
              ) : (
                <form onSubmit={submitFor(q)}>
                  <textarea
                    value={responses[q.id] ?? ''}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
              {!correctMap[q.id] && feedbackMap[q.id] && (
                <p className={styles.feedback}>{feedbackMap[q.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

