export function guardrail(text) {
  if (!text || text.length < 5) {
    return {
      status: "no_amounts_found",
      reason: "document too noisy"
    };
  }
  return null;
}
