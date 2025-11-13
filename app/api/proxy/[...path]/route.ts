import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API route to forward requests to the backend server
 * This allows HTTPS frontend to communicate with HTTP backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, resolvedParams.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, resolvedParams.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, resolvedParams.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, resolvedParams.path, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, resolvedParams.path, "PATCH");
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  // Get backend URL from environment variable
  // Use BACKEND_API_URL for server-side (not exposed to client)
  // Fall back to NEXT_PUBLIC_API_URL if BACKEND_API_URL is not set
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  
  // Remove trailing slash from backend URL if present
  const cleanBackendUrl = backendUrl.replace(/\/$/, "");
  
  // Reconstruct the path (e.g., ["api", "auth", "login"] -> "api/auth/login")
  const path = pathSegments.join("/");
  const url = new URL(request.url);
  
  // Build backend URL with path and query params
  // Ensure we have exactly one slash between base URL and path
  const backendFullUrl = `${cleanBackendUrl}/${path}${url.search}`;
  
  try {
    // Get authorization header from request
    const authHeader = request.headers.get("authorization");
    
    // Prepare headers - copy relevant headers from request
    const headers: HeadersInit = {};
    
    // Copy content-type if present
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    
    // Copy authorization header
    if (authHeader) {
      headers.Authorization = authHeader;
    }
    
    // Get request body if present
    let body: BodyInit | undefined;
    if (method !== "GET" && method !== "DELETE") {
      if (contentType?.includes("multipart/form-data")) {
        body = await request.formData();
      } else if (contentType?.includes("application/json") || contentType?.includes("text/")) {
        body = await request.text();
      } else {
        // Try to get as blob for binary data
        body = await request.blob();
      }
    }
    
    // Forward request to backend
    const response = await fetch(backendFullUrl, {
      method,
      headers,
      body,
    });
    
    // Get response data
    const responseData = await response.text();
    
    // Copy response headers
    const responseHeaders: HeadersInit = {};
    const contentTypeHeader = response.headers.get("content-type");
    if (contentTypeHeader) {
      responseHeaders["Content-Type"] = contentTypeHeader;
    }
    
    // Return response with same status and headers
    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[API Proxy] Error proxying request:", error);
    console.error("[API Proxy] Backend URL:", cleanBackendUrl);
    console.error("[API Proxy] Path:", path);
    return NextResponse.json(
      { error: "Failed to proxy request to backend", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

