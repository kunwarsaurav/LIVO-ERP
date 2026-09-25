// import { BASE_URL } from "@/lib/constants/config";

// export interface ApiResponse<T> {
//   data: T;
//   message?: string;
// }

// export class FetchError extends Error {
//   status?: number;
// }

// async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
//   const payload = await response.json().catch(() => null);

//   if (!response.ok) {
//     const message =
//       payload?.message ??
//       (typeof payload === "string" ? payload : "Something went wrong");
//     const error = new FetchError(message);
//     error.status = response.status;
//     throw error;
//   }

//   return payload as ApiResponse<T>;
// }

// interface FetchOptions extends Omit<RequestInit, "body"> {
//   /** Request body. Serialized as JSON unless `raw` is true. */
//   body?: unknown;
//   /** Set true when `body` is already a FormData / string body. */
//   raw?: boolean;
// }

// async function request<T>(path: string, options: FetchOptions): Promise<ApiResponse<T>> {
//   const { raw, ...init } = options;
//   const hasBody = init.body !== undefined && init.body !== null;

//   const response = await fetch(`${BASE_URL}${path}`, {
//     ...init,
//     credentials: "include",
//     headers: {
//       ...(raw || !hasBody ? {} : { "Content-Type": "application/json" }),
//       ...(init.headers ?? {}),
//     },
//     body: hasBody
//       ? raw
//         ? (init.body as BodyInit)
//         : JSON.stringify(init.body)
//       : undefined,
//   });

//   return handleResponse<T>(response);
// }

// /** Fetch helper for authenticated admin API calls (uses HttpOnly cookies). */
// export function authFetch<T>(
//   path: string,
//   options: FetchOptions = {},
// ): Promise<ApiResponse<T>> {
//   return request<T>(path, options);
// }

// /** Fetch helper for public API calls (login, refresh, forgot password). */
// export function publicFetch<T>(
//   path: string,
//   options: FetchOptions = {},
// ): Promise<ApiResponse<T>> {
//   return request<T>(path, options);
// }

// export function buildQueryString(params: Record<string, unknown>): string {
//   const searchParams = new URLSearchParams();

//   for (const [key, value] of Object.entries(params)) {
//     if (value === undefined || value === null || value === "") continue;
//     searchParams.set(key, String(value));
//   }

//   const query = searchParams.toString();
//   return query ? `?${query}` : "";
// }