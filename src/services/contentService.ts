import { ServiceError } from './serviceError';
import { client } from './client';

export interface CampaignSummary {
  id: string;
  title?: string | null;
  description?: string | null;
  infoText?: string | null;
  thumbnailUrl?: string | null;
  order: number;
  isActive: boolean;
}

export interface CampaignWithSections {
  campaign: CampaignSummary;
  sections: SectionWithQuestions[];
}

export interface SectionWithQuestions {
  id: string;
  number: number;
  title: string;
  text: string;
  unlockRule?: 'ALL_PREV_CORRECT' | 'PERCENT' | 'MANUAL';
  unlockThreshold?: number | null;
  questions: QuestionRow[];
}

export interface QuestionRow {
  id: string;
  text: string;
  section: number;
  xpValue: number;
  correctAnswer: string;
  hint?: string;
  explanation?: string;
}

export type AuthMode = 'apiKey' | 'identityPool' | 'userPool' | 'iam';

/**
 * List all active campaigns ordered by campaignOrder then itemOrder.
 */
export async function listCampaigns(authMode: AuthMode = 'apiKey'): Promise<CampaignSummary[]> {
  try {
    const res = await client.models.CampaignContent.list({
      filter: { itemType: { eq: 'CAMPAIGN' } },
      selectionSet: [
        'id',
        'campaignSlug',
        'campaignOrder',
        'itemOrder',
        'title',
        'description',
        'infoText',
        'thumbnailUrl',
        'isActive',
      ],
      authMode,
    });
    const rows = res.data ?? [];
    return rows
      .filter((r) => r.isActive !== false)
      .sort(
        (a, b) =>
          (a.campaignOrder ?? 0) - (b.campaignOrder ?? 0) ||
          (a.itemOrder ?? 0) - (b.itemOrder ?? 0),
      )
      .map((r) => ({
        id: r.campaignSlug,
        title: r.title ?? null,
        description: r.description ?? null,
        infoText: r.infoText ?? null,
        thumbnailUrl: r.thumbnailUrl ?? null,
        order: r.campaignOrder ?? 0,
        isActive: r.isActive !== false,
      }));
  } catch (err) {
    console.error('listCampaigns failed', err);
    throw new ServiceError('Failed to list campaigns', { cause: err });
  }
}

/**
 * Fetch a campaign with its sections and questions, mapped to the legacy shape
 * expected by the UI.
 */
export async function getCampaignWithSectionsAndQuestions(
  slug: string,
  authMode: AuthMode = 'apiKey',
): Promise<CampaignWithSections> {
  try {
    const cRes = await client.models.CampaignContent.list({
      filter: { itemType: { eq: 'CAMPAIGN' }, campaignSlug: { eq: slug } },
      selectionSet: [
        'campaignSlug',
        'campaignOrder',
        'itemOrder',
        'title',
        'description',
        'infoText',
        'thumbnailUrl',
        'isActive',
      ],
      authMode,
    });
    const campaignRow = cRes.data?.[0];
    if (!campaignRow) {
      throw new ServiceError('Campaign not found');
    }

    const campaign: CampaignSummary = {
      id: campaignRow.campaignSlug,
      title: campaignRow.title ?? null,
      description: campaignRow.description ?? null,
      infoText: campaignRow.infoText ?? null,
      thumbnailUrl: campaignRow.thumbnailUrl ?? null,
      order: campaignRow.campaignOrder ?? 0,
      isActive: campaignRow.isActive !== false,
    };

    const sRes = await client.models.CampaignContent.list({
      filter: { itemType: { eq: 'SECTION' }, campaignSlug: { eq: slug } },
      selectionSet: [
        'id',
        'sectionNumber',
        'itemOrder',
        'sectionTitle',
        'educationalText',
        'educationalRichText',
        'sectionIsActive',
        'unlockRule',
        'unlockThreshold',
      ],
      authMode,
    });
    const sectionsRaw = (sRes.data ?? [])
      .filter((s) => s.sectionIsActive !== false)
      .sort(
        (a, b) =>
          (a.sectionNumber ?? 0) - (b.sectionNumber ?? 0) ||
          (a.itemOrder ?? 0) - (b.itemOrder ?? 0),
      );

    const sections: SectionWithQuestions[] = [];
    for (const s of sectionsRaw) {
      const qRes = await client.models.CampaignContent.list({
        filter: {
          itemType: { eq: 'QUESTION' },
          campaignSlug: { eq: slug },
          sectionNumber: { eq: s.sectionNumber as number },
        },
        selectionSet: [
          'id',
          'itemOrder',
          'questionText',
          'correctAnswer',
          'xpValue',
          'questionIsActive',
          'hint',
          'explanation',
        ],
        authMode,
      });
      const qRows = (qRes.data ?? []) as Array<{
        id: string;
        itemOrder?: number | null;
        questionText?: string | null;
        correctAnswer?: string | null;
        xpValue?: number | null;
        questionIsActive?: boolean | null;
        hint?: string | null;
        explanation?: string | null;
      }>;
      const questions: QuestionRow[] = qRows
        .filter((q) => q.questionIsActive !== false)
        .sort((a, b) => (a.itemOrder ?? 0) - (b.itemOrder ?? 0))
        .map((q) => ({
          id: q.id,
          text: q.questionText ?? '',
          section: s.sectionNumber ?? 0,
          xpValue: q.xpValue ?? 10,
          correctAnswer: q.correctAnswer ?? '',
          hint: q.hint ?? undefined,
          explanation: q.explanation ?? undefined,
        }));

      sections.push({
        id: s.id,
        number: s.sectionNumber ?? 0,
        title: s.sectionTitle ?? '',
        text: s.educationalRichText ?? s.educationalText ?? '',
        unlockRule: (s.unlockRule as SectionWithQuestions['unlockRule']) ?? 'ALL_PREV_CORRECT',
        unlockThreshold: s.unlockThreshold ?? 100,
        questions,
      });
    }

    return { campaign, sections };
  } catch (err) {
    console.error('getCampaignWithSectionsAndQuestions failed', err);
    throw new ServiceError('Failed to load campaign', { cause: err });
  }
}
