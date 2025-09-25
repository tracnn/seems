import * as crypto from 'crypto';
/**
 * Kiểm tra tính hợp lệ của chữ ký HMAC SHA256
 * @param secret Chuỗi bí mật
 * @param body Dữ liệu cần ký (string, thường là body gốc)
 * @param signatureHeader Header: "sha256=AF-13-..."
 * @returns true/false
 */
export function isSignatureCompatible(
    secret: string,
    body: string,
    signatureHeader: string,
): boolean {
    if (!signatureHeader || !signatureHeader.includes('=')) {
        return false;
    }

    const [algo, receivedSignature] = signatureHeader.split('=', 2);

    if (algo.toLowerCase() !== 'sha256') {
        throw new Error('Only sha256 is supported');
    }

    try {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(body, 'utf8');
        const hash = hmac.digest();
        const computedSignature = bytesToHyphenHex(hash);
        return computedSignature.toLowerCase() === receivedSignature.toLowerCase();
    } catch (e) {
        return false;
    }
}

/**
 * Sinh chữ ký HMAC SHA256 cho body
 * @param secret Chuỗi bí mật
 * @param body Chuỗi body (string, chưa parse)
 * @returns Chữ ký dạng "sha256=AF-13-..."
 */
export function signBodyWithHmacSha256(secret: string, body: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body, 'utf8');
    const hash = hmac.digest();
    const signature = bytesToHyphenHex(hash);
    return `sha256=${signature}`;
}

function bytesToHyphenHex(bytes: Buffer): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join('-');
}