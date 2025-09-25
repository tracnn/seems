export function buildOracleConnectString(
    host: string,
    port: string,
    sid?: string,
    serviceName?: string,
): string {
    if (sid) {
    return `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SID=${sid})))`;
    }
    if (serviceName) {
    return `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVICE_NAME=${serviceName})))`;
    }
    throw new Error('Either SID or SERVICE_NAME must be provided.');
}