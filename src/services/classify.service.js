function detectCurrency(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("inr") || t.includes("₹") || t.includes("rs")) return "INR";
  return "UNKNOWN";
}

function extractNumbers(line) {
  const m = line.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g);
  return (m || []).map(x => parseFloat(x.replace(/,/g, "")));
}

function isLikelyNonMoney(line, value) {
  const l = line.toLowerCase();
  const nonMoneyHints = ["date", "dat:", "dob", "mrn", "uhid", "invoice", "bill no", "id", "number", "phone", "gst"];
  if (nonMoneyHints.some(k => l.includes(k))) return true;

  if (Number.isInteger(value) && String(value).length >= 7) return true;

  if (l.includes("st") || l.includes("street") || l.includes("road") || l.includes("rd") || l.includes("sector")) {
    if (value <= 999) return true;
  }

  return false;
}

function labelFromLine(line) {
  const l = line.toLowerCase();
  if (l.includes("total")) return "total_bill";
  if (l.includes("grand total")) return "total_bill";
  if (l.includes("amount paid") || l.includes("paid")) return "paid";
  if (l.includes("balance") || l.includes("due")) return "due";
  if (l.includes("consultation") || l.includes("medication") || l.includes("lab")) return "line_item";
  return "unknown";
}

export function classify(text, normalized) {
  const currency = detectCurrency(text);

  const lines = (text || "")
    .split(/\r?\n|\|/g)
    .map(s => s.trim())
    .filter(Boolean);

  const candidates = [];

  for (const line of lines) {
    const nums = extractNumbers(line);
    if (!nums.length) continue;

    const type = labelFromLine(line);

    for (const v of nums) {
      if (isLikelyNonMoney(line, v)) continue;

      candidates.push({
        type,
        value: v,
        source: `text: '${line}'`
      });
    }
  }

  const picked = [];
  const want = ["total_bill", "paid", "due"];
  for (const w of want) {
    const found = candidates.find(x => x.type === w);
    if (found) picked.push(found);
  }

  if (picked.length === 0) {
    return {
      status: "no_amounts_found",
      reason: "could not confidently classify amounts"
    };
  }

  return {
    currency: currency === "UNKNOWN" ? "INR" : currency,
    amounts: picked,
    confidence: 0.8,
    status: "ok"
  };
}
