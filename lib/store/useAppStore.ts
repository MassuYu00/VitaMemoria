import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExperienceLog, SkillScore, SavedPlan, Plan, UserProfile } from '@/lib/types';
import { DEFAULT_SKILLS, EMOTION_META } from '@/lib/types';

interface AppState {
  // User
  user: UserProfile;

  // Experience Logs
  logs: ExperienceLog[];
  addLog: (log: Omit<ExperienceLog, 'id' | 'userId' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;

  // Skills
  skills: SkillScore[];
  updateSkills: (skills: SkillScore[]) => void;
  addExp: (skillName: string, amount: number) => void;

  // Plans
  savedPlans: SavedPlan[];
  savePlan: (plan: Plan) => void;
  skipPlan: (id: string) => void;
  completePlan: (id: string) => void;

  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Demo User
      user: {
        id: 'demo-user-001',
        displayName: '〇〇',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
      },

      // Experience Logs
      logs: [
        {
          id: 'log-1',
          userId: 'demo-user-001',
          title: '京都の錦市場を散歩',
          description: '初めて錦市場に行った。漬物や豆腐を試食しながら路地を歩くのが最高だった。地元のおばあちゃんと話が弾んだ。',
          emotions: ['発見', 'つながり'],
          location: '京都市',
          date: '2026-06-22',
          aiTags: ['文化体験', '食', '地域交流'],
          createdAt: new Date('2026-06-22').toISOString(),
        },
        {
          id: 'log-2',
          userId: 'demo-user-001',
          title: '一人カヤック初挑戦',
          description: '琵琶湖でカヤックに初めて挑戦。最初は転覆しそうで怖かったが、慣れてくると湖の上から見る景色が絶景だった。',
          emotions: ['挑戦', 'ワクワク'],
          location: '滋賀県 琵琶湖',
          date: '2026-06-15',
          aiTags: ['アウトドア', 'スポーツ', '初体験'],
          createdAt: new Date('2026-06-15').toISOString(),
        },
        {
          id: 'log-3',
          userId: 'demo-user-001',
          title: '夕暮れの植物園',
          description: '閉園間際の植物園へ。光の当たった温室の中でひとり静かに過ごした。不思議な植物が多くて飽きなかった。',
          emotions: ['リラックス', '発見'],
          location: '大阪府立花の文化園',
          date: '2026-06-08',
          aiTags: ['自然', 'リフレッシュ', 'ソロ活'],
          createdAt: new Date('2026-06-08').toISOString(),
        },
      ],

      addLog: (logData) => {
        const newLog: ExperienceLog = {
          ...logData,
          id: `log-${Date.now()}`,
          userId: 'demo-user-001',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));

        // Auto-add EXP based on emotions
        const { addExp } = get();
        logData.emotions.forEach((emotion) => {
          const meta = EMOTION_META[emotion];
          if (meta) {
            meta.relatedSkills.forEach((skill: string) => {
              addExp(skill, 8 + Math.floor(Math.random() * 7));
            });
          }
        });
      },

      deleteLog: (id) => {
        set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
      },

      // Skills
      skills: DEFAULT_SKILLS,

      updateSkills: (skills) => set({ skills }),

      addExp: (skillName, amount) => {
        set((state) => ({
          skills: state.skills.map((skill) => {
            if (skill.skillName !== skillName) return skill;
            const newExp = Math.min(100, skill.exp + amount);
            const newLevel = Math.floor(newExp / 10) + 1;
            return { ...skill, exp: newExp, score: newExp, level: Math.min(10, newLevel) };
          }),
        }));
      },

      // Plans
      savedPlans: [],

      savePlan: (plan) => {
        const saved: SavedPlan = {
          id: `plan-${Date.now()}`,
          userId: 'demo-user-001',
          planData: plan,
          status: 'saved',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ savedPlans: [saved, ...state.savedPlans] }));
      },

      skipPlan: (id) => {
        set((state) => ({
          savedPlans: state.savedPlans.map((p) =>
            p.id === id ? { ...p, status: 'skipped' } : p
          ),
        }));
      },

      completePlan: (id) => {
        set((state) => ({
          savedPlans: state.savedPlans.map((p) =>
            p.id === id ? { ...p, status: 'completed' } : p
          ),
        }));
      },

      // UI
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'vita-memoria-storage',
      partialize: (state) => ({
        logs: state.logs,
        skills: state.skills,
        savedPlans: state.savedPlans,
        user: state.user,
      }),
    }
  )
);
