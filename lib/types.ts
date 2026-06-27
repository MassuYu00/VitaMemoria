// ===========================
// VitaMemoria — 型定義
// ===========================

export type Emotion =
  | 'ワクワク'
  | '発見'
  | 'リラックス'
  | '感動'
  | '挑戦'
  | 'つながり';

export type SkillName =
  | '探求心'
  | '創造性'
  | '共感力'
  | '行動力'
  | '挑戦心'
  | 'つながり力';

export interface ExperienceLog {
  id: string;
  userId: string;
  title: string;
  description?: string;
  emotions: Emotion[];
  location?: string;
  date: string; // ISO date string
  imageUrl?: string;
  aiTags?: string[];
  createdAt: string;
}

export interface SkillScore {
  id: string;
  userId: string;
  skillName: SkillName;
  score: number;  // 0-100
  level: number;
  exp: number;
  updatedAt: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  budget: string;
  category: string;
  emoji: string;
  reason: string;
  tips: string[];
  tags: string[];
  isEvent?: boolean;       // 最新イベント・期間限定の場合 true
  eventDate?: string;      // 例: "2025年7月5日〜6日"
}

export interface SavedPlan {
  id: string;
  userId: string;
  planData: Plan;
  status: 'saved' | 'completed' | 'skipped';
  scheduledDate?: string;
  createdAt: string;
}

export interface PlanInput {
  mood: string;
  moodEmoji: string;
  budgetMin: number;
  budgetMax: number;
  area: string;
  companion: 'solo' | 'couple' | 'friends' | 'family';
  interests: string[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

// Skill metadata for UI display
export const SKILL_META: Record<SkillName, {
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  '探求心': {
    emoji: '🔍',
    color: '#FF7E67',
    bgColor: '#FFF0EE',
    description: '新しいことを探求し、好奇心を持って深掘りする力',
  },
  '創造性': {
    emoji: '✨',
    color: '#7C5CFC',
    bgColor: '#EDE8FF',
    description: '独自のアイデアや表現を生み出すクリエイティブな力',
  },
  '共感力': {
    emoji: '💞',
    color: '#E83B8A',
    bgColor: '#FFF0F8',
    description: '他者の感情や状況を理解し、寄り添う力',
  },
  '行動力': {
    emoji: '⚡',
    color: '#FFBD4F',
    bgColor: '#FFF8E6',
    description: '思い立ったらすぐ動き、物事を実現させる力',
  },
  '挑戦心': {
    emoji: '🎯',
    color: '#3B6FE8',
    bgColor: '#EEF4FF',
    description: '困難に立ち向かい、新しいことに挑戦し続ける力',
  },
  'つながり力': {
    emoji: '🌿',
    color: '#12C99E',
    bgColor: '#F0FBF8',
    description: '人・場所・自然との豊かなつながりを築く力',
  },
};

export const EMOTION_META: Record<Emotion, {
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  relatedSkills: SkillName[];
}> = {
  'ワクワク': {
    emoji: '🌟',
    color: '#E8940A',
    bgColor: '#FFF8E6',
    borderColor: '#FFE4A0',
    relatedSkills: ['行動力', '探求心'],
  },
  '発見': {
    emoji: '💡',
    color: '#3B6FE8',
    bgColor: '#EEF4FF',
    borderColor: '#BFCFFF',
    relatedSkills: ['探求心', '創造性'],
  },
  'リラックス': {
    emoji: '🌿',
    color: '#12C99E',
    bgColor: '#F0FBF8',
    borderColor: '#9AFBE3',
    relatedSkills: ['つながり力', '共感力'],
  },
  '感動': {
    emoji: '💖',
    color: '#E83B8A',
    bgColor: '#FFF0F8',
    borderColor: '#FFB8D8',
    relatedSkills: ['共感力', '創造性'],
  },
  '挑戦': {
    emoji: '🔥',
    color: '#FF7E67',
    bgColor: '#FFF0EE',
    borderColor: '#FFB8AB',
    relatedSkills: ['挑戦心', '行動力'],
  },
  'つながり': {
    emoji: '🤝',
    color: '#7C5CFC',
    bgColor: '#EDE8FF',
    borderColor: '#C4B5FD',
    relatedSkills: ['つながり力', '共感力'],
  },
};

export const DEFAULT_SKILLS: SkillScore[] = [
  { id: '1', userId: 'demo', skillName: '探求心', score: 65, level: 7, exp: 65, updatedAt: new Date().toISOString() },
  { id: '2', userId: 'demo', skillName: '創造性', score: 48, level: 5, exp: 48, updatedAt: new Date().toISOString() },
  { id: '3', userId: 'demo', skillName: '共感力', score: 72, level: 8, exp: 72, updatedAt: new Date().toISOString() },
  { id: '4', userId: 'demo', skillName: '行動力', score: 55, level: 6, exp: 55, updatedAt: new Date().toISOString() },
  { id: '5', userId: 'demo', skillName: '挑戦心', score: 40, level: 4, exp: 40, updatedAt: new Date().toISOString() },
  { id: '6', userId: 'demo', skillName: 'つながり力', score: 80, level: 9, exp: 80, updatedAt: new Date().toISOString() },
];
