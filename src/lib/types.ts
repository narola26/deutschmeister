export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type TaskKind =
  | "repair"
  | "vocabulary"
  | "lesson"
  | "production"
  | "speaking"
  | "closeout";

export type WordKind =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "number"
  | "phrase";

export type Stars = 0 | 1 | 2 | 3;

export type Profile = {
  id: string;
  full_name: string | null;
  current_level: Level;
  current_day: number;
  session_hour: number;
  total_points: number;
  three_star_count: number;
  streak_count: number;
  longest_streak: number;
  last_session_date: string | null;
  words_learned: number;
  sessions_completed: number;
  created_at: string;
  updated_at: string;
};

export type MasterWord = {
  id: string;
  level: Level;
  day_number: number;
  german: string;
  english: string;
  article: "der" | "die" | "das" | null;
  plural: string | null;
  word_type: WordKind;
  example_de: string;
  example_en: string;
};

export type UserVocabulary = {
  id: string;
  user_id: string;
  word_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_review: string | null;
  best_stars: number;
  times_correct: number;
  times_wrong: number;
  created_at: string;
  vocabulary_master?: MasterWord;
};

export type DailySession = {
  id: string;
  user_id: string;
  session_date: string;
  level: Level;
  day_number: number;
  points_earned: number;
  stars_earned: number;
  tasks_total: number;
  tasks_done: number;
  completed: boolean;
  created_at: string;
};

export type SessionTask = {
  id: string;
  session_id: string;
  user_id: string;
  kind: TaskKind;
  position: number;
  title: string;
  score: number | null;
  stars: Stars | null;
  points: number;
  completed: boolean;
  payload: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
};

export type RepairItem = {
  id: string;
  user_id: string;
  source_kind: TaskKind;
  word_id: string | null;
  grammar_slug: string | null;
  description: string;
  stars_when_queued: number;
  attempts: number;
  cleared: boolean;
  cleared_at: string | null;
  created_at: string;
};

export type CurriculumDay = {
  id: string;
  level: Level;
  day_number: number;
  title: string;
  grammar_focus: string | null;
  grammar_slug: string | null;
  vocab_topic: string;
  speaking_prompt: string | null;
  production_prompt: string | null;
};

export type GrammarExample = { de: string; en: string };

export type GrammarMistake = { wrong: string; right: string; why: string };

export type GrammarTopic = {
  id: string;
  level: Level;
  slug: string;
  title: string;
  summary: string;
  explanation: string;
  examples: GrammarExample[];
  common_mistakes: GrammarMistake[];
  sort_order: number;
};

export type CertificateTier =
  | "Bestanden"
  | "Gut"
  | "Sehr gut"
  | "Ausgezeichnet";
