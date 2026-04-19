import { NextResponse } from "next/server";
import { handleUpload } from "@/app/upload/handleUpload"; // ←直せ

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const result = await handleUpload(formData);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Upload API Error:", error);

    return NextResponse.json(
      { success: false, message: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}