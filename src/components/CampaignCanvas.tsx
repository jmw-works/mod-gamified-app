import { useEffect, useState } from 'react';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useProgress } from '../context/ProgressContext';

interface CampaignCanvasProps {
  campaignId: string | null;
  userId: string;
}

export default function CampaignCanvas({ campaignId, userId }: CampaignCanvasProps) {
  const {
    questions,
    progress,
    handleAnswer,
    sectionTextByNumber,
  } = useCampaignQuizData(userId, campaignId);

  const { awardXP, markSectionComplete, markCampaignComplete } = useProgress();

  const [index, setIndex] = useState(0);

  // Reset when campaign or question set changes
  useEffect(() => {
    setIndex(0);
  }, [campaignId, questions.length]);

  if (!campaignId) return <div>Select a campaign to begin.</div>;
  if (!questions.length) return <div>No questions found for this campaign.</div>;
  if (index >= questions.length) return <div>Campaign complete!</div>;

  const current = questions[index];
  const sectionText = current.section ? sectionTextByNumber.get(current.section) : undefined;

  const onAnswer = async (answerId: string) => {
    const ans = current.answers.find((a) => a.id === answerId);
    const isCorrect = !!ans?.isCorrect;

    await handleAnswer({ questionId: current.id, isCorrect, xp: current.xpValue });

    if (isCorrect) {
      const alreadyAnswered = progress?.answeredQuestions.includes(current.id);
      if (!alreadyAnswered) awardXP(current.xpValue ?? 0);

      const answered = new Set(progress?.answeredQuestions ?? []);
      answered.add(current.id);

      const sectionQs = questions.filter((q) => q.section === current.section);
      const allAnswered = sectionQs.every((q) => answered.has(q.id));

      if (allAnswered && current.section != null) {
        markSectionComplete(current.section);

        const completed = new Set(progress?.completedSections ?? []);
        completed.add(current.section);
        const allSections = new Set(questions.map((q) => q.section));
        if ([...allSections].every((n) => completed.has(n))) {
          markCampaignComplete(campaignId);
        }
      }
    }

    setIndex((prev) => prev + 1);
  };

  return (
    <div data-campaign-id={campaignId ?? ''} data-user-id={userId}>
      {sectionText ? <p>{sectionText}</p> : null}

      <div className="question-item">
        <p>{current.text}</p>
        {current.answers.map((a) => (
          <button key={a.id} onClick={() => onAnswer(a.id)}>
            {a.content}
          </button>
        ))}
      </div>
    </div>
  );
}

