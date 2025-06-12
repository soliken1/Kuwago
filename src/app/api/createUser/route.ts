// app/api/createUser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(req: NextRequest) {
  const { userId, username, avatarUrl } = await req.json();
  if (!userId || !username || !avatarUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY!,
    process.env.STREAM_SECRET_KEY!
  );

  try {
    await serverClient.upsertUsers([
      {
        id: userId,
        name: username,
        image: avatarUrl,
        role: "user",
      },
    ]);

    return NextResponse.json({ message: "User created" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
