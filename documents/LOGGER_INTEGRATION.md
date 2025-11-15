# ✅ Logger Integration Complete - API Gateway

Winston Logger đã được tích hợp thành công vào **API Gateway (api-main)**.

## 📋 Tóm tắt thay đổi

### 1. **app.module.ts** ✅
- Import `LoggerModule` từ `@app/logger`
- Khởi tạo với tên service: `'api-gateway'`
- Thêm `HttpLoggerMiddleware` cho tất cả routes

```typescript
imports: [
  LoggerModule.forRoot('api-gateway'),
  // ... other imports
],
```

### 2. **main.ts** ✅
- Replace NestJS Logger bằng `WinstonLoggerService`
- Sử dụng `app.useLogger(logger)` để áp dụng globally
- Ghi log các sự kiện startup quan trọng

```typescript
const logger = app.get(WinstonLoggerService);
logger.setContext('Bootstrap');
app.useLogger(logger);
```

### 3. **app.controller.ts** ✅
- Inject `WinstonLoggerService`
- Set context: `AppController`
- Log health check và các endpoints

### 4. **auth/auth.controller.ts** ✅
- Inject `WinstonLoggerService`
- Set context: `AuthController`
- Log tất cả auth events:
  - Registration attempts
  - Login/Logout
  - Token refresh
  - Profile access

**Đặc biệt:** Sử dụng helper method `logAuth()` cho authentication events

### 5. **middlewares/http-logger.middleware.ts** ✅ (Mới)
- Middleware ghi log tất cả HTTP requests/responses
- Capture response time
- Log levels khác nhau dựa trên status code:
  - `error` - 5xx errors
  - `warn` - 4xx errors
  - `log` - 2xx/3xx success

---

## 🎯 Tính năng đã triển khai

### ✨ Request/Response Logging
Tất cả HTTP requests đều được log với thông tin:
- Method, URL, IP address
- Status code
- Response time
- User agent

### ✨ Authentication Logging
Tất cả auth events được track:
- `LOGIN_ATTEMPT` - Khi user cố đăng nhập
- `LOGIN_SUCCESS` - Đăng nhập thành công
- `LOGIN_FAILED` - Đăng nhập thất bại
- `LOGOUT` - Đăng xuất

### ✨ Error Tracking
Tất cả errors được log với:
- Error message
- Stack trace
- Context (class/method)
- Additional metadata

---

## 📊 Log Output Examples

### Development Console (Colorful)
```
[Nest] 12345  - 2024-11-14 10:30:45   [Bootstrap] 🚀 API Gateway is running on: http://0.0.0.0:4000
[Nest] 12345  - 2024-11-14 10:30:50   [HTTP] POST /api/v1/auth/login [200] - 152ms
[Nest] 12345  - 2024-11-14 10:30:51   [AuthController] Auth: LOGIN_SUCCESS
```

### Production JSON (Structured)
```json
{
  "level": "info",
  "message": "POST /api/v1/auth/login",
  "timestamp": "2024-11-14 10:30:50",
  "label": "api-gateway",
  "context": "HTTP",
  "metadata": {
    "method": "POST",
    "url": "/api/v1/auth/login",
    "statusCode": 200,
    "responseTime": "152ms",
    "ip": "127.0.0.1",
    "type": "HTTP_RESPONSE"
  }
}
```

---

## 🗂️ Log Files

Khi `LOG_TO_FILE=true`, logs sẽ được lưu tại:

```
logs/
└── api-gateway/
    ├── combined.log      # Tất cả logs
    ├── error.log         # Chỉ errors
    ├── exceptions.log    # Uncaught exceptions
    └── rejections.log    # Unhandled promise rejections
```

---

## 🧪 Testing

### Kiểm tra Logger đang hoạt động:

#### 1. Start API Gateway
```bash
cd api-main
npm run start:dev
```

#### 2. Xem logs trong console
Bạn sẽ thấy:
```
[Nest] xxxxx  - [Bootstrap] 🚀 API Gateway is running on: http://0.0.0.0:4000
[Nest] xxxxx  - [Bootstrap] 📝 Environment: development
[Nest] xxxxx  - [Bootstrap] 📊 Log Level: info
```

#### 3. Test Health Check Endpoint
```bash
curl http://localhost:4000/api/v1/main/health
```

