import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

const client = generateClient<Schema>();
const auth = { authMode: 'iam' as const };

async function main() {
  try {
    await client.models.CampaignContent.create({
      id: 'quick-demo-1-campaign',
      campaignSlug: 'quick-demo-1',
      itemType: 'CAMPAIGN',
      campaignOrder: 1,
      itemOrder: 1,
      title: 'Quick Demo',
      isActive: true,
    }, auth);

    await client.models.CampaignContent.create({
      id: 'quick-demo-1-section-1',
      campaignSlug: 'quick-demo-1',
      itemType: 'SECTION',
      campaignOrder: 1,
      sectionNumber: 1,
      itemOrder: 1,
      sectionTitle: 'Intro',
      educationalText: 'Answer to proceed',
      unlockRule: 'ALL_PREV_CORRECT',
    }, auth);
    await client.models.CampaignContent.create({
      id: 'quick-demo-1-section-2',
      campaignSlug: 'quick-demo-1',
      itemType: 'SECTION',
      campaignOrder: 1,
      sectionNumber: 2,
      itemOrder: 1,
      sectionTitle: 'Next Steps',
      educationalText: 'Keep going',
      unlockRule: 'ALL_PREV_CORRECT',
    }, auth);

    await client.models.CampaignContent.create({
      id: 'quick-demo-1-q-1',
      campaignSlug: 'quick-demo-1',
      itemType: 'QUESTION',
      campaignOrder: 1,
      sectionNumber: 1,
      itemOrder: 1,
      questionText: '2 + 2 ?',
      correctAnswer: '4',
      xpValue: 10,
    }, auth);
    await client.models.CampaignContent.create({
      id: 'quick-demo-1-q-2',
      campaignSlug: 'quick-demo-1',
      itemType: 'QUESTION',
      campaignOrder: 1,
      sectionNumber: 1,
      itemOrder: 2,
      questionText: 'Cipher that shifts letters?',
      correctAnswer: 'caesar',
      xpValue: 10,
    }, auth);
    await client.models.CampaignContent.create({
      id: 'quick-demo-1-q-3',
      campaignSlug: 'quick-demo-1',
      itemType: 'QUESTION',
      campaignOrder: 1,
      sectionNumber: 2,
      itemOrder: 1,
      questionText: 'Spell trea__',
      correctAnswer: 'sure',
      xpValue: 10,
    }, auth);

    console.log('Seeded quick demo campaign');
  } catch (err) {
    console.error('quickSeed failed', err);
  }
}

main();
