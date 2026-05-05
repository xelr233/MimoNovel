import { Hono } from "hono";
import { cors } from "hono/cors";
import { analyzeRoute } from "./routes/analyze";
import { styleRoute } from "./routes/style";
import { ttsRoute } from "./routes/tts";

type Bindings = {
  MIMO_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

app.route("/api", analyzeRoute);
app.route("/api", styleRoute);
app.route("/api", ttsRoute);

app.get("/api/health", (c) => c.json({ status: "ok" }));

export default app;
