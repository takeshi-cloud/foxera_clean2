export async function POST(req: Request) {
  console.log("🔥 SHARE HIT START");

  try {
    console.log("👉 method:", req.method);
    console.log("👉 url:", req.url);

    let formData: FormData | null = null;

    try {
      formData = await req.formData();
      console.log("✅ formData取得成功");
    } catch (err) {
      console.error("❌ formData取得失敗", err);
    }

    if (!formData) {
      console.log("⚠️ formDataなし");
      
      // 👇 絶対URLでリダイレクト
      return new Response(null, {
        status: 303,
        headers: {
          Location: "https://foxera-clean2.vercel.app/share",
        },
      });
    }

    const entries = Array.from(formData.entries());

    console.log("👉 formData entries count:", entries.length);

    for (const [key, value] of entries) {
      if (value instanceof File) {
        console.log("📸 FILE FOUND", value.name);
      } else {
        console.log("📝 TEXT FIELD:", key, value);
      }
    }

    const file = formData.get("file");

    if (!file) {
      console.log("⚠️ fileなし");
    } else if (file instanceof File) {
      console.log("✅ file取得成功:", file.name);
    }

    console.log("🔥 SHARE HIT END");

    // 👇 ここが今回の本命（絶対URL）
    return new Response(null, {
      status: 303,
      headers: {
        Location: "https://foxera-clean2.vercel.app/share",
      },
    });

  } catch (e) {
    console.error("❌ SHARE ERROR", e);
    return new Response("ERROR", { status: 500 });
  }
}