import { FTP_CLIENT_EMR } from '../configs/ftp-client.config';

export const ftpEmrOption = {
    host: FTP_CLIENT_EMR.FTP_HOST,
    port: FTP_CLIENT_EMR.FTP_PORT,
    user: FTP_CLIENT_EMR.FTP_USERNAME,
    password: FTP_CLIENT_EMR.FTP_PASSWORD,
    secure: FTP_CLIENT_EMR.SECURE,
    secureOptions: FTP_CLIENT_EMR.SERCURE_OPTION,
} as const;
