// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ------------------------------------------------------------
  // Unified content model
  // ------------------------------------------------------------

  CampaignContent: a
    .model({
      id: a.id().required(),

      // Grouping & lookup
      campaignSlug: a.string().required(), // e.g., "demo-campaign-1"
      itemType: a.enum(['CAMPAIGN', 'SECTION', 'QUESTION']),

      // Global campaign ordering
      campaignOrder: a.integer().required(),

      // Hierarchy hints
      sectionNumber: a.integer(), // required for SECTION/QUESTION

      // Order within level
      itemOrder: a.integer().required(),

      // CAMPAIGN fields
      title: a.string(),
      description: a.string(),
      infoText: a.string(),
      isActive: a.boolean().default(true),

      thumbnailKey: a.string(),
      thumbnailUrl: a.string(),
      thumbnailAlt: a.string(),

      // SECTION fields
      sectionTitle: a.string(),
      educationalText: a.string(),
      educationalRichText: a.string(),
      sectionIsActive: a.boolean().default(true),
      unlockRule: a.enum(['ALL_PREV_CORRECT', 'PERCENT', 'MANUAL']),
      unlockThreshold: a.integer().default(100),

      // QUESTION fields
      questionText: a.string(),
      correctAnswer: a.string(),
      xpValue: a.integer().default(10),
      difficulty: a.enum(['easy', 'medium', 'hard']),
      questionIsActive: a.boolean().default(true),
      hint: a.string(),
      explanation: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  Title: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      minLevel: a.integer().required(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  // ------------------------------------------------------------
  // User-owned state and progress
  // ------------------------------------------------------------

  UserProfile: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      email: a.string(),
      displayName: a.string(),
      avatarUrl: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  UserResponse: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      questionId: a.id().required(),
      question: a.belongsTo('CampaignContent', 'questionId'),
      responseText: a.string().required(),
      isCorrect: a.boolean().required(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  UserProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      totalXP: a.integer().default(0),

      answeredQuestions: a.string().array(),
      completedSections: a.integer().array(),

      dailyStreak: a.integer().default(0),
      lastBlazeAt: a.datetime(), // nullable
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  SectionProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      sectionId: a.id().required(),
      answeredQuestionIds: a.string().array(),
      correctCount: a.integer().default(0),
      completed: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  CampaignProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      campaignId: a.id().required(),
      completed: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  // Optional legacy model
  UserStats: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      totalXP: a.integer().default(0),
      correctAnswers: a.integer().default(0),
      incorrectAnswers: a.integer().default(0),
      completedSections: a.integer().default(0),
      streakCount: a.integer().default(0),
      lastActiveDate: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
