export function normalize(text) {
  const fix = { O: "0", o: "0", l: "1", I: "1", S: "5", B: "8" };
  let cleaned = text;

  for (const k in fix)
    cleaned = cleaned.replaceAll(k, fix[k]);

  const tokens = cleaned.match(/\d+%?/g) || [];

  return {
    raw_tokens: tokens,
    normalized_amounts: tokens.filter(t => !t.includes("%")).map(Number),
    normalization_confidence: 0.82
  };
}
