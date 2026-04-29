export async function POST(req: Request) {
  console.log("🔥 SHARE HIT START");

  try {
    // =========================
    // 基本情報
    // =========================
    console.log("👉 method:", req.method);
    console.log("👉 url:", req.url);
    console.log("👉 headers:", Object.fromEntries(req.headers.entries()));

    // =========================
    // formData取得
    // =========================
    let formData: FormData | null = null;

    try {
      formData = await req.formData();
      console.log("✅ formData取得成功");
    } catch (err) {
      console.error("❌ formData取得失敗", err);
    }

    if (!formData) {
      console.log("⚠️ formDataなし");

      const redirectUrl = new URL("/share", req.url);
      return Response.redirect(redirectUrl, 303);
    }

    // =========================
    // 中身チェック
    // =========================
    const entries = Array.from(formData.entries());

    console.log("👉 formData entries count:", entries.length);

    for (const [key, value] of entries) {
      if (value instanceof File) {
        console.log("📸 FILE FOUND");
        console.log("   name:", value.name);
        console.log("   type:", value.type);
        console.log("   size:", value.size);
      } else {
        console.log("📝 TEXT FIELD:", key, value);
      }
    }

    // =========================
    // file取得（従来ロジック）
    // =========================
    const file = formData.get("file");

    if (!file) {
      console.log("⚠️ file keyで取得できず");
    } else if (file instanceof File) {
      console.log("✅ file取得成功:", file.name);
    } else {
      console.log("⚠️ fileはFileじゃない:", file);
    }

    console.log("🔥 SHARE HIT END");

    // =========================
    // ✅ 最重要：絶対URLでリダイレクト
    // =========================
    const redirectUrl = new URL("/share", req.url);

    return Response.redirect(redirectUrl, 303);

  } catch (e) {
    console.error("❌ SHARE ERROR", e);
    return new Response("ERROR", { status: 500 });
  }
}