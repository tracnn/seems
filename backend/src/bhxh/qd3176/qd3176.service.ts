import { Injectable } from '@nestjs/common';
import { CreateQd3176Dto } from './dto/create-qd3176.dto';
import { UpdateQd3176Dto } from './dto/update-qd3176.dto';
import { XmlImportService } from './services/xml-import.service';
import { QueryBus } from '@nestjs/cqrs';
import { GetXml1sByKeywordQuery } from './queries/get-xml1s-by-keyword.query';
import { GetXml1sByKeywordDto } from './dto/get-xml1s-by-keyword.dto';
import { GetXml2sByXml1IdDto } from './dto/get-xml2s-by-xml1-id.dto';
import { GetXml2sByXml1IdQuery } from './queries/get-xml2s-by-xml1-id.query';
import { GetXml3sByXml1IdDto } from './dto/get-xml3s-by-xml1-id.dto';
import { GetXml3sByXml1IdQuery } from './queries/get-xml3s-by-xml1-id.query';
import { GetXml4sByXml1IdDto } from './dto/get-xml4s-by-xml1-id.dto';
import { GetXml4sByXml1IdQuery } from './queries/get-xml4s-by-xml1-id.query';
import { SearchMedicalRecordDto } from './dto/search-medical-record.dto';
import { GetMedicalRecordDetailDto } from './dto/get-medical-record-detail.dto';

@Injectable()
export class Qd3176Service {
  constructor(private readonly xmlImportService: XmlImportService,
    private readonly queryBus: QueryBus
  ) {}

  async searchMedicalRecord(searchDto: SearchMedicalRecordDto) {
    try {
      const items = searchDto.keyword.split(';').map(item => item.trim()).filter(item => item.length > 0);

      const xml1s = await this.queryBus.execute(
        new GetXml1sByKeywordQuery({ keyword: items.join(';') })
      );

      if (!xml1s || xml1s.length === 0) {
        return {
          status: 'success',
          data: {
            benhNhans: [],
            hosos: []
          },
          message: 'Không tìm thấy dữ liệu'
        };
      }

      const benhNhans = xml1s.map((xml1: any) => ({
        hoTen: xml1.hoTen || '',
        ngaySinh: this.formatDob(xml1.ngaySinh) || '',
        gioiTinh: xml1.gioiTinh === 1 ? 'Nam' : xml1.gioiTinh === 2 ? 'Nữ' : '',
        soCccd: xml1.soCccd || '',
        dienThoai: xml1.dienThoai || '',
        maTheBhyt: xml1.maTheBhyt || '',
        diaChi: xml1.diaChi || ''
      }));

      // Chuyển đổi XML1 thành danh sách hồ sơ
      const hosos = xml1s.map((xml1: any, index: number) => ({
        id: xml1.id || index.toString(),
        ngayVao: this.formatDatetime(xml1.ngayVao) || '',
        ngayRa: this.formatDatetime(xml1.ngayRa) || '',
        chanDoanRv: xml1.chanDoanRv || ''
      }));
      return {
        status: 'success',
        data: {
          benhNhans,
          hosos
        },
        message: 'Tìm kiếm thành công'
      };
    } catch (error) {
      return {
        status: 'error',
        data: null,
        message: 'Lỗi khi tìm kiếm: ' + error.message
      };
    }
  }

