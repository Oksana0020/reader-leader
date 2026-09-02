/* Reference-led rule: visual assets stay outside the project while this server-only adapter preserves their stable application URLs. */
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const key = path.join("/");
  const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL ?? "").replace(/\/+$/, "");
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!key || !forgeBaseUrl || !forgeKey) {
    return NextResponse.json({ error: "STORAGE_PROXY_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const presignUrl = new URL("v1/storage/presign/get", `${forgeBaseUrl}/`);
    presignUrl.searchParams.set("path", key);
    const response = await fetch(presignUrl, {
      headers: { Authorization: `Bearer ${forgeKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "STORAGE_BACKEND_ERROR" }, { status: 502 });
    }

    const result = (await response.json()) as { url?: string };
    if (!result.url) {
      return NextResponse.json({ error: "EMPTY_STORAGE_URL" }, { status: 502 });
    }

    return NextResponse.redirect(result.url, {
      status: 307,
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch {
    return NextResponse.json({ error: "STORAGE_PROXY_ERROR" }, { status: 502 });
  }
}
