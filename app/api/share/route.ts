export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    console.log("📸 received:", file?.name);

    // 👇 これが重要（リダイレクト）
    return Response.redirect("/share", 303);
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
}