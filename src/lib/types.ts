export type Level = "A1" | "A2" | "B1" | "B2";

export type Profile = {
  id: string;
  full_name: string | null;
  current_level: Level;
  daily_goal_minutes: number;
  streak_count: number;
  last_active_date: string | null;
  total_xp: number;
  words_learned: number;
  lessons_completed: number;
  created_at: string;
  updated_at: string;
};

export type VocabularyWord = {
  id: string;
  user_id: string;
  german_word: string;
  english_word: string;
  example_sentence: string | null;
  example_translation: string | null;
  word_type: "noun" | "verb" | "adjective" | "adverb" | "preposition" | "conjunction" | "phrase" | "other" | null;
  gender: "der" | "die" | "das" | null;
  plural_form: string | null;
  level: Level;
  created_at: string;
};

export type Flashcard = {
  id: string;
  user_id: string;
  vocabulary_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_review_date: string | null;
  created_at: string;
  vocabulary?: VocabularyWord;
};

export type Lesson = {
  id: string;
  user_id: string;
  lesson_date: string;
  lesson_type: "grammar" | "speaking" | "listening" | "reading" | "writing" | "mixed";
  title: string;
  content: Record<string, unknown>;
  level: Level;
  duration_minutes: number;
  completed: boolean;
  score: number | null;
  created_at: string;
};

export type LessonType = Lesson["lesson_type"];
