import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const bufs: Buffer[] = [];
  for await (const chunk of req) {
    bufs.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(bufs);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const signature = new URL(
    req.url!,
    `https://${req.headers.host}`
  ).searchParams.get("signature");
  if (!signature) return res.status(400).end("Missing signature");

  const key = process.env.PANDADOC_WEBHOOK_KEY!;
  const raw = await getRawBody(req);
  const digest = crypto.createHmac("sha256", key).update(raw).digest("base64");

  console.log("Computed:", digest);
  console.log("PandaDoc Signature:", signature);
  console.log("Raw Body:", raw.toString("utf8"));

  if (digest !== signature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const events = JSON.parse(raw.toString("utf8"));
  for (const evt of events) {
    if (
      evt.event === "document_state_changed" &&
      evt.data.status === "document.draft"
    ) {
      console.log("✅ Document ready:", evt.data.id);
      // Proceed (e.g., create signing session)
    } else if (evt.event === "document_creation_failed") {
      console.log("❌ Creation failed:", evt.data.error.detail);
      // Handle failure
    } else if (evt.event === "document_completed_pdf_ready") {
      console.log("📄 Completed & PDF ready:", evt.data.id);
      // Download signed PDF
    }
  }

  res.status(200).end();
}
