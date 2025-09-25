import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1758074897158 implements MigrationInterface {
    name = 'Update1758074897158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML1S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "STT" number,
                "MA_BN" varchar2(100),
                "HO_TEN" varchar2(255),
                "SO_CCCD" varchar2(50),
                "NGAY_SINH" varchar2(12),
                "GIOI_TINH" number,
                "NHOM_MAU" varchar2(5),
                "MA_QUOCTICH" varchar2(3),
                "MA_DANTOC" varchar2(2),
                "MA_NGHE_NGHIEP" varchar2(5),
                "DIA_CHI" varchar2(4000) NOT NULL,
                "MATINH_CU_TRU" varchar2(3),
                "MAHUYEN_CU_TRU" varchar2(3),
                "MAXA_CU_TRU" varchar2(5),
                "DIEN_THOAI" varchar2(15),
                "MA_THE_BHYT" varchar2(255),
                "MA_DKBD" varchar2(255),
                "GT_THE_TU" varchar2(12),
                "GT_THE_DEN" varchar2(12),
                "NGAY_MIEN_CCT" varchar2(12),
                "LY_DO_VV" varchar2(4000),
                "LY_DO_VNT" varchar2(4000),
                "MA_LY_DO_VNT" varchar2(5),
                "CHAN_DOAN_VAO" varchar2(4000),
                "CHAN_DOAN_RV" varchar2(4000),
                "MA_BENH_CHINH" varchar2(100),
                "MA_BENH_KT" varchar2(255),
                "MA_BENH_YHCT" varchar2(255),
                "MA_PTTT_QT" varchar2(255),
                "MA_DOITUONG_KCB" varchar2(4),
                "MA_NOI_DI" varchar2(5),
                "MA_NOI_DEN" varchar2(5),
                "MA_TAI_NAN" number,
                "NGAY_VAO" varchar2(12),
                "NGAY_VAO_NOI_TRU" varchar2(12),
                "NGAY_RA" varchar2(12),
                "GIAY_CHUYEN_TUYEN" varchar2(50),
                "SO_NGAY_DTRI" number,
                "PP_DIEU_TRI" varchar2(4000),
                "KET_QUA_DTRI" number,
                "MA_LOAI_RV" number,
                "GHI_CHU" varchar2(4000),
                "NGAY_TTOAN" varchar2(12),
                "T_THUOC" number(15, 2),
                "T_VTYT" number(15, 2),
                "T_TONGCHI_BV" number(15, 2),
                "T_TONGCHI_BH" number(15, 2),
                "T_BNTT" number(15, 2),
                "T_BNCCT" number(15, 2),
                "T_BHTT" number(15, 2),
                "T_NGUONKHAC" number(15, 2),
                "T_BHTT_GDV" number(15, 2),
                "NAM_QT" number,
                "THANG_QT" number,
                "MA_LOAI_KCB" varchar2(2),
                "MA_KHOA" varchar2(50),
                "MA_CSKCB" varchar2(5),
                "MA_KHUVUC" varchar2(2),
                "CAN_NANG" number,
                "CAN_NANG_CON" number,
                "NAM_NAM_LIEN_TUC" varchar2(12),
                "NGAY_TAI_KHAM" varchar2(50),
                "MA_HSBA" varchar2(100),
                "MA_TTDV" varchar2(255),
                "DU_PHONG" varchar2(4000),
                "XML_SUMMARY_TYPE" varchar2(20) DEFAULT 'CORRECT' NOT NULL,
                "IMPORT_SESSION_ID" varchar2(36),
                CONSTRAINT "PK_7bd588410c7194ebc8a29416d78" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0c66774c07f855720a278fa669" ON "QD3176_XML1S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_092ec8799b37323c5b16068b8a" ON "QD3176_XML1S" ("MA_BN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2df4c85b3b25477930961079d6" ON "QD3176_XML1S" ("SO_CCCD")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_500793387370303a2d61e1e624" ON "QD3176_XML1S" ("MATINH_CU_TRU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fd16f51c651c944675b19a2d06" ON "QD3176_XML1S" ("MAHUYEN_CU_TRU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_92619ccc7254c4abec41261f5e" ON "QD3176_XML1S" ("MAXA_CU_TRU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_81deb2da3f471aa8c97e9eba0d" ON "QD3176_XML1S" ("MA_THE_BHYT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_96147e89762ec48726b929f53f" ON "QD3176_XML1S" ("MA_DKBD")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a8471873d3d92e177f00cb7c0f" ON "QD3176_XML1S" ("MA_DOITUONG_KCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c06c040ff7ba5a40c2b2150952" ON "QD3176_XML1S" ("NGAY_VAO")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e6bc4e55a0293ba27e92e7b175" ON "QD3176_XML1S" ("NGAY_VAO_NOI_TRU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2044cd6f4097f7ee6a1579ee4c" ON "QD3176_XML1S" ("NGAY_RA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_478f5544c98accee0d8ba810e3" ON "QD3176_XML1S" ("MA_LOAI_RV")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0718646467b4b902e79679cf9d" ON "QD3176_XML1S" ("NGAY_TTOAN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f3fc2437b644fde22d752f18f9" ON "QD3176_XML1S" ("NAM_QT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d61f229d524fbeb00f252d650c" ON "QD3176_XML1S" ("THANG_QT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4d86a2ed2e96d47752283cd2d3" ON "QD3176_XML1S" ("MA_LOAI_KCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_88e0e16cf047e3a24228a25283" ON "QD3176_XML1S" ("MA_KHOA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9fdac205fe9779beed1dead145" ON "QD3176_XML1S" ("MA_CSKCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bc48fcef6ecead9f1779a983de" ON "QD3176_XML1S" ("XML_SUMMARY_TYPE")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7549f960ca44c45e4c15546885" ON "QD3176_XML1S" ("IMPORT_SESSION_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b2ac166948f891437e24b433b8" ON "QD3176_XML1S" (
                "MA_THE_BHYT",
                "NGAY_VAO",
                "THANG_QT",
                "NAM_QT",
                "MA_LOAI_KCB",
                "MA_CSKCB"
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a97762693a129f3b7e53f0c4e9" ON "QD3176_XML1S" ("MA_CSKCB", "MA_LK", "STT")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML2S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "STT" number,
                "MA_THUOC" varchar2(255),
                "MA_PP_CHEBIEN" varchar2(255),
                "MA_CSKCB_THUOC" varchar2(10),
                "MA_NHOM" number,
                "TEN_THUOC" varchar2(1024),
                "DON_VI_TINH" varchar2(50),
                "HAM_LUONG" varchar2(1024),
                "DUONG_DUNG" varchar2(4),
                "DANG_BAO_CHE" varchar2(1024),
                "LIEU_DUNG" varchar2(1024),
                "CACH_DUNG" varchar2(1024),
                "SO_DANG_KY" varchar2(255),
                "TT_THAU" varchar2(255),
                "PHAM_VI" number,
                "TYLE_TT_BH" number,
                "SO_LUONG" number(15, 3),
                "DON_GIA" number(15, 3),
                "THANH_TIEN_BV" number(15, 2),
                "THANH_TIEN_BH" number(15, 2),
                "T_NGUONKHAC_NSNN" number(15, 2),
                "T_NGUONKHAC_VTNN" number(15, 2),
                "T_NGUONKHAC_VTTN" number(15, 2),
                "T_NGUONKHAC_CL" number(15, 2),
                "T_NGUONKHAC" number(15, 2),
                "MUC_HUONG" number,
                "T_BNTT" number(15, 2),
                "T_BNCCT" number(15, 2),
                "T_BHTT" number(15, 2),
                "MA_KHOA" varchar2(50),
                "MA_BAC_SI" varchar2(255),
                "MA_DICH_VU" varchar2(255),
                "NGAY_YL" varchar2(12),
                "NGAY_TH_YL" varchar2(12),
                "MA_PTTT" number,
                "NGUON_CTRA" number,
                "VET_THUONG_TP" number,
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_7111534d73e8ae49fecc80ca20c" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ea17dd8254e2d24b46fbdcd07e" ON "QD3176_XML2S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e6aa4aad11f03c26d52de1ad0a" ON "QD3176_XML2S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_10488519cbfb76f9ef2f087c95" ON "QD3176_XML2S" ("MA_THUOC")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ca2124cb67f4f9da0547590529" ON "QD3176_XML2S" ("MA_PP_CHEBIEN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e7a2b2226668fcd9dac22fd1da" ON "QD3176_XML2S" ("MA_CSKCB_THUOC")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cfc1e1ef926c3357a5d9ddc11b" ON "QD3176_XML2S" ("MA_NHOM")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1b556b07af53c5db3670410145" ON "QD3176_XML2S" ("DUONG_DUNG")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bca658f94f8fbdfbe10f65d19a" ON "QD3176_XML2S" ("MA_KHOA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_420b527a2f010a894064927287" ON "QD3176_XML2S" ("MA_BAC_SI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f0e0604ebc82b41726b55eb264" ON "QD3176_XML2S" ("MA_DICH_VU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ef38e28e8d83889cc0e87a5d35" ON "QD3176_XML2S" ("NGAY_YL")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f6077f8087aeab9203965bc232" ON "QD3176_XML2S" ("NGAY_TH_YL")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_833110281ccf31639a7dcde74e" ON "QD3176_XML2S" ("MA_PTTT")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML3S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "STT" number,
                "MA_DICH_VU" varchar2(50),
                "MA_PTTT_QT" varchar2(255),
                "MAVATTU" varchar2(255),
                "MA_NHOM" number,
                "GOI_VTYT" varchar2(3),
                "TEN_VAT_TU" varchar2(1024),
                "TEN_DICH_VU" varchar2(1024),
                "MA_XANG_DAU" varchar2(20),
                "DON_VI_TINH" varchar2(50),
                "PHAM_VI" number,
                "SO_LUONG" float,
                "DON_GIA_BV" float,
                "DON_GIA_BH" float,
                "TT_THAU" varchar2(50),
                "TYLE_TT_DV" number,
                "TYLE_TT_BH" number,
                "THANH_TIEN_BV" float,
                "THANH_TIEN_BH" float,
                "T_TRANTT" float,
                "MUC_HUONG" number,
                "T_NGUONKHAC_NSNN" float,
                "T_NGUONKHAC_VTNN" float,
                "T_NGUONKHAC_VTTN" float,
                "T_NGUONKHAC_CL" float,
                "T_NGUONKHAC" float,
                "T_BNTT" float,
                "T_BNCCT" float,
                "T_BHTT" float,
                "MA_KHOA" varchar2(50),
                "MA_GIUONG" varchar2(50),
                "MA_BAC_SI" varchar2(255),
                "NGUOI_THUC_HIEN" varchar2(1024),
                "MA_BENH" varchar2(100),
                "MA_BENH_YHCT" varchar2(150),
                "NGAY_YL" varchar2(12),
                "NGAY_TH_YL" varchar2(12),
                "NGAY_KQ" varchar2(12),
                "MA_PTTT" number,
                "VET_THUONG_TP" number,
                "PP_VO_CAM" number,
                "VI_TRI_TH_DVKT" number,
                "MA_MAY" varchar2(1024),
                "MA_HIEU_SP" varchar2(255),
                "TAI_SU_DUNG" number,
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_c1a87a8a31d6720e5a462a7c38c" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f9445f5908db343e8ba8ed9101" ON "QD3176_XML3S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fc12d1d4243507df9c6985444f" ON "QD3176_XML3S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c70b62ced350443cdf9f602d94" ON "QD3176_XML3S" ("MA_DICH_VU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f06793424e3576f4f5ce849d2a" ON "QD3176_XML3S" ("MA_PTTT_QT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2caa4cbfcc10082eaedd5209b4" ON "QD3176_XML3S" ("MAVATTU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_20c0ae86f471f92b433a89d80a" ON "QD3176_XML3S" ("MA_NHOM")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f387aa8d3a8a00497c59eeb798" ON "QD3176_XML3S" ("MA_XANG_DAU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9da01a427bac7916f67539a4ba" ON "QD3176_XML3S" ("TT_THAU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_24b3b0e81eb9e23d8e20466854" ON "QD3176_XML3S" ("MA_KHOA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_136e9ca7c74b9ab1fee45fc3cd" ON "QD3176_XML3S" ("MA_GIUONG")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7a513e07ab432e36e5f234989c" ON "QD3176_XML3S" ("MA_BAC_SI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d29bc69ff0d7d6956b87557280" ON "QD3176_XML3S" ("NGUOI_THUC_HIEN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_81a595a03c55f6a816938bd122" ON "QD3176_XML3S" ("MA_BENH")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_68ad4cbb6c5a437e89c52c7b8b" ON "QD3176_XML3S" ("MA_BENH_YHCT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_11fd62c681139103db40ff2f67" ON "QD3176_XML3S" ("NGAY_YL")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1f19ce8ce46f13a31051a5f70f" ON "QD3176_XML3S" ("NGAY_TH_YL")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_858a71062376bce007e6f9d63d" ON "QD3176_XML3S" ("NGAY_KQ")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a434b105ee8c74050f5bd510cb" ON "QD3176_XML3S" ("MA_PTTT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_88017e573b999c348e15646225" ON "QD3176_XML3S" ("PP_VO_CAM")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1c778477cb573dededa3cc0063" ON "QD3176_XML3S" ("MA_MAY")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML4S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "STT" number,
                "MA_DICH_VU" varchar2(50),
                "MA_CHI_SO" varchar2(255),
                "TEN_CHI_SO" varchar2(255),
                "GIA_TRI" varchar2(1024),
                "DON_VI_DO" varchar2(50),
                "MO_TA" varchar2(4000),
                "KET_LUAN" varchar2(4000),
                "NGAY_KQ" varchar2(12),
                "MA_BS_DOC_KQ" varchar2(255),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_1c964a784b1ace5b8d698be1887" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2058ae8ba9c3358baf329bec3d" ON "QD3176_XML4S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9a7b01e96e3f4a1a8399ea652d" ON "QD3176_XML4S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4ee620e0ecd5126a281b886d37" ON "QD3176_XML4S" ("MA_DICH_VU")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fb5457964b8097a70df03c3633" ON "QD3176_XML4S" ("MA_CHI_SO")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_83a036a13fef9d20c462a5d387" ON "QD3176_XML4S" ("NGAY_KQ")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_48943530634a04abab8a9d4043" ON "QD3176_XML4S" ("MA_BS_DOC_KQ")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML5S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "STT" number,
                "DIEN_BIEN_LS" varchar2(4000),
                "GAIAI_DOAN_BENH" varchar2(4000),
                "HOI_CHAN" varchar2(4000),
                "PHAU_THUAT" varchar2(4000),
                "THOI_DIEM_DBLS" varchar2(12),
                "NGUOI_THUC_HIEN" varchar2(255),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_f08f49be167a74fa7cd7155ec9f" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_69b45fd92ebeb9c97189d3374b" ON "QD3176_XML5S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_abe7adc7b10e1e5814aa568f74" ON "QD3176_XML5S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b39023c745a0cccff4159c8a96" ON "QD3176_XML5S" ("THOI_DIEM_DBLS")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_36d0f4b2ed358e4d65baea0fbc" ON "QD3176_XML5S" ("NGUOI_THUC_HIEN")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML6S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "MA_THE_BHYT" varchar2(255),
                "SO_CCCD" varchar2(255),
                "NGAY_SINH" varchar2(12),
                "GIOI_TINH" number,
                "DIA_CHI" varchar2(1024),
                "MATINH_CU_TRU" varchar2(3),
                "MA_HUYEN_CU_TRU" varchar2(3),
                "MAXA_CU_TRU" varchar2(5),
                "NGAYKD_HIV" varchar2(12),
                "NOI_LAY_MAU_XN" varchar2(5),
                "NOI_XN_KD" varchar2(5),
                "NOI_BDDT_ARV" varchar2(5),
                "BDDTARV" varchar2(12),
                "MA_PHAC_DO_DIEU_TRI_BD" varchar2(200),
                "MA_BAC_PHAC_DO_BD" number,
                "MA_LYDO_DTRI" number,
                "LOAI_DTRI_LAO" number,
                "SANG_LOC_LAO" number,
                "PHAC_DO_DTR_ILAO" number,
                "NGAYBD_DTRI_LAO" varchar2(12),
                "NGAYKT_DTRI_LAO" varchar2(12),
                "KQ_DTRI_LAO" number,
                "MA_LYDO_XNTL_VR" number,
                "NGAY_XN_TLVR" varchar2(12),
                "KQ_XNTL_VR" number,
                "NGAY_KQ_XN_TLVR" varchar2(12),
                "MA_LOAI_BN" number,
                "GAI_DOAN_LAM_SANG" number,
                "NHOM_DOI_TUONG" number,
                "MA_TINH_TRANG_DK" varchar2(18),
                "LAN_XN_PCR" number,
                "NGAY_XN_PCR" varchar2(12),
                "NGAY_KQ_XN_PCR" varchar2(12),
                "MA_KQ_XN_PCR" number,
                "NGAY_NHAN_TT_MANG_THAI" varchar2(12),
                "NGAY_BAT_DAU_DT_CTX" varchar2(12),
                "MA_XU_TRI" varchar2(10),
                "NGAY_BAT_DAU_XU_TRI" varchar2(12),
                "NGAY_KET_THUC_XU_TRI" varchar2(12),
                "MA_PHAC_DO_DIEU_TRI" varchar2(200),
                "MA_BAC_PHAC_DO" number,
                "SO_NGAY_CAP_THUOC_ARV" number,
                "NGAY_CHUYEN_PHAC_DO" varchar2(12),
                "LY_DO_CHUYEN_PHAC_DO" number,
                "MA_CSKCB" varchar2(5),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_63b50f40c32f7952529b86ee278" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_86f24f7dfe0643fb91a0505b1a" ON "QD3176_XML6S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bc043b0671a30973b855e729db" ON "QD3176_XML6S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4e1a0461db2cc94e4cbf67aed4" ON "QD3176_XML6S" ("MA_THE_BHYT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f53c284146e6c1dd3b66d0b9b2" ON "QD3176_XML6S" ("SO_CCCD")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c3dcbc9b2f4b786a11505ddf33" ON "QD3176_XML6S" ("NGAY_SINH")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_14f8e96ae1f54adab47311f3ee" ON "QD3176_XML6S" ("MA_PHAC_DO_DIEU_TRI_BD")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7029890dcee018fadc064ed0a0" ON "QD3176_XML6S" ("MA_BAC_PHAC_DO_BD")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f3d57468c5a05b5a61f6519634" ON "QD3176_XML6S" ("MA_LYDO_DTRI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f3f8413237daf1c8d06b6fd489" ON "QD3176_XML6S" ("MA_LYDO_XNTL_VR")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_91c56fe028aae17dd3a565f03e" ON "QD3176_XML6S" ("MA_LOAI_BN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ab4b498c2e446b799020941dfd" ON "QD3176_XML6S" ("MA_TINH_TRANG_DK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_85de3012fa8b9836dec84a15ec" ON "QD3176_XML6S" ("MA_KQ_XN_PCR")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_af54a04df6bd696973e8e052a8" ON "QD3176_XML6S" ("MA_XU_TRI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_645c3e3b9096dad4accec094b1" ON "QD3176_XML6S" ("MA_CSKCB")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML7S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "SO_LUU_TRU" varchar2(200),
                "MA_YTE" varchar2(200),
                "MA_KHOA_RV" varchar2(200),
                "NGAY_VAO" varchar2(12),
                "NGAY_RA" varchar2(12),
                "MA_DINH_CHI_THAI" number,
                "NGUYENNHAN_DINHCHI" varchar2(255),
                "THOIGIAN_DINHCHI" varchar2(12),
                "TUOI_THAI" number,
                "CHAN_DOAN_RV" varchar2(1500),
                "PP_DIEUTRI" varchar2(255),
                "GHI_CHU" varchar2(1500),
                "MA_TTDV" varchar2(255),
                "MA_BS" varchar2(255),
                "TEN_BS" varchar2(255),
                "NGAY_CT" varchar2(12),
                "MA_CHA" varchar2(10),
                "MA_ME" varchar2(10),
                "MA_THE_TAM" varchar2(15),
                "HO_TEN_CHA" varchar2(255),
                "HO_TEN_ME" varchar2(255),
                "SO_NGAY_NGHI" number,
                "NGOAITRU_TUNGAY" varchar2(12),
                "NGOAITRU_DENNGAY" varchar2(12),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_a37d776cc9e88bc60008f1569ab" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_edece11183637a5b648a4777ee" ON "QD3176_XML7S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_55cb85f4847037222757cc8f9f" ON "QD3176_XML7S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f52eae65a71ecf14714e0a1dbb" ON "QD3176_XML7S" ("MA_YTE")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9c955e8ff3297b182bb7c2708e" ON "QD3176_XML7S" ("MA_KHOA_RV")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2b25dc2b7c77c7da3c5092a971" ON "QD3176_XML7S" ("NGAY_VAO")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_51347675e3835eec31350ee209" ON "QD3176_XML7S" ("NGAY_RA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4d7dfe3129faabd3fbcfdea65f" ON "QD3176_XML7S" ("MA_TTDV")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f8edc7c8d79a2ef86946b14367" ON "QD3176_XML7S" ("MA_BS")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_72d1e55a237bf3f9b803a34bfe" ON "QD3176_XML7S" ("MA_CHA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_75456ff82fa0e83b05cfcfe9b4" ON "QD3176_XML7S" ("MA_ME")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML8S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "MA_LOAI_KCB" varchar2(2),
                "HO_TEN_CHA" varchar2(255),
                "HO_TEN_ME" varchar2(255),
                "NGUOI_GIAM_HO" varchar2(255),
                "DON_VI" varchar2(1024),
                "NGAY_VAO" varchar2(12),
                "NGAY_RA" varchar2(12),
                "CHAN_DOAN_VAO" varchar2(4000),
                "CHAN_DOAN_RV" varchar2(4000),
                "QT_BENHLY" varchar2(4000),
                "TOMTAT_KQ" varchar2(4000),
                "PP_DIEUTRI" varchar2(4000),
                "NGAY_SINHCON" varchar2(12),
                "NGAY_CONCHET" varchar2(12),
                "SO_CONCHET" number,
                "KET_QUA_DTRI" number,
                "GHI_CHU" varchar2(4000),
                "MA_TTDV" varchar2(255),
                "NGAY_CT" varchar2(12),
                "MA_THE_TAM" varchar2(15),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_9ecd5c49732757782851ae374cc" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_951a7c85668d4ca44015b67232" ON "QD3176_XML8S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c96a97907b1b01ad2dc2faf822" ON "QD3176_XML8S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_03f0c35cd23f08354f4dbe69ad" ON "QD3176_XML8S" ("MA_LOAI_KCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6508296a9bf173b08167a98f24" ON "QD3176_XML8S" ("NGAY_VAO")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a1dbc739ffdb32fc3291ae3cbe" ON "QD3176_XML8S" ("NGAY_RA")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1cc5b21b76e4c975ed5c605939" ON "QD3176_XML8S" ("MA_TTDV")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML9S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "MA_BHXH_NND" varchar2(10),
                "MA_THE_NND" varchar2(15),
                "HO_TEN_NND" varchar2(255),
                "NGAYSINH_NND" varchar2(12),
                "MA_DANTOC_NMD" varchar2(2),
                "SO_CCCD_NND" varchar2(20),
                "NGAYCAP_CCCD_NND" varchar2(12),
                "NOICAP_CCCD_NND" varchar2(1024),
                "NOI_CU_TRU_NND" varchar2(1024),
                "MA_QUOCTICH" varchar2(3),
                "MATINH_CU_TRU" varchar2(3),
                "MAHUYEN_CU_TRU" varchar2(3),
                "MAXA_CU_TRU" varchar2(5),
                "HO_TEN_CHA" varchar2(255),
                "MA_THE_TAM" varchar2(15),
                "HO_TEN_CON" varchar2(255),
                "GIOI_TINH_CON" number,
                "SO_CON" number,
                "LAN_SINH" number,
                "SO_CON_SONG" number,
                "CAN_NANG_CON" number,
                "NGAY_SINH_CON" varchar2(12),
                "NOI_SINH_CON" varchar2(1024),
                "TINH_TRANG_CON" varchar2(4000),
                "SINHCON_PHAUTHUAT" number,
                "SINHCON_DUOI32TUAN" number,
                "GHI_CHU" varchar2(4000),
                "NGUOI_DO_DE" varchar2(255),
                "NGUOI_GHI_PHIEU" varchar2(255),
                "NGAY_CT" varchar2(12),
                "SO" varchar2(200),
                "QUYEN_SO" varchar2(200),
                "MA_TTDV" varchar2(255),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_98cae3f40e626c73427a5d73a5f" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_605ab5caae58652fb0e38835f5" ON "QD3176_XML9S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8006c24479d34c9ef381fe20c0" ON "QD3176_XML9S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fad79e43ff8e32f7ce782662e6" ON "QD3176_XML9S" ("MA_BHXH_NND")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_681b20a19a7e200100968b4982" ON "QD3176_XML9S" ("MA_THE_NND")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML10S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "SO_SERI" varchar2(200),
                "SO_CT" varchar2(200),
                "SO_NGAY" number,
                "DON_VI" varchar2(1024),
                "CHAN_DOAN_RV" varchar2(4000),
                "TU_NGAY" varchar2(12),
                "DEN_NGAY" varchar2(12),
                "MA_TTDV" varchar2(255),
                "TEN_BS" varchar2(255),
                "MA_BS" varchar2(255),
                "NGAY_CT" varchar2(12),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_cfbdf1cd203a8e3e275e9d30787" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0b48e11fc306114367a6831f1c" ON "QD3176_XML10S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d44c6d229e8625877cdd3432ad" ON "QD3176_XML10S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b337c45ffaa9a54d4e799ea5b8" ON "QD3176_XML10S" ("MA_TTDV")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7144640ecb299fb44ac3c52ec7" ON "QD3176_XML10S" ("MA_BS")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML11S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "SO_CT" varchar2(200),
                "SO_SERI" varchar2(200),
                "SO_KCB" varchar2(200),
                "DON_VI" varchar2(1024),
                "MA_BHXH" varchar2(10),
                "MA_THE_BHYT" varchar2(20),
                "CHAN_DOAN_RV" varchar2(4000),
                "PP_DIEUTRI" varchar2(4000),
                "MA_DINH_CHI_THAI" number,
                "NGUYENNHAN_DINHCHI" varchar2(4000),
                "TUOI_THAI" number,
                "SO_NGAY_NGHI" number,
                "TU_NGAY" varchar2(12),
                "DEN_NGAY" varchar2(12),
                "HO_TEN_CHA" varchar2(255),
                "HO_TEN_ME" varchar2(255),
                "MA_TTDV" varchar2(255),
                "MA_BS" varchar2(255),
                "NGAY_CT" varchar2(12),
                "MA_THE_TAM" varchar2(15),
                "MAU_SO" varchar2(5),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_e177c50a42e8a5d001b01244075" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d91aea3f92178485b91ac57df0" ON "QD3176_XML11S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_68178180e1aad3f4109a2bdd9a" ON "QD3176_XML11S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_14e49181acd7e1a08a44bd279f" ON "QD3176_XML11S" ("MA_BHXH")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6721a973c5eaf3e6fc052c17a9" ON "QD3176_XML11S" ("MA_THE_BHYT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_303b1b4ff16bca5d10d15441bd" ON "QD3176_XML11S" ("MA_TTDV")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e5089a0cae1004f4ea166c60db" ON "QD3176_XML11S" ("MA_BS")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML12S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "NGUOI_CHU_TRI" varchar2(255),
                "CHUC_VU" number,
                "NGAY_HOP" varchar2(12),
                "HO_TEN" varchar2(255),
                "NGAY_SINH" varchar2(12),
                "SO_CCCD" varchar2(20),
                "NGAY_CAP_CCCD" varchar2(12),
                "NOI_CAP_CCCD" varchar2(1024),
                "DIA_CHI" varchar2(1024),
                "MATINH_CU_TRU" varchar2(3),
                "MAHUYEN_CU_TRU" varchar2(3),
                "MAXA_CU_TRU" varchar2(5),
                "MA_BHXH" varchar2(10),
                "MA_THE_BHYT" varchar2(15),
                "NGHE_NGHIEP" varchar2(100),
                "DIEN_THOAI" varchar2(15),
                "MA_DOI_TUONG" varchar2(20),
                "KHAM_GIAM_DINH" number,
                "SO_BIEN_BAN" varchar2(200),
                "TYLE_TTCT_CU" number,
                "DANG_HUONG_CHE_DO" varchar2(10),
                "NGAY_CHUNG_TU" varchar2(12),
                "SO_GIAY_GIOI_THIEU" varchar2(200),
                "NGAY_DE_NGHI" varchar2(12),
                "MA_DONVI" varchar2(200),
                "GIOI_THIEU_CUA" varchar2(1024),
                "KET_QUA_KHAM" varchar2(4000),
                "SO_VAN_BAN_CAN_CU" varchar2(200),
                "TYLE_TTCT_MOI" number,
                "TONG_TYLE_TTCT" number,
                "DANG_KHUYETTAT" number,
                "MUC_DO_KHUYETTAT" number,
                "DE_NGHI" varchar2(4000),
                "DUOC_XACDINH" varchar2(4000),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_f51c23c414b3a41f6a5ac369d2e" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0cf50f402c03ad8a7082819163" ON "QD3176_XML12S" ("MA_BHXH")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_070bcf225fab2983bf9ebd583b" ON "QD3176_XML12S" ("MA_THE_BHYT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ea3bc1d47457a1475eb41d7fc7" ON "QD3176_XML12S" ("MA_DOI_TUONG")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_205e36504c5e6ee2de87a05bda" ON "QD3176_XML12S" ("MA_DONVI")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML13S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "SO_HOSO" varchar2(50),
                "SO_CHUYENTUYEN" varchar2(50),
                "GIAY_CHUYEN_TUYEN" varchar2(50),
                "MA_CSKCB" varchar2(5),
                "MA_CSKCB_DI" varchar2(100),
                "MA_CSKCB_DEN" varchar2(5),
                "HO_TEN" varchar2(255),
                "NGAY_SINH" varchar2(12),
                "GIOI_TINH" number,
                "MA_QUOCTICH" varchar2(3),
                "MA_DANTOC" varchar2(2),
                "MA_NGHE_NGHIEP" varchar2(5),
                "DIA_CHI" varchar2(1024),
                "MA_THE_BHYT" varchar2(255),
                "GT_THE_DEN" varchar2(255),
                "NGAY_VAO" varchar2(100),
                "NGAY_VAO_NOI_TRU" varchar2(12),
                "NGAY_RA" varchar2(100),
                "DAU_HIEU_LS" varchar2(4000),
                "CHAN_DOAN_RV" varchar2(4000),
                "QT_BENHLY" varchar2(4000),
                "TOMTAT_KQ" varchar2(4000),
                "PP_DIEUTRI" varchar2(4000),
                "MA_BENH_CHINH" varchar2(100),
                "MA_BENH_KT" varchar2(100),
                "MA_BENH_YHCT" varchar2(255),
                "TEN_DICH_VU" varchar2(4000),
                "TEN_THUOC" varchar2(4000),
                "TINH_TRANG_CT" varchar2(4000),
                "MA_LOAI_RV" number,
                "MA_LYDO_CT" number,
                "HUONG_DIEU_TRI" varchar2(4000),
                "PHUONGTIEN_VC" varchar2(255),
                "HOTEN_NGUOI_HT" varchar2(255),
                "CHUCDANH_NGUOI_HT" varchar2(255),
                "MA_BACSI" varchar2(255),
                "MA_TTDV" varchar2(255),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_e298025e3416230a744079b65b8" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_51b13de099e7246eeadf6b0b50" ON "QD3176_XML13S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3f802e6f82180fa8b9fed61827" ON "QD3176_XML13S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7cc280104854170ab984c44045" ON "QD3176_XML13S" ("MA_CSKCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3b8571f2b7095be8d40459e8af" ON "QD3176_XML13S" ("MA_CSKCB_DI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb38ebe0a62b8726a73585531a" ON "QD3176_XML13S" ("MA_CSKCB_DEN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_aa53558939a1232c85108514dc" ON "QD3176_XML13S" ("MA_THE_BHYT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b28078171f695e870c898b8440" ON "QD3176_XML13S" ("MA_BENH_CHINH")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9870c56e94e4ba4bc6b8a60e42" ON "QD3176_XML13S" ("MA_LOAI_RV")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bc5ae2cf209b90996aafea08b7" ON "QD3176_XML13S" ("MA_LYDO_CT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_80c92cac3222bc82138c849b33" ON "QD3176_XML13S" ("MA_BACSI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e52fdb4337fb497ef57d078258" ON "QD3176_XML13S" ("MA_TTDV")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML14S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "SO_GIAYHEN_KL" varchar2(50),
                "MA_CSKCB" varchar2(5),
                "HO_TEN" varchar2(255),
                "NGAY_SINH" varchar2(12),
                "GIOI_TINH" number,
                "DIA_CHI" varchar2(1024),
                "MA_THE_BHYT" varchar2(255),
                "GT_THE_DEN" varchar2(255),
                "NGAY_VAO" varchar2(12),
                "NGAY_VAO_NOI_TRU" varchar2(12),
                "NGAY_RA" varchar2(12),
                "NGAY_HEN_KL" varchar2(12),
                "CHAN_DOAN_RV" varchar2(4000),
                "MA_BENH_CHINH" varchar2(100),
                "MA_BENH_KT" varchar2(100),
                "MA_BENH_YHCT" varchar2(255),
                "MA_DOITUONG_KCB" varchar2(4),
                "MA_BACSI" varchar2(255),
                "MA_TTDV" varchar2(255),
                "NGAY_CT" varchar2(12),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_c77d972e659555d1f499d2073e5" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_538b3ff6c05fe50776ca6c62d2" ON "QD3176_XML14S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4343685dad37889b48a019fa5b" ON "QD3176_XML14S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c440e0db45103932878362b7ed" ON "QD3176_XML14S" ("MA_CSKCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_da46a6e1dbe9db2685c6d14d64" ON "QD3176_XML14S" ("MA_THE_BHYT")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_95f2d8460b142979d4adab81ef" ON "QD3176_XML14S" ("MA_BENH_CHINH")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_01cc2186f52619f70ee83a31e7" ON "QD3176_XML14S" ("MA_DOITUONG_KCB")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_528ae9e6d7e993993c728acbd9" ON "QD3176_XML14S" ("MA_BACSI")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_dddac1f8bb6d41bd3b698dd53c" ON "QD3176_XML14S" ("MA_TTDV")
        `);
        await queryRunner.query(`
            CREATE TABLE "QD3176_XML15S" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "XML1_ID" varchar2(36) NOT NULL,
                "MA_LK" varchar2(100) NOT NULL,
                "STT" number NOT NULL,
                "MA_BN" varchar2(100),
                "HO_TEN" varchar2(255),
                "SO_CCCD" varchar2(255),
                "PHANLOAI_LAO_VITRI" number,
                "PHANLOAI_LAO_TS" number,
                "PHANLOAI_LAO_HIV" number,
                "PHANLOAI_LAO_VK" number,
                "PHANLOAI_LAO_KT" number,
                "LOAI_DTRI_LAO" number,
                "NGAYBD_DTRI_LAO" varchar2(12),
                "PHACDO_DTRI_LAO" number,
                "NGAYKT_DTRI_LAO" varchar2(12),
                "KET_QUA_DTRI_LAO" number,
                "MA_CSKCB" varchar2(5),
                "NGAYKD_HIV" varchar2(12),
                "BDDT_ARV" varchar2(12),
                "NGAY_BAT_DAU_DT_CTX" varchar2(12),
                "DU_PHONG" varchar2(4000),
                CONSTRAINT "PK_a2b54f0a2e168d94712258ea304" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0808c75ad10305f91c227a8993" ON "QD3176_XML15S" ("XML1_ID")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_36995777f8ee93d783909b67f1" ON "QD3176_XML15S" ("MA_LK")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d6ec15c5a36fcf6aa430739945" ON "QD3176_XML15S" ("MA_BN")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7e78620eba37add5deb09689db" ON "QD3176_XML15S" ("SO_CCCD")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8d7f4a3c6518d8810a50603ff3" ON "QD3176_XML15S" ("MA_CSKCB")
        `);
        await queryRunner.query(`
            CREATE TABLE "USERS" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "USERNAME" varchar2(255) NOT NULL,
                "EMAIL" varchar2(255),
                "PASSWORD" varchar2(255) NOT NULL,
                "IS_LOCK" number DEFAULT 0 NOT NULL,
                "LAST_LOGIN_AT" timestamp,
                "LAST_LOGIN_IP" varchar2(255),
                "LAST_LOGIN_USER_AGENT" varchar2(255),
                "FULL_NAME" varchar2(255),
                CONSTRAINT "PK_475d4b511309ada89807bc2d40b" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_USERS_USERNAME" ON "USERS" ("USERNAME")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_USERS_EMAIL" ON "USERS" ("EMAIL")
        `);
        await queryRunner.query(`
            CREATE TABLE "ROLE_USER" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "ROLE_ID" varchar2(36) NOT NULL,
                "USER_ID" number NOT NULL,
                CONSTRAINT "PK_53038c3e74dc882dda08bfd9489" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a5576d3ebda9444e483160ed99" ON "ROLE_USER" ("ROLE_ID", "USER_ID")
        `);
        await queryRunner.query(`
            CREATE TABLE "PERMISSIONS" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "NAME" varchar2(255) NOT NULL,
                "DISPLAY_NAME" varchar2(255) NOT NULL,
                "DESCRIPTION" varchar2(1000) NOT NULL,
                "TYPE" varchar2(20) NOT NULL,
                CONSTRAINT "UQ_a78b0624793e39af2ca4b9b7bb7" UNIQUE ("NAME"),
                CONSTRAINT "PK_a5de3df71048d01f77e76ddbb20" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3da2e7c4fd436e890083bf07d5" ON "PERMISSIONS" ("TYPE")
        `);
        await queryRunner.query(`
            CREATE TABLE "PERMISSION_USER" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "PERMISSION_ID" varchar2(36) NOT NULL,
                "USER_ID" number NOT NULL,
                CONSTRAINT "PK_286b39e36cac0279353349ce82f" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cc07b57f788f46584b9e84c9c" ON "PERMISSION_USER" ("PERMISSION_ID", "USER_ID")
        `);
        await queryRunner.query(`
            CREATE TABLE "ROLES" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "NAME" varchar2(255) NOT NULL,
                "DISPLAY_NAME" varchar2(255) NOT NULL,
                "DESCRIPTION" varchar2(1000) NOT NULL,
                CONSTRAINT "UQ_8b12cc1b93574dbc69bbc94a04d" UNIQUE ("NAME"),
                CONSTRAINT "PK_f092c5578a07b0209568cb06d16" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "PERMISSION_ROLE" (
                "ID" varchar2(36),
                "CREATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "UPDATED_AT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "CREATED_BY" varchar2(255),
                "UPDATED_BY" varchar2(255),
                "VERSION" number NOT NULL,
                "IS_ACTIVE" number DEFAULT 1 NOT NULL,
                "IS_DELETE" number DEFAULT 0 NOT NULL,
                "PERMISSION_ID" varchar2(36) NOT NULL,
                "ROLE_ID" varchar2(36) NOT NULL,
                CONSTRAINT "PK_0832207d11c0072c5bd060bdd2f" PRIMARY KEY ("ID")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0569f804da096a1d86af8bd166" ON "PERMISSION_ROLE" ("PERMISSION_ID", "ROLE_ID")
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_USER"
            ADD CONSTRAINT "FK_bd5250898275f29b85d486095e0" FOREIGN KEY ("PERMISSION_ID") REFERENCES "PERMISSIONS" ("ID")
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_ROLE"
            ADD CONSTRAINT "FK_e880d461546b2bad0d6826e687d" FOREIGN KEY ("PERMISSION_ID") REFERENCES "PERMISSIONS" ("ID")
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_ROLE"
            ADD CONSTRAINT "FK_92507aa7f114db6d501d24aabd0" FOREIGN KEY ("ROLE_ID") REFERENCES "ROLES" ("ID")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_ROLE" DROP CONSTRAINT "FK_92507aa7f114db6d501d24aabd0"
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_ROLE" DROP CONSTRAINT "FK_e880d461546b2bad0d6826e687d"
        `);
        await queryRunner.query(`
            ALTER TABLE "PERMISSION_USER" DROP CONSTRAINT "FK_bd5250898275f29b85d486095e0"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0569f804da096a1d86af8bd166"
        `);
        await queryRunner.query(`
            DROP TABLE "PERMISSION_ROLE"
        `);
        await queryRunner.query(`
            DROP TABLE "ROLES"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2cc07b57f788f46584b9e84c9c"
        `);
        await queryRunner.query(`
            DROP TABLE "PERMISSION_USER"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_3da2e7c4fd436e890083bf07d5"
        `);
        await queryRunner.query(`
            DROP TABLE "PERMISSIONS"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a5576d3ebda9444e483160ed99"
        `);
        await queryRunner.query(`
            DROP TABLE "ROLE_USER"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_USERS_EMAIL"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_USERS_USERNAME"
        `);
        await queryRunner.query(`
            DROP TABLE "USERS"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_8d7f4a3c6518d8810a50603ff3"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_7e78620eba37add5deb09689db"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_d6ec15c5a36fcf6aa430739945"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_36995777f8ee93d783909b67f1"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0808c75ad10305f91c227a8993"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML15S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_dddac1f8bb6d41bd3b698dd53c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_528ae9e6d7e993993c728acbd9"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_01cc2186f52619f70ee83a31e7"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_95f2d8460b142979d4adab81ef"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_da46a6e1dbe9db2685c6d14d64"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_c440e0db45103932878362b7ed"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_4343685dad37889b48a019fa5b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_538b3ff6c05fe50776ca6c62d2"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML14S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e52fdb4337fb497ef57d078258"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_80c92cac3222bc82138c849b33"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bc5ae2cf209b90996aafea08b7"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9870c56e94e4ba4bc6b8a60e42"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b28078171f695e870c898b8440"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_aa53558939a1232c85108514dc"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_eb38ebe0a62b8726a73585531a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_3b8571f2b7095be8d40459e8af"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_7cc280104854170ab984c44045"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_3f802e6f82180fa8b9fed61827"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_51b13de099e7246eeadf6b0b50"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML13S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_205e36504c5e6ee2de87a05bda"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_ea3bc1d47457a1475eb41d7fc7"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_070bcf225fab2983bf9ebd583b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0cf50f402c03ad8a7082819163"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML12S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e5089a0cae1004f4ea166c60db"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_303b1b4ff16bca5d10d15441bd"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_6721a973c5eaf3e6fc052c17a9"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_14e49181acd7e1a08a44bd279f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_68178180e1aad3f4109a2bdd9a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_d91aea3f92178485b91ac57df0"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML11S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_7144640ecb299fb44ac3c52ec7"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b337c45ffaa9a54d4e799ea5b8"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_d44c6d229e8625877cdd3432ad"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0b48e11fc306114367a6831f1c"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML10S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_681b20a19a7e200100968b4982"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_fad79e43ff8e32f7ce782662e6"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_8006c24479d34c9ef381fe20c0"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_605ab5caae58652fb0e38835f5"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML9S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_1cc5b21b76e4c975ed5c605939"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a1dbc739ffdb32fc3291ae3cbe"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_6508296a9bf173b08167a98f24"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_03f0c35cd23f08354f4dbe69ad"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_c96a97907b1b01ad2dc2faf822"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_951a7c85668d4ca44015b67232"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML8S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_75456ff82fa0e83b05cfcfe9b4"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_72d1e55a237bf3f9b803a34bfe"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f8edc7c8d79a2ef86946b14367"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_4d7dfe3129faabd3fbcfdea65f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_51347675e3835eec31350ee209"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2b25dc2b7c77c7da3c5092a971"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9c955e8ff3297b182bb7c2708e"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f52eae65a71ecf14714e0a1dbb"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_55cb85f4847037222757cc8f9f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_edece11183637a5b648a4777ee"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML7S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_645c3e3b9096dad4accec094b1"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_af54a04df6bd696973e8e052a8"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_85de3012fa8b9836dec84a15ec"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_ab4b498c2e446b799020941dfd"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_91c56fe028aae17dd3a565f03e"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f3f8413237daf1c8d06b6fd489"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f3d57468c5a05b5a61f6519634"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_7029890dcee018fadc064ed0a0"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_14f8e96ae1f54adab47311f3ee"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_c3dcbc9b2f4b786a11505ddf33"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f53c284146e6c1dd3b66d0b9b2"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_4e1a0461db2cc94e4cbf67aed4"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bc043b0671a30973b855e729db"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_86f24f7dfe0643fb91a0505b1a"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML6S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_36d0f4b2ed358e4d65baea0fbc"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b39023c745a0cccff4159c8a96"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_abe7adc7b10e1e5814aa568f74"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_69b45fd92ebeb9c97189d3374b"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML5S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_48943530634a04abab8a9d4043"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_83a036a13fef9d20c462a5d387"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_fb5457964b8097a70df03c3633"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_4ee620e0ecd5126a281b886d37"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9a7b01e96e3f4a1a8399ea652d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2058ae8ba9c3358baf329bec3d"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML4S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_1c778477cb573dededa3cc0063"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_88017e573b999c348e15646225"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a434b105ee8c74050f5bd510cb"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_858a71062376bce007e6f9d63d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_1f19ce8ce46f13a31051a5f70f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_11fd62c681139103db40ff2f67"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_68ad4cbb6c5a437e89c52c7b8b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_81a595a03c55f6a816938bd122"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_d29bc69ff0d7d6956b87557280"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_7a513e07ab432e36e5f234989c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_136e9ca7c74b9ab1fee45fc3cd"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_24b3b0e81eb9e23d8e20466854"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9da01a427bac7916f67539a4ba"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f387aa8d3a8a00497c59eeb798"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_20c0ae86f471f92b433a89d80a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2caa4cbfcc10082eaedd5209b4"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f06793424e3576f4f5ce849d2a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_c70b62ced350443cdf9f602d94"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_fc12d1d4243507df9c6985444f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f9445f5908db343e8ba8ed9101"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML3S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_833110281ccf31639a7dcde74e"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f6077f8087aeab9203965bc232"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_ef38e28e8d83889cc0e87a5d35"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f0e0604ebc82b41726b55eb264"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_420b527a2f010a894064927287"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bca658f94f8fbdfbe10f65d19a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_1b556b07af53c5db3670410145"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_cfc1e1ef926c3357a5d9ddc11b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e7a2b2226668fcd9dac22fd1da"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_ca2124cb67f4f9da0547590529"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_10488519cbfb76f9ef2f087c95"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e6aa4aad11f03c26d52de1ad0a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_ea17dd8254e2d24b46fbdcd07e"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML2S"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a97762693a129f3b7e53f0c4e9"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b2ac166948f891437e24b433b8"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_7549f960ca44c45e4c15546885"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bc48fcef6ecead9f1779a983de"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9fdac205fe9779beed1dead145"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_88e0e16cf047e3a24228a25283"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_4d86a2ed2e96d47752283cd2d3"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_d61f229d524fbeb00f252d650c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_f3fc2437b644fde22d752f18f9"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0718646467b4b902e79679cf9d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_478f5544c98accee0d8ba810e3"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2044cd6f4097f7ee6a1579ee4c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e6bc4e55a0293ba27e92e7b175"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_c06c040ff7ba5a40c2b2150952"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a8471873d3d92e177f00cb7c0f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_96147e89762ec48726b929f53f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_81deb2da3f471aa8c97e9eba0d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_92619ccc7254c4abec41261f5e"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_fd16f51c651c944675b19a2d06"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_500793387370303a2d61e1e624"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2df4c85b3b25477930961079d6"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_092ec8799b37323c5b16068b8a"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0c66774c07f855720a278fa669"
        `);
        await queryRunner.query(`
            DROP TABLE "QD3176_XML1S"
        `);
    }

}
