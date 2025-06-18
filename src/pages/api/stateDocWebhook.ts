import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sharedKey = process.env.PANDADOC_WEBHOOK_KEY!;
  const raw = (req as any).body; // raw body needed for signature check
  const signature = req.query.signature as string;

  // Verify HMAC-SHA256 signature
  const hmac = crypto.createHmac("sha256", sharedKey);
  hmac.update(raw);
  if (hmac.digest("base64") !== signature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const events = JSON.parse(raw);
  for (const evt of events) {
    if (
      evt.event === "document_state_changed" &&
      evt.data.status === "document.draft"
    ) {
      console.log("✅ Document is ready:", evt.data.id, evt.data.status);
      // Trigger next step, e.g., create a signing session
    }
    if (evt.event === "document_completed_pdf_ready") {
      console.log("📄 Document completed and PDF ready:", evt.data.id);
      // Download finalized PDF
    }
  }

  res.status(200).end(); // Acknowledge webhook
}
