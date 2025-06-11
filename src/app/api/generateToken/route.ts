import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(request: NextRequest) {
  const api_key = process.env.STREAM_API_KEY!;
  const api_secret = process.env.STREAM_SECRET_KEY!;

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const serverClient = StreamChat.getInstance(api_key, api_secret);

  try {
    const token = serverClient.createToken(userId);
    return NextResponse.json({ token });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error }, { status: 500 });
  }
}
