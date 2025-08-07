import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

type SeedQuestion = {
  text: string;
  correctAnswer: string;
};

type SeedSection = {
  title: string;
  educationalText: string;
  questions: SeedQuestion[];
};

type SeedCampaign = {
  slug: string;
  title: string;
  description: string;
  sections: SeedSection[];
};

const client = generateClient<Schema>();

function caesarEncode(str: string, shift: number): string {
  return str
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return ch;
    })
    .join('');
}

function generateBaseCampaigns(): SeedCampaign[] {
  return [
    {
      slug: 'demo-campaign-1',
      title: 'Legends and Lore',
      description: 'Explore famous tales that inspire treasure hunters.',
      sections: [
        {
          title: 'The Lost City',
          educationalText:
            'An explorer once followed a rumour of a city swallowed by jungle. After days of searching, a weathered map fell from a crumbling statue, marking the beginning of many expeditions.',
          questions: [
            {
              text: 'According to the story, what did the explorer find first?',
              correctAnswer: 'a map',
            },
            {
              text: "What treasure was rumored to lie in the city's temple?",
              correctAnswer: 'golden idol',
            },
          ],
        },
        {
          title: 'Pirate Myths',
          educationalText:
            'Sailors whispered of captains who buried chests beneath shifting sands. Among them, Blackbeard was said to hide jewels on remote islands marked only by secret symbols.',
          questions: [
            {
              text: 'Which pirate was said to hide jewels on remote islands?',
              correctAnswer: 'Blackbeard',
            },
            {
              text: 'What signal did sailors fear?',
              correctAnswer: 'black flag',
            },
          ],
        },
        {
          title: 'Legends of the West',
          educationalText:
            'In the American West, stories of the Lost Dutchman mine drew hopeful prospectors to the Superstition Mountains. Many searched for the gold said to be hidden in winding caves.',
          questions: [
            {
              text: 'Which mountain range hosts the legend of the Lost Dutchman?',
              correctAnswer: 'Superstition Mountains',
            },
            {
              text: 'What was the prospector searching for?',
              correctAnswer: 'gold',
            },
          ],
        },
        {
          title: 'Modern Treasure Stories',
          educationalText:
            'Even today, treasure hunts capture imaginations. The famed Forrest Fenn treasure encouraged seekers to follow a poem as a map, proving that adventure thrives in the modern age.',
          questions: [
            {
              text: 'What modern treasure hunt involved a chest in the Rockies?',
              correctAnswer: 'Forrest Fenn treasure',
            },
            {
              text: 'What did the poem act as for hunters?',
              correctAnswer: 'map',
            },
          ],
        },
      ],
    },
    {
      slug: 'demo-campaign-2',
      title: 'Tools of the Trade',
      description: 'Gather the equipment and mindset needed for the hunt.',
      sections: [
        {
          title: 'Essential Gear',
          educationalText:
            'A prepared hunter carries a compass for direction and a sturdy satchel for discoveries. Proper gear turns uncertainty into readiness.',
          questions: [
            {
              text: 'Which tool is vital for navigation at night?',
              correctAnswer: 'compass',
            },
            {
              text: 'What item keeps your finds safe in the field?',
              correctAnswer: 'satchel',
            },
          ],
        },
        {
          title: 'Maps and Symbols',
          educationalText:
            'Maps speak in symbols. An X often marks a significant point while blue wavy lines reveal nearby water sources.',
          questions: [
            {
              text: 'What does an X on a map usually mark?',
              correctAnswer: 'the spot',
            },
            {
              text: 'Which symbol often indicates water?',
              correctAnswer: 'blue wavy line',
            },
          ],
        },
        {
          title: 'Mental Preparation',
          educationalText:
            'Patience and curiosity guard against hasty mistakes. A calm mind sees paths where others find dead ends.',
          questions: [
            {
              text: 'Why is patience important?',
              correctAnswer: 'to avoid mistakes',
            },
            {
              text: 'What mindset helps overcome dead-ends?',
              correctAnswer: 'curiosity',
            },
          ],
        },
      ],
    },
    {
      slug: 'demo-campaign-3',
      title: 'Introduction to Ciphers',
      description: 'Learn the basics of secret writing.',
      sections: [
        {
          title: 'The Caesar Cipher',
          educationalText:
            'By shifting letters a fixed amount, simple messages become hidden. A shift of three turns HELLO into KHOOR.',
          questions: [
            {
              text: "What does 'KHOOR' decode to?",
              correctAnswer: 'hello',
            },
            {
              text: 'How many letters is the classic Caesar shift?',
              correctAnswer: '3',
            },
          ],
        },
        {
          title: 'Simple Substitution',
          educationalText:
            'Substitution replaces each letter with another. When A becomes Z and B becomes Y, patterns reveal hidden words.',
          questions: [
            {
              text: "If A=Z, what does 'ZOO' become?",
              correctAnswer: 'all',
            },
            {
              text: 'What is the key to solving substitution ciphers?',
              correctAnswer: 'frequency analysis',
            },
          ],
        },
        {
          title: 'Transposition',
          educationalText:
            'Transposition ciphers rearrange letters without changing them. Unscrambling RSEAURTE gives a familiar reward.',
          questions: [
            {
              text: "Rearrange 'RSEAURTE' to reveal the word.",
              correctAnswer: 'treasure',
            },
            {
              text: 'What type of cipher rearranges letters without altering them?',
              correctAnswer: 'transposition',
            },
          ],
        },
      ],
    },
    {
      slug: 'demo-campaign-4',
      title: 'Secrets in Plain Sight',
      description: 'Discover how messages hide where all can see.',
      sections: [
        {
          title: 'Steganography 101',
          educationalText:
            'Steganography hides messages inside ordinary objects. A picture might contain text tucked into its pixels.',
          questions: [
            {
              text: 'Hiding text in an image is called?',
              correctAnswer: 'steganography',
            },
            {
              text: 'True or False: Steganography hides that a message exists.',
              correctAnswer: 'true',
            },
          ],
        },
        {
          title: 'Spotting Hidden Patterns',
          educationalText:
            'Clues often lurk in repetition. In the phrase "seek the old oak tree at dawn," every third word might whisper a secret.',
          questions: [
            {
              text: 'In the phrase, which word is the third?',
              correctAnswer: 'old',
            },
            {
              text: 'Spotting patterns relies on which skill?',
              correctAnswer: 'observation',
            },
          ],
        },
      ],
    },
    {
      slug: 'demo-campaign-5',
      title: 'The First Hunt',
      description: 'Put your new skills to the test in a mini adventure.',
      sections: [
        {
          title: 'A Mysterious Letter',
          educationalText:
            'A note arrives reading "Uifsf jt b nfttbhf". Decoding it reveals the sender has something important for you.',
          questions: [
            {
              text: 'Decoding the letter, what word is revealed?',
              correctAnswer: 'message',
            },
            {
              text: 'What cipher was used?',
              correctAnswer: 'caesar',
            },
          ],
        },
        {
          title: 'A Hidden Map',
          educationalText:
            'Inside a painting, a map is tucked behind the canvas. A red star marks where to begin your search.',
          questions: [
            {
              text: 'Where was the map concealed?',
              correctAnswer: 'inside the painting',
            },
            {
              text: 'What symbol marked the starting point?',
              correctAnswer: 'red star',
            },
          ],
        },
        {
          title: 'Decipher the Clues',
          educationalText:
            'Combining the map and letter points toward an old well on the edge of town. Your tools and wits must guide the way.',
          questions: [
            {
              text: 'What location is suggested when clues are combined?',
              correctAnswer: 'old well',
            },
            {
              text: 'What must you bring on the hunt?',
              correctAnswer: 'compass',
            },
          ],
        },
      ],
    },
  ];
}

