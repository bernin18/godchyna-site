export const MAX_PARTICIPANT_MULTIPLIER = 5_000;
export const MAX_MONTHLY_PARTICIPANT_MULTIPLIER = MAX_PARTICIPANT_MULTIPLIER;

export function parseParticipantInput(input: string, maximum = MAX_PARTICIPANT_MULTIPLIER) {
  const entries: string[] = [];
  let cappedLines = 0;

  input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const multiplierMatch = line.match(/^(.*?)\s+(?:(\d+)\s*x|x\s*(\d+))$/i);

      if (!multiplierMatch) {
        entries.push(line);
        return;
      }

      const name = multiplierMatch[1].trim();
      if (!name) return;

      const requestedCount = Number(multiplierMatch[2] ?? multiplierMatch[3] ?? 1);
      const safeCount = Number.isFinite(requestedCount)
        ? Math.max(1, Math.min(maximum, Math.floor(requestedCount)))
        : 1;

      if (requestedCount > maximum) cappedLines += 1;

      entries.push(...Array.from({ length: safeCount }, () => name));
    });

  return { entries, cappedLines };
}
