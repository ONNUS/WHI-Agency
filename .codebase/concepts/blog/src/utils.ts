/**
 * Utilities for URL transformation and general helpers.
 */

/**
 * Extracts a Google Drive file ID from standard sharing or view links and formats it
 * as a direct download link suitable for HTML <img> or video src direct streaming.
 */
export function getGoogleDriveDirectLink(url: string | undefined): string {
  if (!url) return '';
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
    // Standard file URL matching patterns:
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // https://drive.google.com/open?id=FILE_ID
    // https://docs.google.com/uc?id=FILE_ID
    const fileIdMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                        trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                        
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://docs.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
  }
  
  return trimmedUrl;
}
