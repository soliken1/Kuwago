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

function getNormalizedSignature(req: NextApiRequest): string | null {
  // Try all possible header variations
  const potentialHeaders = [
    "x-pandadoc-signature",
    "x-panda-signature",
    "X-PandaDoc-Signature",
    "X-Panda-Signature",
    "$x_pandadoc_signature", // Vercel's transformed version
  ];

  for (const headerName of potentialHeaders) {
    const headerValue =
      req.headers[headerName.toLowerCase()] || req.headers[headerName];
    if (!headerValue) continue;

    // Handle both string and string[] cases
    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    // Handle Vercel's $x_ prefix if present
    if (headerName.startsWith("$x_") && value.startsWith("$x_")) {
      return value.slice(3);
    }
    return value;
  }

  return null;
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
    const signature = getNormalizedSignature(req);

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

    // Compute signatures for comparison
    const computedHex = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("hex");

    const computedBase64 = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    // Debug logging (remove in production)
    console.log("Signature verification details:", {
      receivedSignature: signature,
      computedHex,
      computedBase64,
      bodyPreview:
        bodyString.length > 100
          ? bodyString.substring(0, 100) + "..."
          : bodyString,
    });

    // Compare signatures (try both hex and base64)
    if (computedHex !== signature && computedBase64 !== signature) {
      return res.status(401).json({
        error: "Invalid signature",
        details: {
          note: "The signature provided by PandaDoc doesn't match the computed value",
          possibleCauses: [
            "Webhook secret key mismatch",
            "Vercel header transformation",
            "Request body modification",
          ],
        },
      });
    }

    // Process webhook events
    const events = JSON.parse(bodyString);
    console.log("Processing webhook events:", events);

    for (const event of events) {
      switch (event.event) {
        case "document_state_changed":
          console.log(
            `Document ${event.data.id} changed to ${event.data.status}`
          );
          // Handle state change
          break;

        case "document_creation_failed":
          console.error(`Creation failed: ${event.data.error.detail}`);
          // Handle creation failure
          break;

        case "document_completed":
          console.log(`Document ${event.data.id} completed`);
          // Handle completion
          break;

        case "recipient_completed":
          console.log(
            `Recipient ${event.data.recipient.email} completed signing`
          );
          // Handle recipient completion
          break;

        default:
          console.log(`Unhandled event type: ${event.event}`);
      }
    }

    return res
      .status(200)
      .json({ success: true, processedEvents: events.length });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
