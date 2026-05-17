const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("auth_token") 
    : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null as T, error: data.error || "An error occurred" };
    }

    return { data };
  } catch (error) {
    return { 
      data: null as T, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => 
    fetchApi<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) => 
    fetchApi<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "DELETE" }),
};

export interface User {
  id: string;
  email: string;
  name: string;
  clerkId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: string;
  statusCode: number;
}