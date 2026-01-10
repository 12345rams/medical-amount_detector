import express from "express";
import multer from "multer";
import { runOCR } from "../services/ocr.service.js";
import { normalize } from "../services/normalize.service.js";
import { classify } from "../services/classify.service.js";
import { guardrail } from "../utils/guardrails.js";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/text", async (req, res) => {
  const text = req.body.text || "";
  const g = guardrail(text);
  if (g) return res.json(g);

  const norm = normalize(text);
  res.json(classify(text, norm));
});

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "no_file", reason: "No image uploaded under field 'image'" });
    }

    const text = await runOCR(req.file.path);
    const g = guardrail(text);
    if (g) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.json(g);
    }

    const norm = normalize(text);
    const result = classify(text, norm);

    await fs.promises.unlink(req.file.path).catch(() => {});
    res.json(result);
  } catch (err) {
    if (req.file) await fs.promises.unlink(req.file.path).catch(() => {});
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
