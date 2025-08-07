import {
  listCampaigns,
  createCampaign,
} from '../services/campaignService';
import { listSections, createSection } from '../services/sectionService';
import { listQuestions, createQuestion } from '../services/questionService';

// Deterministically generate campaign/section/question structure so that
// development environments can auto-populate placeholder content.

const TOTAL_CAMPAIGNS = 65;

let seeding: Promise<void> | null = null;

export async function ensureSeedData() {
  if (!seeding) seeding = seedAll();
  return seeding;
}

function sectionsForCampaign(index: number): number {
  if (index <= 20) return 3;
  if (index <= 40) return 4;
  if (index <= 55) return 5;
  return 6;
}

function questionsForSection(cIdx: number, sIdx: number): number {
  if (cIdx <= 20) return 2 + (sIdx % 2); // 2-3
  if (cIdx <= 40) return 3 + (sIdx % 2); // 3-4
  if (cIdx <= 55) return 4; // constant 4
  return 4 + (sIdx % 2); // 4-5
}

async function seedAll() {
  try {
    const existing = await listCampaigns({ selectionSet: ['id'] });
    const have = new Set((existing.data ?? []).map((c) => c.id));

    for (let i = 1; i <= TOTAL_CAMPAIGNS; i++) {
      const campaignId = `campaign-${i}`;
      if (!have.has(campaignId)) {
        await createCampaign({
          id: campaignId,
          slug: campaignId,
          title: `Campaign ${i}`,
          description: `Placeholder description for Campaign ${i}`,
          infoText: `Placeholder info for Campaign ${i}`,
          order: i,
          isActive: true,
        });
      }
      await ensureSectionsAndQuestions(campaignId, i);
    }
  } catch (err) {
    console.error('Failed to seed data', err);
  }
}

async function ensureSectionsAndQuestions(campaignId: string, cIndex: number) {
  const neededSections = sectionsForCampaign(cIndex);
  const sRes = await listSections({
    filter: { campaignId: { eq: campaignId } },
    selectionSet: ['id', 'number'],
  });
  const existing = new Map<number, string>();
  for (const row of sRes.data ?? []) {
    const num = row.number ?? 0;
    existing.set(num, row.id);
  }

  for (let s = 1; s <= neededSections; s++) {
    let sectionId = existing.get(s);
    if (!sectionId) {
      sectionId = `${campaignId}-section-${s}`;
      await createSection({
        id: sectionId,
        campaignId,
        number: s,
        order: s,
        title: `Section ${cIndex}.${s}`,
        educationalText: `Placeholder text for Section ${cIndex}.${s}`,
        isActive: true,
      });
    }
    await ensureQuestions(sectionId, cIndex, s);
  }
}

async function ensureQuestions(sectionId: string, cIndex: number, sIndex: number) {
  const needed = questionsForSection(cIndex, sIndex);
  const qRes = await listQuestions({
    filter: { sectionId: { eq: sectionId } },
    selectionSet: ['id'],
  });
  const existing = new Set((qRes.data ?? []).map((q) => q.id));

  for (let q = 1; q <= needed; q++) {
    const questionId = `${sectionId}-question-${q}`;
    if (existing.has(questionId)) continue;
    await createQuestion({
      id: questionId,
      sectionId,
      text: `Question ${cIndex}.${sIndex}.${q}?`,
      correctAnswer: 'Placeholder',
      order: q,
      xpValue: 10,
    });
  }
}

