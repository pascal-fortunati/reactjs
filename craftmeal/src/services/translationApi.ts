const TRANSLATE_BASE = "https://api.mymemory.translated.net/get";

function buildChunks(values: string[], maxLen: number) {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentLen = 0;
  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const extra = currentChunk.length ? 1 : 0;
    if (currentLen + trimmed.length + extra > maxLen && currentChunk.length) {
      chunks.push(currentChunk);
      currentChunk = [trimmed];
      currentLen = trimmed.length;
    } else {
      currentChunk.push(trimmed);
      currentLen += trimmed.length + extra;
    }
  });
  if (currentChunk.length) chunks.push(currentChunk);
  return chunks;
}

async function fetchTranslate(text: string): Promise<string> {
  const res = await fetch(
    `${TRANSLATE_BASE}?q=${encodeURIComponent(text)}&langpair=en|fr`,
  );
  if (!res.ok) throw new Error("Erreur de traduction");
  const data: any = await res.json();
  const value =
    data &&
    data.responseData &&
    typeof data.responseData.translatedText === "string"
      ? data.responseData.translatedText
      : "";
  return (value || "").trim();
}

export async function translateInstructionsEnToFr(
  text: string,
  maxLen = 480,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts: string[] = [];
  let remaining = trimmed;
  while (remaining.length > 0) {
    parts.push(remaining.slice(0, maxLen));
    remaining = remaining.slice(maxLen);
  }
  const translated = await Promise.all(
    parts.map((part) =>
      fetchTranslate(part).catch(() => ""),
    ),
  );
  const joined = translated.filter((t) => t).join(" ");
  return joined || null;
}

export async function translateValuesEnToFr(
  values: string[],
  maxLen = 480,
): Promise<Record<string, string>> {
  if (!values.length) return {};
  const unique = Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
  if (!unique.length) return {};
  const chunks = buildChunks(unique, maxLen);
  if (!chunks.length) return {};
  const translatedBlocks = await Promise.all(
    chunks.map(async (chunk) => {
      const text = chunk.join("\n");
      try {
        const raw = await fetchTranslate(text);
        if (!raw) return chunk;
        const lines = raw.split(/\r?\n/);
        if (lines.length !== chunk.length) return chunk;
        return lines;
      } catch {
        return chunk;
      }
    }),
  );
  const map: Record<string, string> = {};
  translatedBlocks.forEach((block, blockIndex) => {
    const originalChunk = chunks[blockIndex];
    block.forEach((value, idx) => {
      const original = originalChunk[idx];
      if (!original || !value || original === value) return;
      map[original] = value;
    });
  });
  return map;
}