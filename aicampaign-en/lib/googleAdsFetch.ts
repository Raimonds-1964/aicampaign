export async function googleAdsFetch(
  path: string,
  {
    accessToken,
    developerToken,
    loginCustomerId,
    body,
  }: {
    accessToken: string;
    developerToken: string;
    loginCustomerId?: string;
    body?: any;
  }
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId;
  }

  const res = await fetch(`https://googleads.googleapis.com${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  const requestId =
    res.headers.get("request-id") ||
    res.headers.get("x-request-id") ||
    res.headers.get("x-guploader-uploadid") ||
    null;

  if (!res.ok) {
    return {
      ok: false as const,
      status: res.status,
      contentType,
      requestId,
      responsePreview: text.slice(0, 500),
    };
  }

  // Google Ads should return JSON, but guard anyway to avoid hard crashes
  try {
    return {
      ok: true as const,
      data: text ? JSON.parse(text) : null,
    };
  } catch {
    return {
      ok: false as const,
      status: 502,
      contentType,
      requestId,
      responsePreview: text.slice(0, 500),
    };
  }
}
