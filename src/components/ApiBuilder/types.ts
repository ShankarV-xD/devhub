export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type BodyType = "json" | "form" | "text" | "none";

export interface ApiRequest {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
  bodyType: BodyType;
  timestamp: number;
  name?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
  error?: string;
}

export interface HeaderRow {
  key: string;
  value: string;
  enabled: boolean;
}