  async getMedicalRecordDetail(params: GetMedicalRecordDetailDto) {
    try {
      const xml1Id = params.id;
  
      const [xml2s, xml3s, xml4s] = await Promise.all([
        this.queryBus.execute(new GetXml2sByXml1IdQuery({ xml1Id })),
        this.queryBus.execute(new GetXml3sByXml1IdQuery({ xml1Id })),
        this.queryBus.execute(new GetXml4sByXml1IdQuery({ xml1Id }))
      ]);
  
      // Gom CLS theo maDichVu
      const clsGrouped = xml4s
        .filter((item: any) => !!item.giaTri || !!item.ketLuan)
        .reduce((acc: any, item: any) => {
          const maDichVu = item.maDichVu || null;
          if (maDichVu) {
            if (!acc[maDichVu]) acc[maDichVu] = [];
            acc[maDichVu].push({
              maChiSo: item.maChiSo || '',
              tenChiSo: item.tenChiSo || '',
              giaTri: item.giaTri || '',
              donViDo: item.donViDo || '',
              ketLuan: item.ketLuan || '',
              ngayKq: item.ngayKq || ''
            });
          }
          return acc;
        }, {});
  
      // Gắn CLS vào DVKT
      const dvktWithCls = xml3s.map((item: any) => {
        const maDichVu = item.maDichVu || null;
        return {
          ...item,
          canLamSang: maDichVu && clsGrouped[maDichVu] ? clsGrouped[maDichVu] : []
        };
      });
  
      // Nhóm DVKT theo mã nhóm
      const dvktGrouped = dvktWithCls.reduce((acc: any, item: any) => {
        const maNhom = item.maNhom || 'unknown';
        if (!acc[maNhom]) acc[maNhom] = [];
        acc[maNhom].push(item);
        return acc;
      }, {});
  
      // Tạo HTML cho chi tiết
      let detailHtml = '';
  
      // Thông tin DVKT
      if (Object.keys(dvktGrouped).length > 0) {
        detailHtml += `
          <h6 class="mt-4">
            <span class="toggle-cls-all text-primary" data-target="cls-wrapper" style="cursor:pointer">[+]</span>
            Thông tin DVKT
          </h6>
          <div id="cls-wrapper" style="display: none; margin-left: 1rem;">
        `;
  
        Object.entries(dvktGrouped).forEach(([maNhom, group]: [string, any[]]) => {
          const nhomId = 'cls-nhom-' + maNhom.replace(/[^A-Za-z0-9]/g, '_');
  
          detailHtml += `
            <div class="mb-2">
              <span class="toggle-cls-nhom text-primary" data-nhom="${nhomId}" style="cursor:pointer">[+]</span>
              Nhóm: ${this.getNhomName(maNhom)}
            </div>
            <div id="${nhomId}" class="cls-nhom-table mb-4" style="display: none;">
              <div class="table-responsive">
                <table class="table table-bordered table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>STT</th>
                      <th></th>
                      <th>Tên dịch vụ</th>
                      <th>Đơn vị tính</th>
                      <th>Số lượng</th>
                      <th>Khoa thực hiện</th>
                      <th>Ngày chỉ định</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
          `;
  
          const groupedByMaDichVu = group.reduce((acc: any, item: any) => {
            const maDichVu = item.maDichVu || '';
            if (!acc[maDichVu]) acc[maDichVu] = [];
            acc[maDichVu].push(item);
            return acc;
          }, {});
  
          let stt = 1;
          Object.entries(groupedByMaDichVu).forEach(([maDichVu, dvktList]: [string, any[]]) => {
            const clsId = 'cls-group-' + maDichVu.replace(/[^A-Za-z0-9]/g, '_');
            const dvkt = dvktList[0];
  
            detailHtml += `
              <tr>
                <td>${stt++}</td>
                <td>
                  <span class="toggle-cls text-primary" data-dv="${clsId}" style="cursor:pointer">[+]</span>
                </td>
                <td>${dvkt.tenDichVu || dvkt.tenVatTu || ''}</td>
                <td>${dvkt.donViTinh || ''}</td>
                <td>${dvkt.soLuong || 0}</td>
                <td>${dvkt.maKhoa || ''}</td>
                <td>${this.formatDatetime(dvkt.ngayYl) || ''}</td>
                <td>
                  ${dvkt.canLamSang.length > 0 ? '<span class="text-info">Có kết quả</span>' : '<span class="text-muted">---</span>'}
                </td>
              </tr>
              <tr id="${clsId}" class="cls-group-table" style="display: none;">
                <td colspan="7" class="bg-light">
                  ${dvkt.canLamSang.length > 0 ? `
                    <div>
                      <div class="table-responsive">
                        <table class="table table-bordered table-sm mb-0">
                          <thead class="table-light">
                            <tr>
                              <th>#</th>
                              <th>Mã chỉ số</th>
                              <th>Tên chỉ số</th>
                              <th>Giá trị</th>
                              <th>Đơn vị</th>
                              <th>Kết luận</th>
                              <th>Ngày kết quả</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${dvkt.canLamSang.map((cls: any, index: number) => `
                              <tr>
                                <td>${index + 1}</td>
                                <td>${cls.maChiSo || ''}</td>
                                <td>${cls.tenChiSo || ''}</td>
                                <td>${cls.giaTri || ''}</td>
                                <td>${cls.donViDo || ''}</td>
                                <td>${cls.ketLuan || '-'}</td>
                                <td>${this.formatDatetime(cls.ngayKq) || ''}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ` : '<div class="text-muted">Không có dữ liệu.</div>'}
                </td>
              </tr>
            `;
          });
  
          detailHtml += `
                  </tbody>
                </table>
              </div>
            </div>
          `;
        });
  
        detailHtml += '</div>';
      } else {
        detailHtml += '<div class="text-muted">Không có dữ liệu dịch vụ kỹ thuật.</div>';
      }
  
      // Thông tin thuốc
      if (xml2s && xml2s.length > 0) {
        detailHtml += `
          <h6 class="mt-4">
            <span class="toggle-thuoc text-primary" data-target="thuoc-table" style="cursor:pointer">[+]</span>
            Thông tin thuốc
          </h6>
          <div id="thuoc-table" class="table-responsive" style="display: none;">
            <table class="table table-bordered table-sm">
              <thead class="table-light">
                <tr>
                  <th>STT</th>
                  <th>Tên thuốc</th>
                  <th>Hàm lượng</th>
                  <th>Đơn vị</th>
                  <th>Liều dùng</th>
                  <th>Số lượng</th>
                  <th>Ngày YL</th>
                </tr>
              </thead>
              <tbody>
        `;
  
        (xml2s as any[]).forEach((xml2: any, index: number) => {
          detailHtml += `
            <tr>
              <td>${index + 1}</td>
              <td>${xml2.tenThuoc || ''}</td>
              <td>${xml2.hamLuong || ''}</td>
              <td>${xml2.donViTinh || ''}</td>
              <td>${xml2.lieuDung || ''}</td>
              <td>${xml2.soLuong || 0}</td>
              <td>${this.formatDatetime(xml2.ngayYl) || ''}</td>
            </tr>
          `;
        });
  
        detailHtml += `
              </tbody>
            </table>
          </div>
        `;
      } else {
        detailHtml += '<div class="text-muted">Không có dữ liệu thuốc.</div>';
      }
  
      // Thêm JavaScript cho toggle
      detailHtml += `
        <script>
          $(function () {
            $(document).on('click', '.toggle-cls-all', function () {
              const targetId = $(this).data('target');
              const target = $('#' + targetId);
              const btn = $(this);
              target.toggle();
              btn.text(target.is(':visible') ? '[–]' : '[+]');
            });
  
            $(document).on('click', '.toggle-cls-nhom', function () {
              const nhomId = $(this).data('nhom');
              const target = $('#' + nhomId);
              const btn = $(this);
              target.toggle();
              btn.text(target.is(':visible') ? '[–]' : '[+]');
            });
  
            $(document).on('click', '.toggle-cls', function () {
              const maDv = $(this).data('dv');
              const target = $('#' + maDv);
              const btn = $(this);
              target.toggle();
              btn.text(target.is(':visible') ? '[–]' : '[+]');
            });
  
            $(document).on('click', '.toggle-thuoc', function () {
              const targetId = $(this).data('target');
              const target = $('#' + targetId);
              const btn = $(this);
              target.toggle();
              btn.text(target.is(':visible') ? '[–]' : '[+]');
            });
          });
        </script>
      `;
  
      return {
        status: 'success',
        data: detailHtml,
        message: 'Lấy chi tiết thành công'
      };
    } catch (error) {
      return {
        status: 'error',
        data: null,
        message: 'Lỗi khi lấy chi tiết: ' + error.message
      };
    }
  }

  private formatDob(ngaySinh: string): string {
    if (!ngaySinh || ngaySinh.length < 8) return '';
  
    const year = ngaySinh.substring(0, 4);
    const month = ngaySinh.substring(4, 6);
    const day = ngaySinh.substring(6, 8);
  
    if (month !== '00' && day !== '00') {
      return `${day}/${month}/${year}`;
    } else {
      return year;
    }
  }

  private formatDatetime(datetime: string): string {
    if (!datetime || datetime.length < 8) return '';
  
    const year = datetime.substring(0, 4);
    const month = datetime.substring(4, 6);
    const day = datetime.substring(6, 8);
    const hour = datetime.substring(8, 10);
    const minute = datetime.substring(10, 12);
  
    if (month !== '00' && day !== '00') {
      return `${day}/${month}/${year} ${hour}:${minute}`;
    } else {
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
  }

  private getNhomName(maNhom: string): string {
    const nhomMap: { [key: string]: string } = {
      1: 'Xét nghiệm',
      2: 'Chẩn đoán hình ảnh',
      3: 'Thăm dò chức năng',
      4: 'Thuốc trong danh mục',
      5: 'Thuốc ngoài danh mục',
      6: 'Thuốc tỷ lệ',
      7: 'Máu',
      8: 'Phẫu thuật',
      9: 'Dịch vụ kỹ thuật tỷ lệ',
      10: 'VTYT trong danh mục',
      11: 'VTYT ngoài danh mục',
      12: 'Vận chuyển',
      13: 'Khám',
      14: 'Giường ban ngày',
      15: 'Giường nội trú',
      16: 'Giường lưu',
      17: 'Chi phí máu',
      18: 'Thủ thuật',
    };
    return nhomMap[maNhom] || 'Không rõ nhóm';
  }

  create(createQd3176Dto: CreateQd3176Dto) {
    return 'This action adds a new qd3176';
  }

  findAll() {
    return `This action returns all qd3176`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qd3176`;
  }

  update(id: number, updateQd3176Dto: UpdateQd3176Dto) {
    return `This action updates a #${id} qd3176`;
  }

  remove(id: number) {
    return `This action removes a #${id} qd3176`;
  }

  uploadXml(files: Express.Multer.File[], importSessionId: string, userId: string) {
    return this.xmlImportService.processXmlFiles(files, importSessionId, userId);
  }

  getXml1sByKeyword(dto: GetXml1sByKeywordDto) {
    return this.queryBus.execute(new GetXml1sByKeywordQuery(dto));
  }

  getXml2sByXml1Id(dto: GetXml2sByXml1IdDto) {
    return this.queryBus.execute(new GetXml2sByXml1IdQuery(dto));
  }

  getXml3sByXml1Id(dto: GetXml3sByXml1IdDto) {
    return this.queryBus.execute(new GetXml3sByXml1IdQuery(dto));
  }

  getXml4sByXml1Id(dto: GetXml4sByXml1IdDto) {
    return this.queryBus.execute(new GetXml4sByXml1IdQuery(dto));
  }
}
