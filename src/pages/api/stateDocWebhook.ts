import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// Tell Next.js not to parse body automatically
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: read raw request body as Buffer
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const url = new URL(req.url!, `http://${req.headers.host}`);
  const signature = url.searchParams.get("signature");
  const sharedKey = process.env.PANDADOC_WEBHOOK_KEY!;
  if (!signature) return res.status(400).end("Missing signature");

  const rawBody = await getRawBody(req);
  const computed = crypto
    .createHmac("sha256", sharedKey)
    .update(rawBody)
    .digest("base64");
  if (computed !== signature) {
    console.error("❌ Invalid webhook signature", { computed, signature });
    return res.status(401).json({ error: "Invalid signature" });
  }

  let events;
  try {
    events = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  for (const evt of events) {
    if (
      evt.event === "document_state_changed" &&
      evt.data.status === "document.draft"
    ) {
      console.log("✅ Document is ready:", evt.data.id);
      // Now safe to create a signing session or embed here
    }
    if (evt.event === "document_completed_pdf_ready") {
      console.log("📄 Document completed:", evt.data.id);
      // Trigger PDF download from PandaDoc API
    }
  }

  res.status(200).end();
}
