export async function POST(req: Request) {
  try {
    // ここで一応受ける（何もしなくてOK）
    await req.formData();

    // 👉 Share画面へ
    return Response.redirect("/share", 303);
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
}