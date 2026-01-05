import OpenAI from "openai";
import { NextResponse } from "next/server";
import { toFile } from "openai/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await openai.files.create({
      file: await toFile(buffer, file.name),
      purpose: "assistants"
    });

    const vectorStore = await openai.beta.vectorStores.create({
      name: `upload-${Date.now()}`
    });

    await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStore.id, {
      file_ids: [upload.id]
    });

    return NextResponse.json({
      vectorStoreId: vectorStore.id,
      fileId: upload.id
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
