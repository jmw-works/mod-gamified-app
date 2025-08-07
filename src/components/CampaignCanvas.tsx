import { useEffect, useMemo } from 'react';
import { Heading, Text } from '@aws-amplify/ui-react';

import SectionAccordion from './SectionAccordion';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import type { Progress } from '../types/ProgressTypes';
import { createEmptyProgress } from '../types/ProgressTypes';

interface Props {
  displayName?: string;
  onProgress?: (p: Progress) => void;
  onRequireAuth?: () => void;
}

export default function CampaignCanvas({ displayName, onProgress }: Props) {
  const { activeCampaignId } = useActiveCampaign();

  const {
    questions,
    progress,
    handleAnswer,
    orderedSectionNumbers,
    sectionTextByNumber,
    sectionTitleByNumber,
    sectionIdByNumber,
  } = useCampaignQuizData(activeCampaignId);

  useEffect(() => {
    if (progress && onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  const groupedBySection = useMemo(() => {
    const map = new Map<number, typeof questions>();
    for (const q of questions) {
      const list = map.get(q.section) ?? [];
      map.set(q.section, [...list, q]);
    }
    return map;
  }, [questions]);

  useEffect(() => {
    if (!progress) return;
    for (const sectionNum of orderedSectionNumbers) {
      const questionsInSection = groupedBySection.get(sectionNum) ?? [];
      const allAnswered = questionsInSection.every((q) =>
        progress.answeredQuestions.includes(q.id)
      );
      if (
        allAnswered &&
        !progress.completedSections.includes(sectionNum)
      ) {
        progress.markSectionComplete(
          sectionNum,
          sectionIdByNumber.get(sectionNum)
        );
      }
    }
    const allSectionsDone = orderedSectionNumbers.every((n) =>
      progress.completedSections.includes(n)
    );
    if (allSectionsDone && activeCampaignId) {
      progress.markCampaignComplete(activeCampaignId);
    }
  }, [
    progress,
    groupedBySection,
    orderedSectionNumbers,
    sectionIdByNumber,
    activeCampaignId,
  ]);

  const safeProgress = progress ?? createEmptyProgress();

  if (!activeCampaignId) {
    return (
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Heading level={2}>Hey {displayName ?? 'Friend'}! Let&apos;s jump in.</Heading>
        <Text fontSize="1rem" style={{ marginTop: 8, color: '#444' }}>
          Discover a world of learning and adventure as you hone your treasure hunting skills.
        </Text>
        <img
          src="/adventure_is_out_there.png"
          alt="Adventure is out there"
          style={{ marginTop: 24, width: '85%', maxWidth: 600, height: 'auto' }}
        />
      </div>
    );
  }

  return (
    <>
      {orderedSectionNumbers.map((sectionNum, idx) => {
        const questionsInSection = groupedBySection.get(sectionNum) ?? [];
        const isLocked =
          !safeProgress.completedSections.includes(sectionNum) &&
          sectionNum !== orderedSectionNumbers[0] &&
          !safeProgress.completedSections.includes(orderedSectionNumbers[idx - 1]);
        const answeredCount = questionsInSection.filter((q) =>
          safeProgress.answeredQuestions.includes(q.id)
        ).length;

        return (
          <SectionAccordion
            key={`sec-${sectionNum}`}
            title={sectionTitleByNumber.get(sectionNum) ?? `Section ${sectionNum}`}
            locked={isLocked}
            sectionId={sectionIdByNumber.get(sectionNum)}
            completed={safeProgress.completedSections.includes(sectionNum)}
            progress={{ current: answeredCount, total: questionsInSection.length }}
          >
            <div style={{ padding: '0.75rem 1rem' }}>
              <p>{sectionTextByNumber.get(sectionNum) ?? ''}</p>
              <ul>
                {questionsInSection.map((q) => (
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
                            sectionId: sectionIdByNumber.get(sectionNum),
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
          </SectionAccordion>
        );
      })}
    </>
  );
}
