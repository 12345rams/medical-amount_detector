import express from "express";
import extractRoute from "./routes/extract.js";

const app = express();
app.use(express.json());
app.use("/extract", extractRoute);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
