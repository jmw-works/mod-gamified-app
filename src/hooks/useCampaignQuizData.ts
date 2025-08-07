
import { useEffect, useRef, useState } from 'react';
import type { Question as QuestionUI } from '../types/QuestionTypes';
import { listSections } from '../services/sectionService';
import { listQuestions } from '../services/questionService';
function buildOrIdFilter(fieldName: 'sectionId' | 'campaignId', ids: string[]) {
  if (ids.length === 0) return undefined;
  if (ids.length === 1) return { [fieldName]: { eq: ids[0] } } as Record<string, unknown>;
  return {
    or: ids.map((id) => ({ [fieldName]: { eq: id } })),
  } as Record<string, unknown>;
}

export function useCampaignQuizData(activeCampaignId?: string | null) {
  const [questions, setQuestions] = useState<QuestionUI[]>([]);
  const [orderedSectionNumbers, setOrderedSectionNumbers] = useState<number[]>([]);
  const [sectionIdByNumber, setSectionIdByNumber] = useState<Map<number, string>>(new Map());
  const [sectionTextByNumber, setSectionTextByNumber] = useState<Map<number, string>>(new Map());
  const [sectionTitleByNumber, setSectionTitleByNumber] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);


  useEffect(() => {
    let cancelled = false;
    async function loadContentForCampaign(campaignId: string) {
      setLoading(true);
      setErr(null);
      try {
        const sRes = await listSections({
          filter: { campaignId: { eq: campaignId } },
          selectionSet: ['id', 'number', 'order', 'educationalText', 'title', 'isActive'],
        });

        const sections = (sRes.data ?? [])
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const numToId = new Map<number, string>();
        const idToNumber = new Map<string, number>();
        // Track section educational text and titles by section number (bug fix: single source of truth)
        const textByNum = new Map<number, string>();
        const titleByNum = new Map<number, string>();
        const orderedNums: number[] = [];

        for (const s of sections) {
          const n = (s.number ?? 0) as number;
          numToId.set(n, s.id);
          idToNumber.set(s.id, n);
          textByNum.set(n, s.educationalText ?? '');
          titleByNum.set(n, s.title ?? '');
          orderedNums.push(n);
        }

        if (cancelled) return;
        setSectionIdByNumber(numToId);
        setSectionTextByNumber(textByNum);
        setSectionTitleByNumber(titleByNum);
        setOrderedSectionNumbers(orderedNums);

        const sectionIds = sections.map((s) => s.id);
        if (sectionIds.length === 0) {
          if (!cancelled) {
            setQuestions([]);
          }
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
            'answers.id',
            'answers.content',
            'answers.isCorrect',
          ],
        });

        type QuestionRow = {
          id: string;
          text: string;
          sectionId?: string | null;
          order?: number | null;
          xpValue?: number | null;
          answers?: { id: string; content: string; isCorrect?: boolean | null }[];
        };

        const bySectionId = new Map<string, QuestionRow[]>();
        for (const q of (qRes.data ?? []) as unknown as QuestionRow[]) {
          const sid = q.sectionId ?? '';
          if (!bySectionId.has(sid)) bySectionId.set(sid, []);
          bySectionId.get(sid)!.push(q);
        }

        const qs: QuestionUI[] = [];
        for (const s of sections) {
          const rows = bySectionId.get(s.id) ?? [];
          rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const sectionNum = idToNumber.get(s.id) ?? 0;
          for (const row of rows) {
            qs.push({
              id: row.id,
              text: row.text,
              section: sectionNum,
              xpValue: row.xpValue ?? 10,
              answers: (row.answers ?? []).map((ans) => ({
                id: ans.id,
                content: ans.content,
                isCorrect: !!ans.isCorrect,
              })),
            });
          }
        }

        if (!cancelled) setQuestions(qs);

      } catch (e) {
        if (!cancelled) setErr(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!activeCampaignId) {
      setQuestions([]);
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
  }, [activeCampaignId]);

  return {
    questions,
    loading,
    error,
    orderedSectionNumbers,
    sectionTextByNumber,
    sectionTitleByNumber,
    sectionIdByNumber,
  };
}



