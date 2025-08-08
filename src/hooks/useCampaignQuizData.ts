import { useContext, useEffect, useState } from 'react';
import type { Question as QuestionUI, HandleAnswer } from '../types/QuestionTypes';
import { getCampaignWithSectionsAndQuestions } from '../services/contentService';
import { fallbackSectionsByCampaign } from '../utils/fallbackContent';
import ProgressContext from '../context/ProgressContext';
import type { Progress } from '../types/ProgressTypes';

interface QuizSection {
  number: number;
  id: string;
  title: string;
  text: string;
  questions: QuestionUI[];
}

/**
 * Load questions/sections for the currently active campaign.  In public mode
 * the hook uses unauthenticated requests against the Amplify Data API and
 * falls back to locally bundled seed data if those requests fail.  This allows
 * the public shell to render campaign content without requiring the user to
 * sign in.
 */
export function useCampaignQuizData(
  activeCampaignId?: string | null,
  publicMode = false,
) {
  const [sections, setSections] = useState<QuizSection[]>([]);
  const [orderedSectionNumbers, setOrderedSectionNumbers] = useState<number[]>([]);
  const [sectionIdByNumber, setSectionIdByNumber] = useState<Map<number, string>>(new Map());
  const [sectionTextByNumber, setSectionTextByNumber] = useState<Map<number, string>>(new Map());
  const [sectionTitleByNumber, setSectionTitleByNumber] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<Error | null>(null);
  const progress = useContext(ProgressContext);

  useEffect(() => {
    let cancelled = false;

    async function loadContentForCampaign(campaignId: string) {
      setLoading(true);
      setErr(null);

      // Helper used when the backend is unreachable or empty.  It converts the
      // static fallback content into the same structures returned by the
      // service calls.
      const loadFallback = () => {
        const fallbackSections = fallbackSectionsByCampaign[campaignId] ?? [];
        const numToId = new Map<number, string>();
        const textByNum = new Map<number, string>();
        const titleByNum = new Map<number, string>();
        const orderedNums: number[] = [];
        const sectionObjs: QuizSection[] = [];

        for (const s of fallbackSections) {
          const section: QuizSection = {
            number: s.number,
            id: s.id,
            title: s.title,
            text: s.text,
            questions: s.questions.map((q) => ({
              id: q.id,
              text: q.text,
              section: q.section,
              xpValue: q.xpValue ?? 10,
              correctAnswer: q.correctAnswer,
            })),
          };
          sectionObjs.push(section);
          numToId.set(s.number, s.id);
          textByNum.set(s.number, s.text);
          titleByNum.set(s.number, s.title);
          orderedNums.push(s.number);
        }

        setSectionIdByNumber(numToId);
        setSectionTextByNumber(textByNum);
        setSectionTitleByNumber(titleByNum);
        setOrderedSectionNumbers(orderedNums);
        setSections(sectionObjs);
        setLoading(false);
      };

      try {
        const data = await getCampaignWithSectionsAndQuestions(
          campaignId,
          publicMode ? 'apiKey' : 'identityPool',
        );

        const rawSections = data.sections;

        if (publicMode && rawSections.length === 0) {
          loadFallback();
          return;
        }

        if (rawSections.length === 0) {
          if (!cancelled) {
            setSectionIdByNumber(new Map());
            setSectionTextByNumber(new Map());
            setSectionTitleByNumber(new Map());
            setOrderedSectionNumbers([]);
            setSections([]);
          }
          return;
        }

        const numToId = new Map<number, string>();
        const textByNum = new Map<number, string>();
        const titleByNum = new Map<number, string>();
        const orderedNums: number[] = [];
        const sectionObjs: QuizSection[] = [];

        for (const s of rawSections) {
          const n = s.number;
          const section: QuizSection = {
            number: n,
            id: s.id,
            title: s.title,
            text: s.text,
            questions: s.questions.map((q) => ({
              id: q.id,
              text: q.text,
              section: n,
              xpValue: q.xpValue,
              correctAnswer: q.correctAnswer,
              hint: q.hint,
              explanation: q.explanation,
            })),
          };
          sectionObjs.push(section);
          numToId.set(n, s.id);
          textByNum.set(n, section.text);
          titleByNum.set(n, section.title);
          orderedNums.push(n);
        }

        if (!cancelled) {
          setSectionIdByNumber(numToId);
          setSectionTextByNumber(textByNum);
          setSectionTitleByNumber(titleByNum);
          setOrderedSectionNumbers(orderedNums);
          setSections(sectionObjs);
        }
      } catch (e) {
        if (publicMode) {
          loadFallback();
        } else if (!cancelled) {
          setErr(e as Error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!activeCampaignId) {
      setSections([]);
      setOrderedSectionNumbers([]);
      setSectionIdByNumber(new Map());
      setSectionTextByNumber(new Map());
      setSectionTitleByNumber(new Map());
      setLoading(false);
      return;
    }

    loadContentForCampaign(activeCampaignId);
    return () => {
      cancelled = true;
    };
  }, [activeCampaignId, publicMode]);

  const questions: QuestionUI[] = sections.flatMap((s) => s.questions);
  const handleAnswer: HandleAnswer | undefined = progress?.handleAnswer;

  return {
    sections,
    questions,
    progress: progress as Progress | undefined,
    handleAnswer,
    loading,
    error,
    orderedSectionNumbers,
    sectionTextByNumber,
    sectionTitleByNumber,
    sectionIdByNumber,
  };
}




