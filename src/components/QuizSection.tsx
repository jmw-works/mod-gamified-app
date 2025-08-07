import { useState } from 'react';
import type { Question, HandleAnswer } from '../types/QuestionTypes';
import type { Progress } from '../types/ProgressTypes';

interface Props {
  title: string;
  educationalText: string;
  questions: Question[];
  progress: Progress;
  handleAnswer?: HandleAnswer;
  isLocked?: boolean;
  initialOpen?: boolean;
}

export default function QuizSection({
  title,
  educationalText,
  questions,
  progress,
  handleAnswer,
  isLocked = false,
  initialOpen = false,
}: Props) {
  const [open, setOpen] = useState(initialOpen);
  const completed = progress.completedSections.includes(questions[0]?.section ?? -1);

  return (
    <section style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLocked}
        style={{ fontWeight: 'bold' }}
      >
        {title}
        {completed ? ' ✅' : ''}
      </button>
      {open && (
        <div>
          <p>{educationalText}</p>
          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                {q.text}
                {handleAnswer && (
                  <button
                    type="button"
                    onClick={() =>
                      handleAnswer({
                        questionId: q.id,
                        userAnswer: '',
                        isCorrect: false,
                        sectionId: undefined,
                      })
                    }
                  >
                    Answer
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
