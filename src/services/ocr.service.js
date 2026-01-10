import Tesseract from "tesseract.js";

export async function runOCR(path) {
  const { data } = await Tesseract.recognize(path, "eng");
  return data.text;
}
