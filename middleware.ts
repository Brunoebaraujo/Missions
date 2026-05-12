import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, supabase } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/app")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*"],
};
