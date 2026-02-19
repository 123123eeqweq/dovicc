import { fetchAPIAuth, API_URL } from "./common";

export async function register(name: string, email: string, password: string) {
  return fetchAPIAuth<{
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
      createdAt: string;
      isEmailActivated: boolean;
    };
    token: string;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string) {
  return fetchAPIAuth<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function logout() {
  return fetchAPIAuth<{ message: string }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// export async function loginWithGoogle(credential: string) {
//   return fetchAPIAuth<{
//     id: string;
//     name: string;
//     email: string;
//     createdAt: string;
//   }>('/auth/google', {
//     method: 'POST',
//     body: JSON.stringify({ credential }),
//   });
// }

export const loginWithGoogle = async (
  data:
    | string
    | { credential?: string; email: string; name?: string; picture?: string; sub?: string }
) => {
  const body: Record<string, string | undefined> =
    typeof data === "string"
      ? { credential: data }
      : {
          ...(data.credential && { credential: data.credential }),
          ...(data.email && { email: data.email }),
          ...(data.name && { name: data.name }),
          ...(data.picture && { picture: data.picture }),
          ...(data.sub && { sub: data.sub }),
        };
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw { status: response.status, ...error };
  }

  return response.json();
};

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const error = new Error("Unauthorized") as Error & {
          status?: number;
          errorCode?: string;
        };
        error.status = 401;
        error.errorCode = "UNAUTHORIZED";
        throw error;
      }

      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      const error = new Error(
        errorData.error || `API error: ${response.status}`
      ) as Error & { status?: number; errorCode?: string };
      error.status = response.status;
      error.errorCode = errorData.error;
      throw error;
    }

    return response.json();
  } catch (error: unknown) {
    const isConnectionError =
      (error instanceof Error &&
        (error.message === "fetch failed" ||
          (error.cause &&
            typeof error.cause === "object" &&
            "code" in error.cause &&
            error.cause.code === "ECONNREFUSED") ||
          error.name === "TypeError")) ||
      (error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ECONNREFUSED");

    if (isConnectionError) {
      const connectionError = new Error("CONNECTION_ERROR");
      (connectionError as { status?: number; errorCode?: string }).status = 0;
      (connectionError as { status?: number; errorCode?: string }).errorCode =
        "CONNECTION_ERROR";
      throw connectionError;
    }
    throw error;
  }
}

export async function resendActivationEmail() {
  return fetchAPIAuth<{ message: string }>("/auth/resendActivationEmail", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function forgotPassword(email: string) {
  return fetchAPIAuth<{ message: string }>("/auth/forgotPassword", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(link: string, newPassword: string) {
  return fetchAPIAuth<{ message: string }>(`/auth/resetPassword/${link}`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}
