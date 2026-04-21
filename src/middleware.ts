import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.pathname;

  // Admin koruması
  if (url.startsWith('/admin') && url !== '/admin/giris') {
    if (!user || user.email !== 'admin@admin.com') {
      return NextResponse.redirect(new URL('/admin/giris', request.url));
    }
  }

  // Firma paneli koruması
  if (url.startsWith('/panel')) {
    if (!user) {
      return NextResponse.redirect(new URL('/giris', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/panel/:path*'],
};
