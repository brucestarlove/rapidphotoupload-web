import apiClient from "./client";

/**
 * Add a tag to a photo
 */
export async function addTag(photoId: string, tag: string): Promise<void> {
  await apiClient.post(`/commands/photos/${photoId}/tags`, { tag });
}

/**
 * Remove a tag from a photo
 */
export async function removeTag(photoId: string, tag: string): Promise<void> {
  await apiClient.delete(`/commands/photos/${photoId}/tags/${encodeURIComponent(tag)}`);
}

/**
 * Get all available tags (for autocomplete)
 */
export async function getTags(): Promise<string[]> {
  const response = await apiClient.get<{ tags: string[] }>("/queries/tags");
  return response.data.tags || [];
}

/**
 * Validate tag format
 */
export function validateTag(tag: string): { valid: boolean; error?: string } {
  const trimmed = tag.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Tag cannot be empty" };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: "Tag must be 50 characters or less" };
  }
  
  // Allow alphanumeric, spaces, hyphens, underscores
  const tagRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!tagRegex.test(trimmed)) {
    return { valid: false, error: "Tag can only contain letters, numbers, spaces, hyphens, and underscores" };
  }
  
  return { valid: true };
}

