import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

async function seedOrders() {
  const campaigns = await client.models.Campaign.list({ selectionSet: ['id'] });
  for (const campaign of campaigns.data ?? []) {
    const campaignId = campaign.id;
    console.log(`Processing campaign ${campaignId}`);

    const sectionRes = await client.models.Section.list({
      filter: { campaignId: { eq: campaignId } },
      selectionSet: ['id', 'number'],
    });

    const sections = (sectionRes.data ?? []).sort(
      (a, b) => (a.number ?? 0) - (b.number ?? 0)
    );

    let sectionOrder = 1;
    for (const s of sections) {
      await client.models.Section.update({ id: s.id, order: sectionOrder });

      const questionRes = await client.models.Question.list({
        filter: { sectionId: { eq: s.id } },
        selectionSet: ['id', 'order'],
      });

      const questions = (questionRes.data ?? []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      let qOrder = 1;
      for (const q of questions) {
        await client.models.Question.update({ id: q.id, order: qOrder });
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

