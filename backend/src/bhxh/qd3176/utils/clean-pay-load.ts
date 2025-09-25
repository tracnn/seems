export function cleanPayload<T>(payload: T): T {
    const cleanedPayload: any = {};

    for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
            let value = payload[key];

            if (typeof value === 'string' && value.trim() === '') {
                cleanedPayload[key] = null;
            } else {
                cleanedPayload[key] = value;
            }
        }
    }

    return cleanedPayload as T;
}