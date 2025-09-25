export function flatten(obj: { [key: string]: any }, prefix = ''): { [key: string]: any } {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? `${prefix}${k.charAt(0).toUpperCase() + k.slice(1)}` : k;
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flatten(obj[k], pre));
        } else {
            acc[pre] = obj[k];
        }
        return acc;
    }, {} as { [key: string]: any });
}