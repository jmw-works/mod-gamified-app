export interface FallbackCampaign {
  id: string;
  title: string;
  description?: string | null;
  infoText?: string | null;
  icon?: string | null;
  order: number;
}

export interface FallbackQuestion {
  id: string;
  text: string;
  section: number;
  correctAnswer: string;
  xpValue?: number;
}

export interface FallbackSection {
  number: number;
  id: string;
  title: string;
  text: string;
  questions: FallbackQuestion[];
}

export const fallbackCampaigns: FallbackCampaign[] = [
  {
    id: 'demo-campaign',
    title: 'Demo Campaign',
    description: 'Sample content to explore the app.',
    infoText: 'Welcome to the demo campaign. This data is hard coded for local development.',
    icon: '🎯',
    order: 1,
  },
  {
    id: 'demo-security',
    title: 'Security Basics',
    description: 'Understand simple security concepts.',
    infoText: 'Learn the basics of online security using placeholder questions.',
    icon: '🔐',
    order: 2,
  },
];

export const fallbackSectionsByCampaign: Record<string, FallbackSection[]> = {
  'demo-campaign': [
    {
      number: 1,
      id: 'demo-section-1',
      title: 'Getting Started',
      text: 'This section introduces the platform with sample questions.',
      questions: [
        {
          id: 'demo-q1',
          text: 'Placeholder question: What is 2 + 2?',
          section: 1,
          correctAnswer: '4',
          xpValue: 10,
        },
      ],
    },
  ],
  'demo-security': [
    {
      number: 1,
      id: 'security-section-1',
      title: 'Passwords',
      text: 'Never share your password with anyone.',
      questions: [
        {
          id: 'security-q1',
          text: 'Placeholder question: Should you reuse passwords?',
          section: 1,
          correctAnswer: 'No',
          xpValue: 10,
        },
      ],
    },
  ],
};
