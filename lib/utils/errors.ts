/**
 * Check if an error is a connection refused/network error
 */
export function isConnectionError(error: unknown): boolean {
  if (!error) return false;
  
  // Axios errors
  if (typeof error === "object" && "code" in error) {
    const code = (error as any).code;
    return (
      code === "ECONNREFUSED" ||
      code === "ERR_NETWORK" ||
      code === "ETIMEDOUT" ||
      code === "ENOTFOUND"
    );
  }
  
  // Check error message for connection-related keywords
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network error") ||
      message.includes("connection refused") ||
      message.includes("failed to fetch") ||
      message.includes("networkerror")
    );
  }
  
  return false;
}

