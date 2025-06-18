import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = { api: { bodyParser: false } };

function getSignatureFromHeaders(req: NextApiRequest): string | null {
  // Helper function to safely get a string header
  const getHeaderString = (headerName: string): string | null => {
    const headerValue = req.headers[headerName];
    if (!headerValue) return null;
    return Array.isArray(headerValue) ? headerValue[0] : headerValue;
  };

  // Try all possible header variations
  const potentialHeaders = [
    "x-pandadoc-signature",
    "x-panda-signature",
    "X-PandaDoc-Signature",
    "X-Panda-Signature",
  ];

  for (const headerName of potentialHeaders) {
    const headerValue = getHeaderString(headerName);
    if (headerValue) {
      return headerValue;
    }
  }

  // Try extracting from Vercel's special headers
  try {
    const scHeaders = getHeaderString("x-vercel-sc-headers");
    if (scHeaders) {
      const headers = JSON.parse(scHeaders);
      for (const headerName of potentialHeaders) {
        if (headers[headerName]) {
          return Array.isArray(headers[headerName])
            ? headers[headerName][0]
            : headers[headerName];
        }
      }
    }
  } catch (e) {
    console.error("Error parsing x-vercel-sc-headers:", e);
  }

  return null;
}

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
    const signature = getSignatureFromHeaders(req);

    if (!signature) {
      console.error("All headers received:", req.headers);
      return res.status(400).json({
        error: "Missing signature header",
        receivedHeaders: Object.keys(req.headers),
      });
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
      // Try base64 as fallback
      const computedBase64 = crypto
        .createHmac("sha256", webhookKey)
        .update(rawBody)
        .digest("base64");

      if (computedBase64 !== signature) {
        return res.status(401).json({
          error: "Invalid signature",
          details: {
            computedHex: computedSignature,
            computedBase64: computedBase64,
            received: signature,
          },
        });
      }
    }

    const events = JSON.parse(bodyString);
    console.log("Received webhook events:", events);

    for (const event of events) {
      switch (event.event) {
        case "document_state_changed":
          console.log(
            `Document ${event.data.id} changed to ${event.data.status}`
          );
          // Handle document state change
          break;

        case "document_creation_failed":
          console.error("Document creation failed:", event.data.error.detail);
          // Handle creation failure
          break;

        case "document_completed":
          console.log(`Document ${event.data.id} completed`);
          // Handle completed document
          break;

        case "document_sent":
          console.log(`Document ${event.data.id} sent to recipients`);
          // Handle sent document
          break;

        case "document_completed_pdf_ready":
          console.log(`Document ${event.data.id} PDF ready`);
          // Handle PDF ready for download
          break;

        case "recipient_completed":
          console.log(
            `Recipient ${event.data.recipient.email} completed signing`
          );
          // Handle recipient completion
          break;

        default:
          console.log(`Unhandled event type: ${event.event}`);
        // Handle unknown event types
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