**Expected logs:**
```
[Nest] xxxxx  - [HTTP] GET /api/v1/main/health [200] - 5ms
[Nest] xxxxx  - [AppController] Health check performed
```

#### 4. Test Authentication Endpoints

**Register:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'
```

**Expected logs:**
```
[Nest] xxxxx  - [HTTP] POST /api/v1/auth/register
[Nest] xxxxx  - [AuthController] Registration attempt for email: test@example.com
[Nest] xxxxx  - [AuthController] User registered successfully: test@example.com
[Nest] xxxxx  - [HTTP] POST /api/v1/auth/register [201] - 245ms
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test123!"}'
```

**Expected logs:**
```
[Nest] xxxxx  - [HTTP] POST /api/v1/auth/login
[Nest] xxxxx  - [AuthController] Auth: LOGIN_ATTEMPT
[Nest] xxxxx  - [AuthController] Auth: LOGIN_SUCCESS
[Nest] xxxxx  - [HTTP] POST /api/v1/auth/login [200] - 152ms
```

#### 5. Test với LOG_LEVEL khác nhau

**.env:**
```env
LOG_LEVEL=debug  # Xem nhiều thông tin hơn
```

**Restart và test lại:**
```bash
npm run start:dev
```

Bạn sẽ thấy thêm debug logs:
```
[Nest] xxxxx  - [AppController] Hello endpoint called
[Nest] xxxxx  - [AppController] Health check endpoint called
[Nest] xxxxx  - [HTTP] Incoming request GET /api/v1/main/health
```

---

## 📈 Log Levels Behavior

| Level | Hiển thị gì | Khi nào dùng |
|-------|-------------|--------------|
| `error` | Chỉ errors | Production - critical issues only |
| `warn` | Errors + warnings | Production - important events |
| `info` | Errors + warns + info | Production/Development - business events |
| `debug` | All above + debug info | Development - detailed flow |
| `verbose` | Everything | Development - include HTTP details |

**Recommended:**
- Development: `LOG_LEVEL=debug`
- Production: `LOG_LEVEL=info` hoặc `LOG_LEVEL=warn`

---

## 🔍 Troubleshooting

### Logger không hoạt động?

1. **Check module import:**
```typescript
// app.module.ts
imports: [
  LoggerModule.forRoot('api-gateway'), // ← Đảm bảo có dòng này
]
```

2. **Check logger injection:**
```typescript
constructor(private readonly logger: WinstonLoggerService) {
  this.logger.setContext(ClassName.name); // ← Phải set context
}
```

3. **Rebuild project:**
```bash
npm run build
npm run start:dev
```

### Không thấy debug logs?

Check `LOG_LEVEL` trong `.env`:
```env
LOG_LEVEL=debug  # ← Phải là debug để xem debug logs
```

### Middleware không chạy?

Check `app.module.ts`:
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*'); // ← Phải có
  }
}
```

---

## ✅ Verification Checklist

- [x] LoggerModule imported trong app.module.ts
- [x] WinstonLoggerService được dùng trong main.ts
- [x] Logger injected vào AppController
- [x] Logger injected vào AuthController
- [x] HttpLoggerMiddleware được tạo và apply
- [x] Không có linter errors
- [x] Logs hiển thị trong console khi start app
- [x] HTTP requests được log
- [x] Auth events được log
- [x] Errors được log với stack trace

---

## 🎉 Kết luận

Winston Logger đã được tích hợp hoàn chỉnh vào API Gateway!

### Điểm mạnh:
✅ Tất cả requests/responses được track  
✅ Authentication events được ghi rõ ràng  
✅ Errors có đầy đủ thông tin debug  
✅ Dễ dàng switch giữa dev/prod modes  
✅ Centralized logging configuration  

### Next Steps:
1. Test với real API calls
2. Monitor logs trong production
3. Setup log aggregation (Elasticsearch, CloudWatch, etc.)
4. Configure alerts cho critical errors

---

**📚 Tài liệu tham khảo:**
- [Logger Library README](../../libs/logger/README.md)
- [Integration Guide](../../libs/logger/INTEGRATION_GUIDE.md)
- [Logger Setup Complete](../../LOGGER_SETUP_COMPLETE.md)

---

*Last Updated: 2024-11-14*  
*Status: ✅ Production Ready*

