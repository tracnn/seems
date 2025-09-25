
export const LIMIT_DEFAULT = 10;
export const PAGE_DEFAULT = 1;

export const DB_TYPE = {
    ORACLE: 'oracle',
    POSTGRESQL: 'postgresql',
    MYSQL: 'mysql',
    SQLITE: 'sqlite',
    MSSQL: 'mssql',
    MONGODB: 'mongodb',
    FIRESTORE: 'firestore',
    REDIS: 'redis',
    ELASTICSEARCH: 'elasticsearch',
}

export const BASE_SCHEMA = {
    DEFAULT: 'default',
    ACS_RS: 'ACS_RS',
    SDA_RS: 'SDA_RS',
    HIS_RS: 'HIS_RS',
    EMR_RS: 'EMR_RS',
    LIS_RS: 'LIS_RS',
}

export const USER_TYPE = {
    STAFF: 'STAFF',
    USER: 'USER',
}

export const DOCUMENT_SCHEMA = {
    USER: 'users',
    PATIENT: 'patients',
    DOCTOR: 'doctors',
    CLINIC: 'clinics',
    SPECIALTY: 'specialties',
    TITLE: 'titles',
    CLINIC_SPECIALTY: 'clinic_specialties',
    DOCTOR_TITLE: 'doctor_titles',
}

export const SERVICE_REQ_TYPE_IDS_CLINICAL_LAB = [6, 7, 11, 14, 15, 16, 17]; //Không phải CLS + KQ

// Dịch vụ dùng để kiểm tra cần kết thúc
export const SERVICE_REQ_TYPE_IDS_CLINICAL_LAB_NEED_END = [12, 9, 8, 5, 3, 2, 13]; //Không phải CLS + KQ

export const SERVICE_REQ_TYPE_OTHER_WITH_EXECUTE_MODULE = [11]; // 11: Khác nhưng có module thực hiện

//service type exam
export const SERVICE_REQ_TYPE_IDS_EXAM = [1]; //Kiểu dịch vụ khám bệnh

export enum SERVICE_REQ_STATUS_ID {
    ALL = 0,
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED = 3
}

export const SERVICE_REQ_STATUS_HAS_START_TIME = [
    SERVICE_REQ_STATUS_ID.IN_PROGRESS,
    SERVICE_REQ_STATUS_ID.COMPLETED
];

export const SERVICE_REQ_STATUS_HAS_END_TIME = [
    SERVICE_REQ_STATUS_ID.COMPLETED
];

export const TRANSACTION_TYPE_IDS = {
    ADVANCE_PAYMENT: 1,
    REFUND: 2,
    PAYMENT: 3,
    DEBT: 4
};

export const SERVICE_TYPE_ID_PACS = [3, 10];
export const SERVICE_PACS_NOT_CAPTURE = 'Ca chưa được chụp';

export const EMR_DOCUMENT_TYPE_RETURN_TO_PATIENT = [22, 3];
export const EMR_DOCUMENT_GROUP_NOT_RETURN_TO_PATIENT = [28];

export const EMR_DOCUMENT_CONTENT_TYPE = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    doc: 'application/msword',
    ppt: 'application/vnd.ms-powerpoint',
};

export const PRESCRIPTION_SOURCE_TYPE = {
    INTERNAL: 'Đơn cấp phát',
    EXTERNAL: 'Đơn tự túc',
};

export const ROOM_TYPE_IDS = {
    EXAM_PARACLINIC: 1,
    STOCK: 2,
    RECEPTION: 3,
    BED_ROOM: 4,
    MEDICAL_CABINET: 5,
    CASHIER: 6,
    SAMPLE_ROOM: 7,
    MEDICAL_STATION: 8,
    DINNER_ROOM: 9
};

export const ROOM_TYPE_IDS_QUEUE_TICKET = [1, 3, 6, 7, 8, 9];