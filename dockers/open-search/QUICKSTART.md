# OpenSearch Quick Start (5 phút)

## ⚡ Setup Nhanh

```powershell
# Bước 1: Di chuyển vào thư mục
cd docker/open-search/scripts

# Bước 2: Chạy setup tự động
.\setup.ps1

# Bước 3: Test kết nối
.\test-connection.ps1

# Bước 4: Tạo index mẫu
.\create-sample-index.ps1

# Bước 5: Thử các queries
.\example-queries.ps1
```

## 🎯 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **OpenSearch API** | https://localhost:9200 | admin / (xem file .env) |
| **Dashboards UI** | http://localhost:5601 | admin / (xem file .env) |

## 📖 Tài Liệu

| File | Mô Tả | Khi Nào Dùng |
|------|-------|--------------|
| **README.md** | Tổng quan và quick start | Đọc đầu tiên |
| **OPENSEARCH_MASTER_GUIDE.md** | Hướng dẫn chi tiết 12 chương | Học sâu OpenSearch |
| **CHEATSHEET.md** | Commands thường dùng | Tham khảo nhanh |
| **QUICKSTART.md** | Start trong 5 phút | Bắt đầu ngay |

## 🛠️ Scripts

| Script | Mô Tả |
|--------|-------|
| `setup.ps1` | Tự động setup toàn bộ |
| `test-connection.ps1` | Kiểm tra kết nối |
| `create-sample-index.ps1` | Tạo index demo với 8 patients |
| `example-queries.ps1` | 15+ queries mẫu |

## 🔑 3 Queries Quan Trọng Nhất

### 1. Search toàn văn bản
```json
GET /bm-patients-demo/_search
{
  "query": {
    "multi_match": {
      "query": "Nguyễn",
      "fields": ["full_name", "address"]
    }
  }
}
```

### 2. Filter + Sort + Pagination
```json
GET /bm-patients-demo/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "date_of_birth": {
              "gte": "1985-01-01",
              "lte": "1995-12-31"
            }
          }
        }
      ]
    }
  },
  "sort": [{ "date_of_birth": "desc" }],
  "from": 0,
  "size": 10
}
```

### 3. Aggregation (Thống kê)
```json
GET /bm-patients-demo/_search
{
  "size": 0,
  "aggs": {
    "by_gender": {
      "terms": {
        "field": "gender"
      }
    }
  }
}
```

## 🚀 Tích Hợp NestJS (3 bước)

### Bước 1: Cài đặt package
```bash
npm install @nestjs/elasticsearch @elastic/elasticsearch
```

### Bước 2: Tạo module
```typescript
// opensearch.module.ts
@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'https://localhost:9200',
      auth: { username: 'admin', password: 'your-password' },
      ssl: { rejectUnauthorized: false }
    })
  ],
  exports: [ElasticsearchModule]
})
export class OpenSearchModule {}
```

### Bước 3: Sử dụng trong service
```typescript
@Injectable()
export class PatientSearchService {
  constructor(
    private elasticsearchService: ElasticsearchService
  ) {}

  async search(keyword: string) {
    return this.elasticsearchService.search({
      index: 'patients',
      query: {
        multi_match: {
          query: keyword,
          fields: ['full_name', 'phone', 'email']
        }
      }
    });
  }
}
```

## 💡 Tips

### Xem tất cả indices
```bash
GET /_cat/indices?v
```

### Đếm documents
```bash
GET /bm-patients-demo/_count
```

### Xóa toàn bộ documents (DEV ONLY!)
```bash
POST /bm-patients-demo/_delete_by_query
{
  "query": { "match_all": {} }
}
```

### Test analyzer
```bash
GET /_analyze
{
  "analyzer": "standard",
  "text": "Nguyễn Văn A"
}
```

## 🔧 Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f opensearch

# Status
docker-compose ps

# Restart
docker-compose restart

# Remove all (including data)
docker-compose down -v
```

## 📚 Học Tiếp

1. ✅ **Đọc Master Guide**: Tất cả concepts từ A-Z
   - `OPENSEARCH_MASTER_GUIDE.md`

2. ✅ **Thực hành trên Dashboards**: Visual query builder
   - http://localhost:5601

3. ✅ **Tích hợp vào app**: NestJS integration
   - Xem Section 12 trong Master Guide

4. ✅ **Tối ưu performance**: Best practices
   - Xem Section 8 và 11 trong Master Guide

## 🆘 Troubleshooting

| Vấn Đề | Giải Pháp |
|--------|-----------|
| Container không start | `docker-compose logs opensearch` |
| Connection refused | Đợi 30s, OpenSearch đang khởi động |
| Port 9200 đã dùng | Tắt service khác hoặc đổi port |
| Heap memory không đủ | Tăng trong docker-compose.yml |
| Cluster status YELLOW | Bình thường với single-node |

## 🎓 Khái Niệm Cơ Bản

```
Index       = Database
Document    = Row/Record
Field       = Column
Mapping     = Schema
Shard       = Data partition
Replica     = Backup copy
```

## ⚙️ Cấu Hình Quan Trọng

```yaml
# docker-compose.yml
environment:
  - "OPENSEARCH_JAVA_OPTS=-Xms1024m -Xmx1024m"  # Heap size
  - discovery.type=single-node                   # Single node mode
  - bootstrap.memory_lock=true                   # Lock memory
```

---

**Chúc bạn thành công! 🎉**

*Xem thêm tại: OPENSEARCH_MASTER_GUIDE.md*

