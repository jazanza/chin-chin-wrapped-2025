import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NEW: Helper function to format image URLs
export function formatImageUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) {
    return null;
  }

  // If it's already an absolute URL (http/https), return as is
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // If it's a data URI (Base64), return as is
  if (rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  // Assume relative paths are in the public directory.
  // Prepend with a leading slash if missing, to make it absolute from root.
  // Example: "images/beer.png" -> "/images/beer.png"
  // Example: "beer.png" -> "/beer.png"
  return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
}