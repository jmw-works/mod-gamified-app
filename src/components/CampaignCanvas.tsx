import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import ProgressContext from '../context/ProgressContext';
import UserProfileContext from '../context/UserProfileContext';
import { listCampaigns } from '../services/campaignService';

interface CampaignCanvasProps {
  userId: string;
  onRequireAuth?: () => void;
}

export default function CampaignCanvas({ userId, onRequireAuth }: CampaignCanvasProps) {
  const { activeCampaignId: campaignId } = useActiveCampaign();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const {
    questions,
    sectionTextByNumber,
    sectionTitleByNumber,
    loading,
    error,
    sectionIdByNumber,
  } = useCampaignQuizData(campaignId);

  const progress = useContext(ProgressContext);
  const handleAnswer = progress?.handleAnswer;
  const markSectionComplete = progress?.markSectionComplete;
  const markCampaignComplete = progress?.markCampaignComplete;
  const answeredQuestions = progress?.answeredQuestions ?? [];
  const isSectionComplete = progress?.isSectionComplete;

  const userProfile = useContext(UserProfileContext);
  const profile = userProfile?.profile ?? null;

  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [infoText, setInfoText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset index when campaign or questions change
  useEffect(() => {
    setIndex(0);
  }, [campaignId, questions.length]);

  useEffect(() => {
    let cancelled = false;
    async function loadInfo() {
      if (!campaignId) {
        if (!cancelled) setInfoText(null);
        return;
      }
      try {
        const res = await listCampaigns({
          filter: { id: { eq: campaignId } },
          selectionSet: ['id', 'infoText'],
        });
        if (!cancelled) setInfoText(res.data?.[0]?.infoText ?? null);
      } catch {
        if (!cancelled) setInfoText(null);
      }
    }
    loadInfo();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (!campaignId) return <div>Select a campaign to begin.</div>;
  if (loading) return <div>Loading campaign…</div>;
  if (error) return <div>Error loading campaign: {error.message}</div>;
  if (!questions.length) return <div>No questions found for this campaign.</div>;
  if (index >= questions.length)
    return <div>Campaign complete, {profile?.displayName ?? 'Friend'}!</div>;

  const current = questions[index];
  const sectionTitle = current.section
    ? sectionTitleByNumber.get(current.section)
    : undefined;
  const sectionText = current.section
    ? sectionTextByNumber.get(current.section)
    : undefined;

  const isLocked =
    current.section != null &&
    current.section > 1 &&
    !isSectionComplete?.(current.section - 1);

  if (isLocked) {
    return <div>Section locked. Complete previous sections to continue.</div>;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (authStatus !== 'authenticated' || !userId) {
      onRequireAuth?.();
      return;
    }
    const userAnswer = response.trim();
    const isCorrect =
      userAnswer.toLowerCase() ===
      current.correctAnswer?.trim().toLowerCase();

    await handleAnswer?.({
      questionId: current.id,
      userAnswer,
      isCorrect,
      xp: current.xpValue ?? undefined,
      sectionId: sectionIdByNumber.get(current.section),
    });

    if (isCorrect) {
      const answered = new Set(answeredQuestions);
      answered.add(current.id);

      const sectionQs = questions.filter((q) => q.section === current.section);
      const allAnswered = sectionQs.every((q) => answered.has(q.id));

      if (allAnswered && current.section != null) {
        const secId = sectionIdByNumber.get(current.section);
        markSectionComplete?.(current.section, secId);
        const allSections = new Set(questions.map((q) => q.section));
        const allCompleted = [...allSections].every(
          (n) => n === current.section || isSectionComplete?.(n)
        );
        if (allCompleted) {
          markCampaignComplete?.(campaignId);
        }
      }

      setFeedback('Correct!');
      setTimeout(() => {
        setFeedback(null);
        setResponse('');
        setIndex((prev) => prev + 1);
      }, 1000);
    } else {
      setFeedback('Try again');
    }
  };

  return (
    <div data-campaign-id={campaignId ?? ''} data-user-id={userId}>
      {infoText && <p>{infoText}</p>}
      {sectionTitle && <h3 className="current-section-title">{sectionTitle}</h3>}
      {sectionText && <p className="current-section-text">{sectionText}</p>}

      <div className="question-item">
        <p>{current.text}</p>
        <form onSubmit={onSubmit}>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        {feedback && <p className="answer-feedback">{feedback}</p>}
      </div>
    </div>
  );
}




