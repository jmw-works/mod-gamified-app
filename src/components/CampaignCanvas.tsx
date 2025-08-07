// src/components/CampaignCanvas.tsx
import { useEffect, useMemo } from 'react';
import { Heading, Text } from '@aws-amplify/ui-react';
import QuizSection from './QuizSection';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useActiveCampaign } from '../hooks/useActiveCampaign';
import type { Progress } from '../types/ProgressTypes';
import { createEmptyProgress } from '../types/ProgressTypes';

interface Props {
  userId: string;
  displayName: string;
  onProgress?: (p: Progress) => void;
}

export default function CampaignCanvas({ userId, displayName, onProgress }: Props) {
  const { activeCampaignId } = useActiveCampaign();

  const {
    questions,
    progress,
    handleAnswer,
    orderedSectionNumbers,
    sectionTextByNumber,
  } = useCampaignQuizData(userId, activeCampaignId);

  useEffect(() => {
    if (progress && onProgress) onProgress(progress);
  }, [progress, onProgress]);

  const groupedBySection = useMemo(() => {
    const map = new Map<number, typeof questions>();
    for (const q of questions) {
      const list = map.get(q.section) ?? [];
      map.set(q.section, [...list, q]);
    }
    return map;
  }, [questions]);

  const safeProgress = progress ?? createEmptyProgress(userId);

  if (!activeCampaignId) {
    return (
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Heading level={2}>Hey {displayName}! Let&apos;s jump in.</Heading>
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
          safeProgress.completedSections.includes(sectionNum) === false &&
          sectionNum !== orderedSectionNumbers[0] &&
          !safeProgress.completedSections.includes(orderedSectionNumbers[idx - 1]);

        return (
          <QuizSection
            key={`sec-${sectionNum}`}
            title={`Section ${sectionNum}`}
            educationalText={sectionTextByNumber.get(sectionNum) ?? ''}
            questions={questionsInSection}
            progress={safeProgress}
            handleAnswer={handleAnswer}
            isLocked={isLocked}
            initialOpen={idx === 0}
          />
        );
      })}
    </>
  );
}

