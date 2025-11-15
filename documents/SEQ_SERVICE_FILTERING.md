# 🔍 Seq Service Filtering Guide

Hướng dẫn chi tiết cách phân biệt và filter logs từ các services khác nhau trong Seq.

## 📊 Properties được gửi tự động

Mỗi log entry được gửi tới Seq sẽ có các properties sau:

| Property | Mô tả | Ví dụ giá trị | Cách query |
|----------|-------|--------------|-----------|
| `Service` | Tên service | `auth-service`, `iam-service`, `catalog-service`, `api-gateway` | `Service = 'auth-service'` |
| `Environment` | Môi trường | `development`, `production`, `test` | `Environment = 'production'` |
| `Application` | Tên application | `qhis-plus-backend` | `Application = 'qhis-plus-backend'` |
| `level` | Log level | `error`, `warn`, `info`, `debug`, `verbose` | `level = 'error'` |
| `message` | Nội dung log | `User logged in` | `message like '%login%'` |
| `@Timestamp` | Thời gian | `2024-11-15T10:30:45.123Z` | `@Timestamp >= Now() - 1h` |
| `context` | Context class | `AuthController`, `LoginHandler` | `context = 'AuthController'` |

## 🎯 Query Examples theo Service

### 1. Xem logs từ một service cụ thể

```sql
-- Chỉ auth-service
Service = 'auth-service'

-- Chỉ iam-service
Service = 'iam-service'

-- Chỉ catalog-service
Service = 'catalog-service'

-- Chỉ api-gateway
Service = 'api-gateway'
```

### 2. Xem logs từ nhiều services

```sql
-- Auth và IAM services
Service in ['auth-service', 'iam-service']

-- Tất cả services trừ api-gateway
Service <> 'api-gateway'
```

### 3. Filter theo Environment

```sql
-- Production logs từ auth-service
Service = 'auth-service' and Environment = 'production'

-- Development logs từ tất cả services
Environment = 'development'

-- Production errors từ tất cả services
Environment = 'production' and level = 'error'
```

### 4. So sánh giữa các services

```sql
-- Đếm số errors theo service
level = 'error' | count(*) group by Service

-- Đếm logs theo service và level
* | count(*) group by Service, level

-- Service nào có nhiều errors nhất
level = 'error' | count(*) group by Service | sort count(*) desc
```

### 5. Filter theo Context (Class/Function)

```sql
-- Logs từ AuthController trong auth-service
Service = 'auth-service' and context = 'AuthController'

-- Logs từ LoginHandler
context = 'LoginHandler'

-- Tất cả controllers
context like '%Controller'
```

## 📈 Dashboard Examples

### Error Rate Comparison

Tạo chart để so sánh error rate giữa các services:

```sql
level = 'error' 
| count(*) group by Service, time(5m)
```

**Hiển thị**: Line chart với mỗi service một màu khác nhau

---

### Service Activity

Xem service nào active nhất:

```sql
* | count(*) group by Service
```

**Hiển thị**: Bar chart

---

### Response Time by Service

So sánh response time giữa các services:

```sql
type = 'HTTP_REQUEST' 
| average(responseTime) group by Service, time(5m)
```

**Hiển thị**: Line chart

---

### Login Events by Service

Tracking login events:

```sql
event = 'LOGIN_SUCCESS' 
| count(*) group by Service, time(1h)
```

**Hiển thị**: Area chart

---

### Error Distribution

Xem phân bố errors:

```sql
level = 'error' 
| count(*) group by Service, context 
| top 20 by count(*)
```

**Hiển thị**: Table

## 🚨 Alert Examples

### High Error Rate Alert

Cảnh báo khi một service có quá nhiều errors:

```sql
-- >10 errors trong 5 phút từ bất kỳ service nào
level = 'error' 
| count(*) > 10 group by Service, time(5m)
```

**Action**: Email team với service name

---

### Service Comparison Alert

Cảnh báo khi error rate tăng đột ngột so với baseline:

