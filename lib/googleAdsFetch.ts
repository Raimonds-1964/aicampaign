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

  if (!res.ok) {
    return {
      ok: false as const,
      status: res.status,
      contentType: res.headers.get("content-type"),
      responsePreview: text.slice(0, 500),
    };
  }

  return {
    ok: true as const,
    data: JSON.parse(text),
  };
}
