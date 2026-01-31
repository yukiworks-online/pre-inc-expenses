/**
 * Constructs a public Firebase Storage URL from a file path.
 * Uses the firebasestorage.googleapis.com domain to respect Firebase Security Rules.
 * 
 * @param path - The file path in storage (e.g., 'receipts/file.jpg')
 * @returns The full public URL
 */
export function getPublicStorageUrl(path: string | null | undefined): string | undefined {
    if (!path) return undefined;

    // Use environment variable or fallback
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'pj-settlement.firebasestorage.app';

    // Ensure clean path
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Construct Firebase Storage URL
    // Format: https://firebasestorage.googleapis.com/v0/b/[BUCKET]/o/[ENCODED_PATH]?alt=media
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(cleanPath)}?alt=media`;
}
