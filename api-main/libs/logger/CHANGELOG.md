# Changelog - Logger Library

Tất cả thay đổi quan trọng của logger library sẽ được ghi lại ở đây.

## [2.0.0] - 2024-11-15

### ✨ Added - Seq Centralized Logging

#### 🚀 Tính năng mới

- **Seq Transport**: Tích hợp `@datalust/winston-seq` để gửi logs tới Seq server
- **Centralized Logging**: Tập trung logs từ tất cả microservices vào một nơi
- **Real-time Monitoring**: Xem logs real-time từ tất cả services
- **Structured Logging**: Query và filter logs theo bất kỳ field nào
- **Auto Retry**: Tự động retry khi Seq offline, không ảnh hưởng service

#### 📦 Dependencies

- Thêm `@datalust/winston-seq@^2.3.2`

#### ⚙️ Configuration

Thêm biến môi trường mới:
- `SEQ_SERVER_URL`: URL của Seq server (optional)
- `SEQ_API_KEY`: API key cho authentication (optional)

#### 📁 Files thêm mới

- `ENVIRONMENT_VARIABLES.md`: Chi tiết về environment variables
- `SEQ_QUICKSTART.md`: Hướng dẫn nhanh setup Seq trong 5 phút
- `docker-compose.seq.yml`: Docker Compose config cho Seq server
- `CHANGELOG.md`: File này

#### 📝 Files cập nhật

- `winston.config.ts`: 
  - Thêm Seq transport với error handling
  - Thêm `additionalProperties` để phân biệt logs theo service:
    - `Service`: Tên service (auth-service, iam-service, etc.)
    - `Environment`: Môi trường (development, production, test)
    - `Application`: Tên application (qhis-plus-backend)
  - Tạo thư mục logs tự động
  - Cải thiện file format với milliseconds timestamp
  - Tăng maxsize từ 5MB lên 10MB
  - Tăng maxFiles từ 5 lên 10
  - Thêm info.log và warn.log riêng biệt

- `README.md`:
  - Thêm section "Seq Centralized Logging" với hướng dẫn chi tiết
  - Cập nhật cấu hình environment variables
  - Thêm Seq best practices
  - Thêm query examples
  - Cập nhật log files structure

- `INTEGRATION_GUIDE.md`:
  - Thêm section "Seq Centralized Logging Setup"
  - Hướng dẫn Docker & Docker Compose setup
  - Hướng dẫn tạo API key
  - Troubleshooting guide
  - Dashboard & alerts setup

- `package.json`:
  - Thêm `@datalust/winston-seq@^2.3.2` vào dependencies

- `index.ts`:
  - Cập nhật documentation header

#### 🎯 Benefits

1. **Tập trung quản lý logs**: Không cần SSH vào từng server để xem logs
2. **Query mạnh mẽ**: Tìm kiếm logs theo bất kỳ field nào
3. **Real-time**: Xem logs ngay lập tức từ tất cả services
4. **Alerting**: Cảnh báo tự động khi có lỗi nghiêm trọng
5. **Dashboard**: Tạo dashboard trực quan cho monitoring
6. **Production-ready**: Service vẫn chạy bình thường khi Seq offline

#### 📖 Usage Example

```typescript
// Structured logging for Seq
this.logger.log({
  message: 'User logged in',
  userId: user.id,
  email: user.email,
  ip: request.ip,
});
```

**Query trong Seq UI để phân biệt services:**

```sql
-- Logs từ auth-service
Service = 'auth-service'

-- Logs từ iam-service
Service = 'iam-service'

-- So sánh errors giữa services
level = 'error' | count(*) group by Service

-- Logs từ production
Environment = 'production'

-- Logs từ auth-service trong production
Service = 'auth-service' and Environment = 'production'

-- Tìm user cụ thể
userId = '123e4567-e89b-12d3-a456-426614174000'
```

#### 🔧 Configuration Example

```env
# .env
LOG_LEVEL=info
LOG_TO_FILE=true
NODE_ENV=production

# Seq Centralized Logging
SEQ_SERVER_URL=http://localhost:5341
SEQ_API_KEY=your-api-key-here
```

#### 🐳 Docker Setup

```bash
# Quick start
docker run -d -e ACCEPT_EULA=Y -p 5341:80 datalust/seq

# Or use docker-compose
docker-compose -f libs/logger/docker-compose.seq.yml up -d

# Access Seq UI
open http://localhost:5341
```

---

## [1.0.0] - 2024-11-01

### Initial Release

- Winston logger integration
- NestJS support
- Console & File transports
- Log levels: error, warn, info, debug, verbose
- Structured logging support
- Context-aware logging
- HTTP request logging middleware
- Helper methods (logAuth, logRequest, logQuery)
- Auto log rotation (5MB, 5 files)
- Exception & rejection handlers

---

## Migration Guide

### Từ v1.0.0 lên v2.0.0

Không có breaking changes! Chỉ cần:

1. **Install dependencies**:
```bash
npm install
```

2. **Add Seq config (optional)**:
```env
SEQ_SERVER_URL=http://localhost:5341
SEQ_API_KEY=
```

3. **Start Seq (nếu muốn dùng)**:
```bash
docker-compose -f libs/logger/docker-compose.seq.yml up -d
```

4. **That's it!** Service sẽ tự động gửi logs tới Seq nếu có config.

---

## Roadmap

### [2.1.0] - Future

- [ ] Elasticsearch transport option
- [ ] CloudWatch logs integration
- [ ] Log sampling cho high-traffic endpoints
- [ ] Performance metrics logging
- [ ] OpenTelemetry integration
- [ ] Log filtering theo service/environment
- [ ] Custom formatters

### [2.2.0] - Future

- [ ] Log encryption at rest
- [ ] PII data masking
- [ ] Compliance logging (GDPR, HIPAA)
- [ ] Log archiving to S3/Azure Blob
- [ ] Multi-region logging support

---

## Support

Nếu có vấn đề hoặc câu hỏi về Seq integration:
1. Đọc [SEQ_QUICKSTART.md](./SEQ_QUICKSTART.md)
2. Kiểm tra [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. Xem [Seq Documentation](https://docs.datalust.co/docs)
4. Liên hệ team DevOps

