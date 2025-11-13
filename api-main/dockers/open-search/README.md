# OpenSearch Docker Setup

## 📝 Giới Thiệu

Đây là môi trường OpenSearch chạy trên Docker cho dự án BM Patient Hub.

## 🚀 Quick Start

### 1. Cấu hình môi trường

Tạo file `.env`:
```bash
OPENSEARCH_INITIAL_ADMIN_PASSWORD=YourStrongPassword123!
```

**Lưu ý:** Password phải đủ mạnh (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).

### 2. Khởi động

```bash
# Khởi động OpenSearch và Dashboards
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f opensearch

# Kiểm tra trạng thái
docker-compose ps
```

### 3. Kiểm tra kết nối

#### Windows PowerShell
```powershell
cd docker/open-search
.\scripts\test-connection.ps1
```

#### Git Bash / Linux / macOS
```bash
curl -X GET "https://localhost:9200" \
  -u admin:YourStrongPassword123! \
  -k
```

### 4. Truy cập Dashboards

Mở browser và truy cập: `http://localhost:5601`
- Username: `admin`
- Password: `YourStrongPassword123!` (password bạn đã set trong .env)

## 📚 Hướng Dẫn Chi Tiết

Xem hướng dẫn đầy đủ tại: **[OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md)**

Hướng dẫn bao gồm:
- ✅ Các khái niệm cơ bản (Index, Document, Mapping, etc.)
- ✅ CRUD operations
- ✅ Search & Query DSL
- ✅ Aggregations
- ✅ Performance optimization
- ✅ Security & access control
- ✅ Tích hợp với NestJS
- ✅ Best practices

## 🛠️ Scripts Tiện Ích

Chúng tôi cung cấp các scripts PowerShell để bạn thực hành:

### Test Connection
Kiểm tra kết nối và trạng thái cluster:
```powershell
.\scripts\test-connection.ps1
```

### Create Sample Index
Tạo index mẫu với dữ liệu bệnh nhân:
```powershell
.\scripts\create-sample-index.ps1
```

### Run Example Queries
Chạy 15+ query mẫu để học OpenSearch:
```powershell
.\scripts\example-queries.ps1
```

## 🔧 Cấu Hình

### Ports
- **9200**: OpenSearch REST API (HTTPS)
- **9600**: Performance Analyzer
- **5601**: OpenSearch Dashboards (HTTP)

### Data Persistence
Dữ liệu được lưu tại:
- OpenSearch: `./data/opensearch`
- Dashboards: `./data/dashboards`

### Memory
- JVM Heap: 1GB (có thể điều chỉnh trong docker-compose.yml)

## 📊 Monitoring

### Cluster Health
```bash
GET /_cluster/health
```

### Node Stats
```bash
GET /_nodes/stats
```

### Index Stats
```bash
GET /<index-name>/_stats
```

### Cat APIs
```bash
GET /_cat/indices?v
GET /_cat/shards?v
GET /_cat/nodes?v
```

## 🔒 Security

### Default Credentials
- Username: `admin`
- Password: Set trong `.env` file

### Tạo User Mới
```json
PUT /_plugins/_security/api/internalusers/myuser
{
  "password": "StrongPassword123!",
  "opendistro_security_roles": ["my_role"]
}
```

### Best Practices
- ✅ Đổi password admin sau khi setup
- ✅ Tạo separate users cho từng application
- ✅ Sử dụng roles với least privilege
- ✅ Enable HTTPS trong production
- ✅ Không expose port 9200 ra public internet

## 🚨 Troubleshooting

### Container không khởi động
```bash
# Kiểm tra logs
docker-compose logs opensearch

# Kiểm tra disk space
docker system df

# Xóa và tạo lại
docker-compose down -v
docker-compose up -d
```

### Cluster status YELLOW
- Nguyên nhân: Replica shards chưa được allocated (bình thường với single-node cluster)
- Giải pháp: Set `number_of_replicas: 0` hoặc thêm nodes

### Heap memory không đủ
```yaml
# Trong docker-compose.yml, tăng memory
OPENSEARCH_JAVA_OPTS: "-Xms2048m -Xmx2048m"
```

### Connection refused
- Kiểm tra container đang chạy: `docker-compose ps`
- Kiểm tra port đã bind: `netstat -an | findstr 9200`
- Kiểm tra firewall/antivirus

## 📖 Tài Nguyên

### Documentation
- [OpenSearch Official Docs](https://opensearch.org/docs/latest/)
- [Query DSL Reference](https://opensearch.org/docs/latest/query-dsl/)
- [Security Plugin](https://opensearch.org/docs/latest/security/)

### Tools
- OpenSearch Dashboards: `http://localhost:5601`
- Dev Tools Console: Dashboards → Dev Tools

### Community
- [OpenSearch Forum](https://forum.opensearch.org/)
- [GitHub Issues](https://github.com/opensearch-project/OpenSearch/issues)

## 🎯 Next Steps

1. ✅ Đọc hướng dẫn: [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md)
2. ✅ Chạy test connection: `.\scripts\test-connection.ps1`
3. ✅ Tạo sample index: `.\scripts\create-sample-index.ps1`
4. ✅ Thử các queries: `.\scripts\example-queries.ps1`
5. ✅ Khám phá Dashboards: `http://localhost:5601`
6. ✅ Tích hợp vào NestJS app (xem guide section 12)

## 🤝 Contributing

Nếu bạn có ý tưởng cải thiện hoặc phát hiện lỗi, hãy tạo issue hoặc pull request.

## 📄 License

This project is part of BM Patient Hub system.

