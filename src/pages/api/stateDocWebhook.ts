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

    // Try different header name variations
    const signature =
      req.headers["x-pandadoc-signature"] ||
      req.headers["X-PandaDoc-Signature"] ||
      req.headers["x-panda-signature"] ||
      req.headers["X-Panda-Signature"];

    if (!signature) {
      console.error("Missing signature header. Received headers:", req.headers);
      return res.status(400).json({
        error: "Missing signature header",
        receivedHeaders: Object.keys(req.headers),
      });
    }

    const webhookKey = process.env.PANDADOC_WEBHOOK_KEY;
    if (!webhookKey) {
      return res.status(500).json({ error: "Webhook key not configured" });
    }

    // PandaDoc may send the signature as base64 or hex
    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("hex"); // Try 'base64' if hex doesn't work

    // Trim and normalize signatures for comparison
    const normalizedReceived = String(signature).trim();
    const normalizedComputed = computedSignature.trim();

    if (normalizedComputed !== normalizedReceived) {
      // Try with base64 if hex comparison fails
      const computedBase64 = crypto
        .createHmac("sha256", webhookKey)
        .update(rawBody)
        .digest("base64");

      if (computedBase64.trim() !== normalizedReceived) {
        console.error("Signature mismatch", {
          computedHex: normalizedComputed,
          computedBase64: computedBase64,
          received: normalizedReceived,
          headers: req.headers,
        });
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const events = JSON.parse(bodyString);
    console.log("Received webhook events:", events);

    // Process events...
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
