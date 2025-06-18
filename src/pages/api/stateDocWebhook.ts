import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    const bodyString = rawBody.toString("utf8");
    const signature = req.headers["x-pandadoc-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature header" });
    }

    const webhookKey = process.env.PANDADOC_WEBHOOK_KEY;
    if (!webhookKey) {
      return res.status(500).json({ error: "Webhook key not configured" });
    }

    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("hex");

    if (computedSignature !== signature) {
      console.error("Signature mismatch", {
        computed: computedSignature,
        received: signature,
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    const events = JSON.parse(bodyString);
    console.log("Received webhook events:", events);

    for (const event of events) {
      switch (event.event) {
        case "document_state_changed":
          console.log(
            `Document ${event.data.id} changed to ${event.data.status}`
          );
          break;
        case "document_creation_failed":
          console.error("Document creation failed:", event.data.error.detail);
          break;
        case "document_completed":
          console.log(`Document ${event.data.id} completed`);
          break;
        case "document_sent":
          console.log(`Document ${event.data.id} sent to recipients`);
          break;
        default:
          console.log(`Unhandled event type: ${event.event}`);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