function generateMasteryCampaigns(): SeedCampaign[] {
  const topics = [
    'Navigating by Stars',
    'Historical Ciphers',
    'Obfuscation in Storytelling',
    'Recognizing False Leads',
    'Constellation Mapping',
    'Ancient Languages',
    'Riddles and Rhymes',
    'Treasure Maps',
    'Code Wheels',
    'Secret Societies',
    'Invisible Ink',
    'Lockpicking Basics',
    'Puzzle Boxes',
    'Weathered Journals',
    'Decoded Diaries',
  ];
  return topics.map((topic, idx) => {
    const lower = topic.toLowerCase();
    const campaignNumber = idx + 6;
    return {
      slug: `demo-campaign-${campaignNumber}`,
      title: topic,
      description: `Advance your skills with ${lower}.`,
      sections: ['Lesson', 'Practice', 'Challenge'].map((stage) => ({
        title: stage,
        educationalText: `This ${stage.toLowerCase()} explores ${lower} and how it aids treasure hunters.`,
        questions: [
          {
            text: `What topic is highlighted in this ${stage.toLowerCase()}?`,
            correctAnswer: lower,
          },
          {
            text: `True or False: ${topic} can help solve clues.`,
            correctAnswer: 'true',
          },
        ],
      })),
    } as SeedCampaign;
  });
}

