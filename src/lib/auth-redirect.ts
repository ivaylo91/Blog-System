const authPagePrefixes = ["/signin", "/register"];

export function resolveSafeCallbackUrl(callbackUrl?: string | null, fallback = "/dashboard") {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  if (authPagePrefixes.some((prefix) => callbackUrl === prefix || callbackUrl.startsWith(`${prefix}?`))) {
    return fallback;
  }

  return callbackUrl;
}

export function buildAuthRedirectPath(pathname: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}