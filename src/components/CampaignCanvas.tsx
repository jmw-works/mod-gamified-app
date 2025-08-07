import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import ProgressContext from '../context/ProgressContext';
import UserProfileContext from '../context/UserProfileContext';
import { listCampaigns } from '../services/campaignService';
import SectionAccordion from './SectionAccordion';
import { fallbackCampaigns } from '../utils/fallbackContent';
import Skeleton from './Skeleton';

interface CampaignCanvasProps {
  userId: string;
  onRequireAuth?: () => void;
}

export default function CampaignCanvas({ userId, onRequireAuth }: CampaignCanvasProps) {
  const { activeCampaignId: campaignId } = useActiveCampaign();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const { sections, loading, error } = useCampaignQuizData(campaignId);
  const isGuest = authStatus !== 'authenticated' || !userId;

  const progress = useContext(ProgressContext);
  const handleAnswer = progress?.handleAnswer;
  const markSectionComplete = progress?.markSectionComplete;
  const markCampaignComplete = progress?.markCampaignComplete;
  const answeredQuestions = progress?.answeredQuestions ?? [];
  const completedSections = progress?.completedSections ?? [];

  const userProfile = useContext(UserProfileContext);
  const profile = userProfile?.profile ?? null;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [infoText, setInfoText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const onToggle = (idx: number) => {
    if (isGuest && idx > 0) {
      onRequireAuth?.();
      setShowSignupPrompt(true);
      return;
    }
    setExpandedIndex((prev) => {
      if (prev === idx) return null;
      if (prev === null || idx <= prev) return idx;
      return prev;
    });
  };

  // Reset indices when campaign or sections change
  useEffect(() => {
    onToggle(0);
    setQuestionIndex(0);
  }, [campaignId, sections.length]);

  useEffect(() => {
    let cancelled = false;
    async function loadInfo() {
      if (!campaignId) {
        if (!cancelled) setInfoText(null);
        return;
      }
      const fb = fallbackCampaigns.find((c) => c.id === campaignId)?.infoText ?? null;
      try {
        const res = await listCampaigns({
          filter: { id: { eq: campaignId } },
          selectionSet: ['id', 'infoText'],
        });
        if (!cancelled) setInfoText(res.data?.[0]?.infoText ?? fb);
      } catch {
        if (!cancelled) setInfoText(fb);
      }
    }
    loadInfo();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  useEffect(() => {
    if (!isGuest) setShowSignupPrompt(false);
  }, [isGuest]);

  if (!campaignId) return <div>Select a campaign to begin.</div>;
  if (loading) return <Skeleton height="200px" />;
  if (error) return <div>Error loading campaign: {error.message}</div>;
  const sectionsWithQuestions = sections.filter((s) => s.questions.length > 0);
  if (!sectionsWithQuestions.length)
    return <div>No questions found for this campaign.</div>;
  if (expandedIndex !== null && expandedIndex >= sectionsWithQuestions.length)
    return <div>Campaign complete, {profile?.displayName ?? 'Friend'}!</div>;

  if (expandedIndex === null)
    return <div>Select a section to begin.</div>;

  const currentSection = sectionsWithQuestions[expandedIndex];
  const current = currentSection.questions[questionIndex];
  const sectionTitle = currentSection.title;
  const sectionText = currentSection.text;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGuest && currentSection.number !== 1) {
      onRequireAuth?.();
      setShowSignupPrompt(true);
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
      sectionId: currentSection.id,
    });

    if (isCorrect) {
      const answered = new Set(answeredQuestions);
      answered.add(current.id);

      const sectionQs = currentSection.questions;
      const allAnswered = sectionQs.every((q) => answered.has(q.id));

      if (allAnswered) {
        markSectionComplete?.(currentSection.number, currentSection.id);

        const completed = new Set(completedSections);
        completed.add(currentSection.number);

        if (
          sectionsWithQuestions.every((s) => completed.has(s.number))
        ) {
          markCampaignComplete?.(campaignId);
        }
      }

      setFeedback('Correct!');
      const isLastQuestion =
        questionIndex + 1 >= currentSection.questions.length;
      setTimeout(() => {
        setFeedback(null);
        setResponse('');
        if (!isLastQuestion) {
          setQuestionIndex((prev) => prev + 1);
        } else {
          if (isGuest && currentSection.number === 1) {
            onRequireAuth?.();
            setShowSignupPrompt(true);
            setQuestionIndex(0);
          } else {
            setExpandedIndex((s) => (s === null ? 0 : s + 1));
            setQuestionIndex(0);
          }
        }
      }, 1000);
    } else {
      setFeedback('Try again');
    }
  };

  return (
    <div data-campaign-id={campaignId ?? ''} data-user-id={userId}>
      {infoText && <p>{infoText}</p>}
      {showSignupPrompt && (
        <p className="signup-prompt">Create an account to continue.</p>
      )}
      <SectionAccordion title={sectionTitle ?? ''} sectionId={currentSection.id}>
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
      </SectionAccordion>
    </div>
  );
}




