import { NextResponse, type NextRequest } from "next/server";

const unsafeAsyncQueryKeys = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "then",
  "catch",
  "finally"
]);

export function middleware(request: NextRequest) {
  const hasUnsafeKey = [...request.nextUrl.searchParams.keys()]
    .some((key) => unsafeAsyncQueryKeys.has(key));
  if (!hasUnsafeKey) {
    return NextResponse.next();
  }

  const safeUrl = request.nextUrl.clone();
  safeUrl.search = "";
  safeUrl.searchParams.set("starter", "unsafe-query-key");
  return NextResponse.rewrite(safeUrl);
}

export const config = {
  matcher: ["/world"]
};