function generateAdvancedCampaigns(): SeedCampaign[] {
  const words = [
    'river',
    'mountain',
    'forest',
    'canyon',
    'desert',
    'ocean',
    'valley',
    'island',
    'castle',
    'cave',
  ];
  const campaigns: SeedCampaign[] = [];
  for (let i = 21; i <= 64; i++) {
    const word = words[(i - 21) % words.length];
    const cipher = caesarEncode(word, 3);
    campaigns.push({
      slug: `demo-campaign-${i}`,
      title: `Expedition ${i - 20}`,
      description: 'Tackle a multi-step expedition that tests all skills.',
      sections: [
        {
          title: 'Clue One',
          educationalText: `A weathered note reads: "Seek the ${word} where shadows grow."`,
          questions: [
            {
              text: 'What landmark does the note mention?',
              correctAnswer: word,
            },
            {
              text: `How many letters are in the word "${word}"?`,
              correctAnswer: String(word.length),
            },
          ],
        },
        {
          title: 'Deeper Mystery',
          educationalText: `A scrap of paper shows the cipher text "${cipher.toUpperCase()}".`,
          questions: [
            {
              text: `Decoding with a shift of 3, what word is revealed from "${cipher}"?`,
              correctAnswer: word,
            },
            {
              text: 'What cipher method was used?',
              correctAnswer: 'caesar',
            },
          ],
        },
        {
          title: 'Final Lock',
          educationalText: 'The final lock demands the secret word whispered twice.',
          questions: [
            {
              text: 'Type the password formed by saying the word twice with no space.',
              correctAnswer: word + word,
            },
            {
              text: 'Is the password case sensitive?',
              correctAnswer: 'yes',
            },
          ],
        },
      ],
    });
  }
  return campaigns;
}

function generateFinalCampaign(): SeedCampaign {
  return {
    slug: 'demo-campaign-65',
    title: 'Keeper of Secrets',
    description: 'A grand finale that unites every lesson.',
    sections: [
      {
        title: 'Gathered Wisdom',
        educationalText:
          'Your journey from legends to advanced expeditions has sharpened every sense. Recall the tales that first sparked your curiosity.',
        questions: [
          {
            text: 'Which early campaign introduced famous myths?',
            correctAnswer: 'legends and lore',
          },
          {
            text: 'What mindset remains key for any hunt?',
            correctAnswer: 'curiosity',
          },
        ],
      },
      {
        title: 'Cipher Gauntlet',
        educationalText:
          'A final message appears: "QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD". Decoding it recalls a classic pangram.',
        questions: [
          {
            text: 'Which animal leaps over the lazy dog?',
            correctAnswer: 'fox',
          },
          {
            text: 'What cipher method did you use?',
            correctAnswer: 'caesar',
          },
        ],
      },
      {
        title: 'Star Map Finale',
        educationalText:
          'A star map unfolds, reminding you how constellations guide travelers. The North Star still points the way home.',
        questions: [
          {
            text: 'Which star points north?',
            correctAnswer: 'polaris',
          },
          {
            text: "What pattern forms the Big Dipper's handle?",
            correctAnswer: 'three stars',
          },
        ],
      },
      {
        title: 'The Final Riddle',
        educationalText:
          'The last gate poses a riddle: "I speak without a mouth and hear without ears." Answer correctly to become the keeper of secrets.',
        questions: [
          {
            text: 'Solve the riddle: I speak without a mouth and hear without ears. What am I?',
            correctAnswer: 'echo',
          },
          {
            text: 'Did you become the Keeper of Secrets?',
            correctAnswer: 'yes',
          },
        ],
      },
    ],
  };
}

function generateCampaigns(): SeedCampaign[] {
  return [
    ...generateBaseCampaigns(),
    ...generateMasteryCampaigns(),
    ...generateAdvancedCampaigns(),
    generateFinalCampaign(),
  ];
}

async function seedDemoCampaigns() {
  const campaigns = generateCampaigns();
  console.log(`Seeding ${campaigns.length} campaigns...`);
  let order = 1;
  for (const c of campaigns) {
    const existing = await client.models.Campaign.list({
      filter: { slug: { eq: c.slug } },
      selectionSet: ['id'],
    });
    if ((existing.data ?? []).length) {
      console.log(`Skipping existing campaign ${c.slug}`);
      continue;
    }
    const campaign = await client.models.Campaign.create({
      slug: c.slug,
      title: c.title,
      description: c.description,
      order,
    });
    let sectionNumber = 1;
    for (const s of c.sections) {
      const section = await client.models.Section.create({
        campaignId: campaign.id,
        number: sectionNumber,
        title: s.title,
        educationalText: s.educationalText,
        order: sectionNumber,
      });
      let questionOrder = 1;
      for (const q of s.questions) {
        await client.models.Question.create({
          sectionId: section.id,
          text: q.text,
          correctAnswer: q.correctAnswer,
          order: questionOrder,
        });
        questionOrder += 1;
      }
      sectionNumber += 1;
    }
    order += 1;
  }
  console.log('Demo campaign seeding complete');
}

seedDemoCampaigns().catch((err) => {
  console.error('Failed to seed demo campaigns', err);
  process.exit(1);
});
