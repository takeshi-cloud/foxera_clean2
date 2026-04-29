import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log("🔥 SHARE HIT START");

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response("NO_FILE", { status: 400 });
    }

    const fileName = `share_${Date.now()}.png`;

    const { error } = await supabase.storage
      .from("screenshots")
      .upload(fileName, file);

    if (error) {
      console.error(error);
      return new Response("UPLOAD_ERROR", { status: 500 });
    }

    const { data } = supabase.storage
      .from("screenshots")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    console.log("✅ uploaded:", url);

    // 👇 URL付きで /shareへ
    return new Response(null, {
      status: 303,
      headers: {
        Location: `https://foxera-clean2.vercel.app/share?img=${encodeURIComponent(url)}`,
      },
    });

  } catch (e) {
    console.error("❌ SHARE ERROR", e);
    return new Response("ERROR", { status: 500 });
  }
}