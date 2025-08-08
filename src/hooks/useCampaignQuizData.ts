import { useContext, useEffect, useState } from 'react';
import type { Question as QuestionUI, HandleAnswer } from '../types/QuestionTypes';
import { listSections } from '../services/sectionService';
import { listQuestions } from '../services/questionService';
import { ensureSeedData } from '../utils/seedData';
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

function buildOrIdFilter(fieldName: 'sectionId' | 'campaignId', ids: string[]) {
  if (ids.length === 0) return undefined;
  if (ids.length === 1) return { [fieldName]: { eq: ids[0] } } as Record<string, unknown>;
  return {
    or: ids.map((id) => ({ [fieldName]: { eq: id } })),
  } as Record<string, unknown>;
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
        await ensureSeedData(); // TODO: re-enable auth gating

        const sRes = await listSections({
          filter: { campaignId: { eq: campaignId } },
          selectionSet: [
            'id',
            'number',
            'order',
            'educationalText',
            'educationalRichText',
            'title',
            'isActive',
          ],
          authMode: publicMode ? 'apiKey' : 'identityPool', // TODO: re-enable auth gating
        });

        const rawSections = (sRes.data ?? [])
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
        const idToNumber = new Map<string, number>();
        const textByNum = new Map<number, string>();
        const titleByNum = new Map<number, string>();
        const orderedNums: number[] = [];
        const sectionObjs: QuizSection[] = [];
        const sectionById = new Map<string, QuizSection>();

        for (const s of rawSections) {
          const n = (s.number ?? 0) as number;
          const section: QuizSection = {
            number: n,
            id: s.id,
            title: s.title ?? '',
            text: s.educationalRichText ?? s.educationalText ?? '',
            questions: [],
          };
          sectionObjs.push(section);
          sectionById.set(s.id, section);
          numToId.set(n, s.id);
          idToNumber.set(s.id, n);
          textByNum.set(n, section.text);
          titleByNum.set(n, section.title);
          orderedNums.push(n);
        }

        if (cancelled) return;
        setSectionIdByNumber(numToId);
        setSectionTextByNumber(textByNum);
        setSectionTitleByNumber(titleByNum);
        setOrderedSectionNumbers(orderedNums);

        const sectionIds = rawSections.map((s) => s.id);
        if (sectionIds.length === 0) {
          if (!cancelled) setSections([]);
          return;
        }

        const qFilter = buildOrIdFilter('sectionId', sectionIds);
        const qRes = await listQuestions({
          ...(qFilter ? { filter: qFilter } : {}),
          selectionSet: [
            'id',
            'text',
            'sectionId',
            'order',
            'xpValue',
            'correctAnswer',
            'hint',
            'explanation',
          ],
          authMode: publicMode ? 'apiKey' : 'identityPool', // TODO: re-enable auth gating
        });

        type QuestionRow = {
          id: string;
          text: string;
          sectionId?: string | null;
          order?: number | null;
          xpValue?: number | null;
          correctAnswer?: string;
          hint?: string | null;
          explanation?: string | null;
        };

        const bySectionId = new Map<string, QuestionRow[]>();
        for (const q of (qRes.data ?? []) as QuestionRow[]) {
          const sid = q.sectionId ?? '';
          if (!bySectionId.has(sid)) bySectionId.set(sid, []);
          bySectionId.get(sid)!.push(q);
        }

        for (const s of rawSections) {
          const rows = bySectionId.get(s.id) ?? [];
          rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const sectionNum = idToNumber.get(s.id) ?? 0;
          const sectionObj = sectionById.get(s.id)!;
          for (const row of rows) {
            sectionObj.questions.push({
              id: row.id,
              text: row.text,
              section: sectionNum,
              xpValue: row.xpValue ?? 10,
              correctAnswer: row.correctAnswer ?? '',
              hint: row.hint ?? undefined,
              explanation: row.explanation ?? undefined,
            });
          }
        }

        if (!cancelled) setSections(sectionObjs);
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




