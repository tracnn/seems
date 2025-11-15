# Environment Variables Configuration

File này hướng dẫn các biến môi trường cần thiết cho Logger Library.

## 📋 Danh sách biến môi trường

### LOG_LEVEL

**Mô tả**: Mức độ chi tiết của logs

**Giá trị**: `error` | `warn` | `info` | `debug` | `verbose`

**Mặc định**: `info`

**Khuyến nghị**:
- Production: `info` hoặc `warn`
- Development: `debug` hoặc `verbose`

```env
LOG_LEVEL=info
```

---

### LOG_TO_FILE

**Mô tả**: Bật/tắt ghi logs vào file

**Giá trị**: `true` | `false`

**Mặc định**: `false`

**Khuyến nghị**:
- Production: `true`
- Development: `false` (console only nhanh hơn)

```env
LOG_TO_FILE=true
```

**Log files được tạo**:
```
logs/
└── <service-name>/
    ├── info.log          # Info level logs
    ├── warn.log          # Warning logs
    ├── error.log         # Error logs
    ├── combined.log      # All levels
    ├── exceptions.log    # Uncaught exceptions
    └── rejections.log    # Unhandled promise rejections
```

---

### NODE_ENV

**Mô tả**: Môi trường chạy application

**Giá trị**: `development` | `production` | `test`

**Mặc định**: `development`

**Ảnh hưởng**:
- `production`: Logs dạng JSON, file logging enabled
- `development`: Logs dạng pretty console, file logging optional

```env
NODE_ENV=production
```

---

### SEQ_SERVER_URL

**Mô tả**: URL của Seq server cho centralized logging

**Giá trị**: URL string hoặc để trống

**Mặc định**: Không có (Seq disabled)

**Ví dụ**:
```env
# Local development
SEQ_SERVER_URL=http://localhost:5341

# Production
SEQ_SERVER_URL=https://seq.yourdomain.com
```

**Lưu ý**:
- Nếu không set, Seq transport sẽ không được bật
- Service vẫn chạy bình thường khi Seq offline
- Seq UI: Truy cập vào URL này bằng browser

---

### SEQ_API_KEY

**Mô tả**: API key để authenticate với Seq server

**Giá trị**: String hoặc để trống

**Mặc định**: Không có (no authentication)

**Khi nào cần**:
- Production: Nên có để bảo mật
- Development: Có thể để trống nếu Seq không yêu cầu auth

```env
SEQ_API_KEY=your-api-key-here
```

**Cách lấy API key**:
1. Truy cập Seq UI
2. Vào **Settings** → **API Keys**
3. Click **Add API Key**
4. Copy key và thêm vào .env

---

## 📄 File .env mẫu

### Development (.env.development)

```env
# Log Configuration
LOG_LEVEL=debug
LOG_TO_FILE=false
NODE_ENV=development

# Seq Centralized Logging (Optional)
SEQ_SERVER_URL=http://localhost:5341
SEQ_API_KEY=
```

### Production (.env.production)

```env
# Log Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
NODE_ENV=production

# Seq Centralized Logging
SEQ_SERVER_URL=https://seq.yourdomain.com
SEQ_API_KEY=your-production-api-key-here
```

### Testing (.env.test)

```env
# Log Configuration
LOG_LEVEL=error
LOG_TO_FILE=false
NODE_ENV=test

# Seq Disabled for testing
SEQ_SERVER_URL=
SEQ_API_KEY=
```

---

## 🔧 Cấu hình cho từng Service

Mỗi service có thể có file .env riêng hoặc dùng chung từ root:

### Cách 1: File .env riêng cho mỗi service

```
apps/
├── auth-service/
│   └── .env              # Auth service config
├── iam-service/
│   └── .env              # IAM service config
└── catalog-service/
    └── .env              # Catalog service config
```

### Cách 2: File .env chung ở root (Recommended)

```
.env                      # Shared config cho tất cả services
apps/
├── auth-service/
├── iam-service/
└── catalog-service/
```

NestJS ConfigModule sẽ tự động tìm file .env từ root.

---

## 🚀 Chạy Service với Environment Variables

### Development

```bash
# Sử dụng .env.development
NODE_ENV=development npm run start:dev auth-service
```

### Production

```bash
# Sử dụng .env.production
NODE_ENV=production npm run start:prod auth-service
```

### Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  auth-service:
    build: .
    environment:
      - LOG_LEVEL=info
      - LOG_TO_FILE=true
      - NODE_ENV=production
      - SEQ_SERVER_URL=http://seq:80
      - SEQ_API_KEY=${SEQ_API_KEY}
    depends_on:
      - seq

  seq:
    image: datalust/seq:latest
    ports:
      - "5341:80"
    environment:
      - ACCEPT_EULA=Y
```

---

## ❓ FAQ

### Tôi không muốn dùng Seq, có vấn đề gì không?

Không có vấn đề! Chỉ cần không set `SEQ_SERVER_URL` hoặc để trống. Logger vẫn hoạt động bình thường với console và file logging.

### Seq offline thì service có bị dừng không?

Không! Logger đã xử lý lỗi tự động. Nếu Seq offline, logs vẫn được ghi vào console và file, service vẫn chạy bình thường.

### Tôi muốn log level khác nhau cho mỗi service?

Tạo file .env riêng cho mỗi service với `LOG_LEVEL` khác nhau.

### Logs file quá lớn, làm sao giảm?

Điều chỉnh trong `winston.config.ts`:
```typescript
maxsize: 10485760, // 10MB -> thay đổi giá trị này
maxFiles: 10,       // Giữ 10 files -> thay đổi giá trị này
```

---

## 📚 Tài liệu liên quan

- [README.md](./README.md) - Hướng dẫn sử dụng Logger
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Hướng dẫn tích hợp vào services
- [Seq Documentation](https://docs.datalust.co/docs) - Tài liệu chính thức của Seq