```sql
-- Service có error rate tăng >50% so với giờ trước
level = 'error' 
| count(*) group by Service, time(1h)
| where count(*) > (count(*) offset -1h) * 1.5
```

---

### Service Down Detection

Phát hiện service không gửi logs (có thể down):

```sql
-- Không nhận logs từ service trong 10 phút
* | count(*) < 1 group by Service, time(10m)
```

## 🔎 Advanced Queries

### 1. Find Slowest Endpoints by Service

```sql
type = 'HTTP_REQUEST' 
| select Service, url, average(responseTime) as AvgTime
| group by Service, url 
| sort AvgTime desc 
| take 10
```

### 2. Error Patterns

```sql
level = 'error' 
| select Service, message, count(*) as ErrorCount
| group by Service, message 
| sort ErrorCount desc
```

### 3. User Journey Across Services

```sql
userId = '123e4567-e89b-12d3-a456-426614174000'
| select @Timestamp, Service, message
| sort @Timestamp asc
```

### 4. Service Health Check

```sql
-- Logs từ tất cả services trong 5 phút qua
@Timestamp >= Now() - 5m
| count(*) group by Service
```

### 5. Cross-Service Errors

Tìm errors xảy ra đồng thời trên nhiều services:

```sql
level = 'error' 
and @Timestamp >= Now() - 5m
| count(*) group by time(1m)
| where count(*) > 5
```

## 💡 Best Practices

### 1. Always Include Service in Filters

❌ **Bad**:
```sql
level = 'error'  -- Tất cả services, khó debug
```

✅ **Good**:
```sql
Service = 'auth-service' and level = 'error'  -- Specific service
```

### 2. Use Structured Logging

❌ **Bad**:
```typescript
this.logger.log('User john@example.com logged in');
```

✅ **Good**:
```typescript
this.logger.log({
  message: 'User logged in',
  userId: user.id,
  email: user.email,
  Service: 'auth-service',  // Tự động thêm
});
```

Sau đó query:
```sql
Service = 'auth-service' and email = 'john@example.com'
```

### 3. Create Service-Specific Views

Tạo saved queries cho từng service:

- **Auth Service Errors**: `Service = 'auth-service' and level = 'error'`
- **IAM Service Activity**: `Service = 'iam-service'`
- **API Gateway Traffic**: `Service = 'api-gateway' and type = 'HTTP_REQUEST'`

## 📱 Quick Reference Card

```sql
# BASIC FILTERS
Service = 'auth-service'                    # One service
Service in ['auth-service', 'iam-service']  # Multiple services
Environment = 'production'                  # By environment
level = 'error'                             # By level

# AGGREGATIONS
| count(*) group by Service                 # Count by service
| average(responseTime) group by Service    # Avg by service
| sum(bytes) group by Service               # Total by service

# TIME FILTERS
@Timestamp >= Now() - 1h                    # Last hour
@Timestamp >= Now() - 1d                    # Last day
time(5m)                                    # 5-minute buckets

# SORTING
| sort @Timestamp desc                      # Newest first
| sort count(*) desc                        # Highest count first
| top 10 by count(*)                        # Top 10

# COMBINING
Service = 'auth-service' 
and level = 'error' 
and @Timestamp >= Now() - 1h
| count(*) group by context
| sort count(*) desc
```

## 🎓 Learning Path

1. **Week 1**: Filter logs by single service
   ```sql
   Service = 'auth-service'
   ```

2. **Week 2**: Combine filters
   ```sql
   Service = 'auth-service' and level = 'error'
   ```

3. **Week 3**: Create aggregations
   ```sql
   level = 'error' | count(*) group by Service
   ```

4. **Week 4**: Build dashboards
   - Error rate by service
   - Response time trends
   - Service activity

5. **Week 5**: Setup alerts
   - High error rate
   - Slow requests
   - Service down detection

---

## 📞 Need Help?

- **Seq Query Language Docs**: https://docs.datalust.co/docs/the-seq-query-language
- **Team Support**: Liên hệ DevOps team
- **Examples**: Xem [README.md](./README.md) và [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

---

**Happy Logging! 🎉**

