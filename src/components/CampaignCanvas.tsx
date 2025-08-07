import { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useProgress } from '../context/ProgressContext';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import { useUserProfile } from '../context/UserProfileContext';

interface CampaignCanvasProps {
  userId: string;
  onRequireAuth?: () => void;
}

export default function CampaignCanvas({ userId, onRequireAuth }: CampaignCanvasProps) {
  const { activeCampaignId: campaignId } = useActiveCampaign();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const { questions, sectionTextByNumber, loading, error, sectionIdByNumber } =
    useCampaignQuizData(campaignId);

  const {
    handleAnswer,
    markSectionComplete,
    markCampaignComplete,
    answeredQuestions,
    completedSections,
  } = useProgress();

  const { profile } = useUserProfile();

  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState('');

  // Reset index when campaign or questions change
  useEffect(() => {
    setIndex(0);
  }, [campaignId, questions.length]);

  if (!campaignId) return <div>Select a campaign to begin.</div>;
  if (loading) return <div>Loading campaign…</div>;
  if (error) return <div>Error loading campaign: {error.message}</div>;
  if (!questions.length) return <div>No questions found for this campaign.</div>;
  if (index >= questions.length)
    return <div>Campaign complete, {profile?.displayName ?? 'Friend'}!</div>;

  const current = questions[index];
  const sectionText = current.section ? sectionTextByNumber.get(current.section) : undefined;

  const onSubmit = async () => {
    if (authStatus !== 'authenticated' || !userId) {
      onRequireAuth?.();
      return;
    }
    const isCorrect =
      response.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase();

    await handleAnswer({
      questionId: current.id,
      responseText: response,
      isCorrect,
      xp: current.xpValue ?? undefined,
    });

    if (isCorrect) {
      const answered = new Set(answeredQuestions);
      answered.add(current.id);

      const sectionQs = questions.filter((q) => q.section === current.section);
      const allAnswered = sectionQs.every((q) => answered.has(q.id));

      if (allAnswered && current.section != null) {
        const secId = sectionIdByNumber.get(current.section);
        markSectionComplete(current.section, secId);

        const completed = new Set(completedSections);
        completed.add(current.section);

        const allSections = new Set(questions.map((q) => q.section));
        if ([...allSections].every((n) => completed.has(n))) {
          markCampaignComplete(campaignId);
        }
      }
    }

    setResponse('');
    setIndex((prev) => prev + 1);
  };

  return (
    <div data-campaign-id={campaignId ?? ''} data-user-id={userId}>
      {sectionText && <p>{sectionText}</p>}

      <div className="question-item">
        <p>{current.text}</p>
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />
        <button onClick={onSubmit}>Submit</button>
      </div>
    </div>
  );
}


