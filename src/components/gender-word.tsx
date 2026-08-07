import type { MasterWord } from "@/lib/types";

/**
 * German gender is the hardest thing to learn and the easiest to
 * fossilise wrong. Colour is the standard teaching trick: the learner
 * sees blue, red or green thousands of times and the article stops
 * being an arbitrary word and starts being a property of the noun.
 *
 * der = blue, die = red, das = green. Used consistently everywhere.
 */
export const GENDER_CLASS: Record<string, string> = {
  der: "text-blue-600 dark:text-blue-400",
  die: "text-rose-600 dark:text-rose-400",
  das: "text-emerald-600 dark:text-emerald-400",
};

export function GenderBadge({ article }: { article: string | null }) {
  if (!article) return null;
  return (
    <span className={`font-medium ${GENDER_CLASS[article] ?? ""}`}>{article}</span>
  );
}

export default function GenderWord({
  word,
  size = "text-3xl",
}: {
  word: Pick<MasterWord, "german" | "article">;
  size?: string;
}) {
  return (
    <span>
      {word.article && (
        <span className={`${GENDER_CLASS[word.article] ?? ""} opacity-90`}>
          {word.article}{" "}
        </span>
      )}
      <span className={`${size} font-bold text-foreground`}>{word.german}</span>
    </span>
  );
}
