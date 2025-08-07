import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

// Configure Amplify and default to IAM auth so this script can run with
// locally configured AWS credentials.
Amplify.configure(outputs);
const client = generateClient<Schema>();
const auth = { authMode: 'iam' as const };

async function seedOrders() {
  const campaigns = await client.models.Campaign.list({
    selectionSet: ['id'],
    ...auth,
  });
  for (const campaign of campaigns.data ?? []) {
    const campaignId = campaign.id;
    console.log(`Processing campaign ${campaignId}`);

    const sectionRes = await client.models.Section.list({
      filter: { campaignId: { eq: campaignId } },
      selectionSet: ['id', 'number'],
      ...auth,
    });

    const sections = (sectionRes.data ?? []).sort(
      (a, b) => (a.number ?? 0) - (b.number ?? 0)
    );

    let sectionOrder = 1;
    for (const s of sections) {
      await client.models.Section.update({ id: s.id, order: sectionOrder }, auth);

      const questionRes = await client.models.Question.list({
        filter: { sectionId: { eq: s.id } },
        selectionSet: ['id', 'order'],
        ...auth,
      });

      const questions = (questionRes.data ?? []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      let qOrder = 1;
      for (const q of questions) {
        await client.models.Question.update({ id: q.id, order: qOrder }, auth);
        qOrder += 1;
      }

      sectionOrder += 1;
    }
  }
}

seedOrders()
  .then(() => {
    console.log('Order seeding complete');
  })
  .catch((err) => {
    console.error('Failed to seed orders', err);
    process.exit(1);
  });

