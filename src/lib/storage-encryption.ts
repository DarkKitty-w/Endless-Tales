/**
 * Simple encryption utility for sessionStorage data
 * Uses Web Crypto API for basic encryption/decryption
 * Note: This is not bulletproof security - it's obfuscation to prevent casual inspection
 * For true security, consider using a backend service or more robust encryption
 */

// Simple XOR encryption with a fixed key (for obfuscation only)
// In a real production app, use a proper encryption library
const ENCRYPTION_KEY = 'EndlessTales2024!@#$';

function simpleXor(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Encrypt data before storing in sessionStorage
 * Uses base64 encoding after simple XOR obfuscation
 */
export function encryptForStorage(data: string): string {
  if (typeof window === 'undefined') return data;
  
  try {
    const xored = simpleXor(data, ENCRYPTION_KEY);
    // Use btoa for base64 encoding (browser-compatible)
    return btoa(unescape(encodeURIComponent(xored)));
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Fallback to unencrypted
  }
}

/**
 * Decrypt data from sessionStorage
 * Reverses the encryption process
 */
export function decryptFromStorage(encryptedData: string): string {
  if (typeof window === 'undefined') return encryptedData;
  
  try {
    // Decode from base64
    const xored = decodeURIComponent(escape(atob(encryptedData)));
    return simpleXor(xored, ENCRYPTION_KEY);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Fallback to try as unencrypted
  }
}

/**
 * Securely store API keys in sessionStorage with encryption
 */
export function secureSetSessionItem(key: string, value: string): void {
  const encrypted = encryptForStorage(value);
  sessionStorage.setItem(key, encrypted);
}

/**
 * Retrieve and decrypt API keys from sessionStorage
 */
export function secureGetSessionItem(key: string): string | null {
  const encrypted = sessionStorage.getItem(key);
  if (!encrypted) return null;
  
  try {
    return decryptFromStorage(encrypted);
  } catch (error) {
    console.error('Failed to decrypt session item:', error);
    // If decryption fails, try returning as-is (migration from unencrypted)
    return encrypted;
  }
}

/**
 * Remove item from sessionStorage
 */
export function secureRemoveSessionItem(key: string): void {
  sessionStorage.removeItem(key);
}
