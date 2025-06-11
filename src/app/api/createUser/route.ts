import { StreamChat } from "stream-chat";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const api_key = process.env.STREAM_API_KEY!;
  const api_secret = process.env.STREAM_SECRET_KEY!;
  const { userId, username } = (await request.json()) as {
    userId: string;
    username: string;
  };

  if (!userId || !username) {
    return NextResponse.json(
      { error: "Missing userId or username" },
      { status: 400 }
    );
  }

  const serverClient = StreamChat.getInstance(api_key, api_secret);

  try {
    await serverClient.upsertUsers([
      { id: userId, name: username, role: "user" },
    ]);
    return NextResponse.json({ message: "User created successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
