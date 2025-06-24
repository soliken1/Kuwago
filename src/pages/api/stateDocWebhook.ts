import type { NextApiRequest, NextApiResponse } from "next";

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
    console.warn(
      "⚠️ WARNING: Running in INSECURE MODE - Signature verification DISABLED"
    );

    const rawBody = await getRawBody(req);
    const bodyString = rawBody.toString("utf8");

    // Process webhook events without signature verification
    const events = JSON.parse(bodyString);

    for (const event of events) {
      switch (event.event) {
        case "document_state_changed":
          // Handle state change
          break;

        case "document_creation_failed":
          console.error(
            `[INSECURE] Creation failed: ${event.data.error.detail}`
          );
          // Handle creation failure
          break;

        case "document_completed":
          // Handle completion
          break;

        case "recipient_completed":
          // Handle recipient completion
          break;

        default:
      }
    }

    return res.status(200).json({
      success: true,
      processedEvents: events.length,
      warning: "INSECURE MODE - Signature verification disabled for testing",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
      warning: "Error occurred in insecure test mode",
    });
  }
}
