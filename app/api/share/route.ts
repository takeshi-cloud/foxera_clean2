export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file", { status: 400 });
    }

    console.log("📸 received:", file.name);

    // 一旦OK返す（あとで保存処理入れる）
    return Response.redirect("/", 303);
  } catch (e) {
    console.error("❌ share error", e);
    return new Response("error", { status: 500 });
  }
}