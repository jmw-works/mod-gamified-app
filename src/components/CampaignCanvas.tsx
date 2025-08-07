import { useContext, useEffect, useState } from 'react';
import { useCampaignQuizData } from '../hooks/useCampaignQuizData';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import ProgressContext from '../context/ProgressContext';
import UserProfileContext from '../context/UserProfileContext';
import { listCampaigns } from '../services/campaignService';
import SectionAccordion from './SectionAccordion';

interface CampaignCanvasProps {
  userId: string;
}

export default function CampaignCanvas({ userId }: CampaignCanvasProps) {
  const { activeCampaignId: campaignId } = useActiveCampaign();

  const {
    questions,
    sectionTextByNumber,
    sectionTitleByNumber,
    loading,
    error,
    sectionIdByNumber,
    orderedSectionNumbers,
  } = useCampaignQuizData(campaignId);

  const progress = useContext(ProgressContext);
  const markSectionComplete = progress?.markSectionComplete;
  const markCampaignComplete = progress?.markCampaignComplete;

  const userProfile = useContext(UserProfileContext);
  const profile = userProfile?.profile ?? null;

  const [infoText, setInfoText] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [campaignDone, setCampaignDone] = useState(false);

  useEffect(() => {
    setExpandedIndex(0);
    setCampaignDone(false);
  }, [campaignId]);

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

  const sections = orderedSectionNumbers.map((num) => ({
    number: num,
    title: sectionTitleByNumber.get(num) ?? '',
    text: sectionTextByNumber.get(num) ?? '',
    sectionId: sectionIdByNumber.get(num),
    questions: questions.filter((q) => q.section === num),
  }));

  if (!sections.length) return <div>No questions found for this campaign.</div>;

  const handleSectionComplete = (index: number, sectionNum: number, sectionId?: string) => {
    markSectionComplete?.(sectionNum, sectionId);
    if (index === sections.length - 1) {
      markCampaignComplete?.(campaignId);
      setCampaignDone(true);
    } else {
      setExpandedIndex(index + 1);
    }
  };

  if (campaignDone) {
    return <div>Campaign complete, {profile?.displayName ?? 'Friend'}!</div>;
  }

  return (
    <div data-campaign-id={campaignId ?? ''} data-user-id={userId}>
      {infoText && <p>{infoText}</p>}
      {sections.map((section, idx) => (
        <SectionAccordion
          key={section.number}
          title={section.title}
          educationalText={section.text}
          questions={section.questions}
          locked={idx > expandedIndex}
          expanded={idx === expandedIndex}
          onToggle={() => {
            if (idx === expandedIndex) return;
            if (idx <= expandedIndex) setExpandedIndex(idx);
          }}
          onComplete={() =>
            handleSectionComplete(idx, section.number, section.sectionId)
          }
        />
      ))}
    </div>
  );
}

