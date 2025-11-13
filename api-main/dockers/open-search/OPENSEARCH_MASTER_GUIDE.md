# Hướng Dẫn Làm Chủ OpenSearch

## 📋 Mục Lục
1. [Giới Thiệu & Kiến Thức Nền](#1-giới-thiệu--kiến-thức-nền)
2. [Khởi Động & Kiểm Tra](#2-khởi-động--kiểm-tra)
3. [Các Khái Niệm Cơ Bản](#3-các-khái-niệm-cơ-bản)
4. [CRUD Operations](#4-crud-operations)
5. [Search & Query DSL](#5-search--query-dsl)
6. [Mapping & Settings](#6-mapping--settings)
7. [Aggregations](#7-aggregations)
8. [Performance & Optimization](#8-performance--optimization)
9. [Security & Access Control](#9-security--access-control)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)
11. [Best Practices](#11-best-practices)
12. [Tích Hợp Với NestJS](#12-tích-hợp-với-nestjs)

---

## 1. Giới Thiệu & Kiến Thức Nền

### OpenSearch là gì?
OpenSearch là một search và analytics engine mã nguồn mở, fork từ Elasticsearch 7.10.2. Nó cho phép:
- **Full-text search**: Tìm kiếm toàn văn bản với scoring
- **Analytics**: Phân tích dữ liệu với aggregations
- **Real-time indexing**: Đánh index gần như real-time
- **Distributed**: Scale horizontal với sharding

### Kiến Trúc Cơ Bản
```
┌─────────────────────────────────────┐
│     OpenSearch Cluster              │
│  ┌──────────────────────────────┐   │
│  │    Index (e.g., "patients")  │   │
│  │  ┌──────────┬──────────┐     │   │
│  │  │ Shard 0  │ Shard 1  │     │   │
│  │  │ Primary  │ Primary  │     │   │
│  │  └──────────┴──────────┘     │   │
│  │  ┌──────────┬──────────┐     │   │
│  │  │ Replica  │ Replica  │     │   │
│  │  └──────────┴──────────┘     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 2. Khởi Động & Kiểm Tra

### 2.1. Khởi động OpenSearch
```bash
cd docker/open-search

# Tạo file .env nếu chưa có
echo "OPENSEARCH_INITIAL_ADMIN_PASSWORD=YourStrongPassword123!" > .env

# Khởi động
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f opensearch
```

### 2.2. Kiểm tra kết nối

#### Sử dụng curl (Windows Git Bash)
```bash
# Kiểm tra cluster health
curl -X GET "https://localhost:9200" \
  -u admin:YourStrongPassword123! \
  -k

# Kiểm tra cluster health
curl -X GET "https://localhost:9200/_cluster/health?pretty" \
  -u admin:YourStrongPassword123! \
  -k
```

#### Sử dụng PowerShell
```powershell
$password = "YourStrongPassword123!"
$pair = "admin:$password"
$encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{
    Authorization = "Basic $encodedCreds"
}

# Kiểm tra cluster
Invoke-RestMethod -Uri "https://localhost:9200/_cluster/health?pretty" `
  -Method GET -Headers $headers -SkipCertificateCheck
```

### 2.3. Truy cập OpenSearch Dashboards
1. Mở browser: `http://localhost:5601`
2. Đăng nhập với `admin` / `YourStrongPassword123!`
3. Khám phá Dev Tools (menu bên trái) để test queries

---

## 3. Các Khái Niệm Cơ Bản

### 3.1. Index
- Tương đương với "database" trong SQL
- Chứa documents với cùng schema
- Tên phải lowercase

### 3.2. Document
- Tương đương với "row" trong SQL
- Định dạng JSON
- Mỗi document có `_id` duy nhất

### 3.3. Field
- Tương đương với "column" trong SQL
- Mỗi field có data type (text, keyword, date, number, etc.)

### 3.4. Mapping
- Định nghĩa schema của index
- Xác định data type và index options cho từng field

### 3.5. Shard
- Index được chia thành nhiều shards để phân tán data
- **Primary shard**: Chứa data gốc
- **Replica shard**: Bản sao để backup và tăng read performance

### So Sánh với SQL
```
SQL Database    →  OpenSearch Index
Table           →  (deprecated) Type
Row             →  Document
Column          →  Field
Schema          →  Mapping
```

---

## 4. CRUD Operations

### 4.1. Create Index
```json
PUT /patients
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "vietnamese_analyzer": {
          "type": "standard"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "patient_id": {
        "type": "keyword"
      },
      "full_name": {
        "type": "text",
        "analyzer": "vietnamese_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "date_of_birth": {
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "phone": {
        "type": "keyword"
      },
      "email": {
        "type": "keyword"
      },
      "address": {
        "type": "text"
      },
      "medical_history": {
        "type": "text"
      },
      "created_at": {
        "type": "date"
      },
      "updated_at": {
        "type": "date"
      }
    }
  }
}
```

### 4.2. Create Document (Index)

#### Với auto-generated ID
```json
POST /patients/_doc
{
  "patient_id": "P001",
  "full_name": "Nguyễn Văn A",
  "date_of_birth": "1990-01-15",
  "phone": "0912345678",
  "email": "nguyenvana@example.com",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "medical_history": "Tiền sử: Cao huyết áp",
  "created_at": "2025-10-15T10:00:00Z"
}
```

#### Với custom ID
```json
PUT /patients/_doc/P001
{
  "patient_id": "P001",
  "full_name": "Nguyễn Văn A",
  "date_of_birth": "1990-01-15",
  "phone": "0912345678",
  "email": "nguyenvana@example.com",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "medical_history": "Tiền sử: Cao huyết áp",
  "created_at": "2025-10-15T10:00:00Z"
}
```

### 4.3. Read Document (Get)
```json
GET /patients/_doc/P001
```

### 4.4. Update Document

#### Update toàn bộ (replace)
```json
PUT /patients/_doc/P001
{
  "patient_id": "P001",
  "full_name": "Nguyễn Văn A",
  "date_of_birth": "1990-01-15",
  "phone": "0912345679",  // Số mới
  "email": "nguyenvana@example.com",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",  // Địa chỉ mới
  "medical_history": "Tiền sử: Cao huyết áp, Đái tháo đường",
  "updated_at": "2025-10-15T11:00:00Z"
}
```

#### Update một phần (partial update)
```json
POST /patients/_update/P001
{
  "doc": {
    "phone": "0912345679",
    "updated_at": "2025-10-15T11:00:00Z"
  }
}
```

#### Update với script
```json
POST /patients/_update/P001
{
  "script": {
    "source": "ctx._source.visit_count += params.count",
    "params": {
      "count": 1
    }
  }
}
```

### 4.5. Delete Document
```json
DELETE /patients/_doc/P001
```

### 4.6. Bulk Operations
```json
POST /_bulk
{"index":{"_index":"patients","_id":"P001"}}
{"patient_id":"P001","full_name":"Nguyễn Văn A","date_of_birth":"1990-01-15"}
{"index":{"_index":"patients","_id":"P002"}}
{"patient_id":"P002","full_name":"Trần Thị B","date_of_birth":"1985-05-20"}
{"update":{"_index":"patients","_id":"P001"}}
{"doc":{"phone":"0912345678"}}
{"delete":{"_index":"patients","_id":"P002"}}
```

---

## 5. Search & Query DSL

### 5.1. Match All
```json
GET /patients/_search
{
  "query": {
    "match_all": {}
  }
}
```

### 5.2. Match Query (Full-text search)
```json
GET /patients/_search
{
  "query": {
    "match": {
      "full_name": "Nguyễn Văn"
    }
  }
}
```

### 5.3. Term Query (Exact match)
```json
GET /patients/_search
{
  "query": {
    "term": {
      "patient_id": "P001"
    }
  }
}
```

### 5.4. Multi-Match Query
```json
GET /patients/_search
{
  "query": {
    "multi_match": {
      "query": "Nguyễn",
      "fields": ["full_name", "address"]
    }
  }
}
```

### 5.5. Bool Query (Kết hợp nhiều điều kiện)
```json
GET /patients/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "full_name": "Nguyễn"
          }
        }
      ],
      "filter": [
        {
          "range": {
            "date_of_birth": {
              "gte": "1980-01-01",
              "lte": "1990-12-31"
            }
          }
        }
      ],
      "must_not": [
        {
          "term": {
            "status": "inactive"
          }
        }
      ],
      "should": [
        {
          "match": {
            "address": "TP.HCM"
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}
```

**Bool Query Components:**
- `must`: Phải match (ảnh hưởng score)
- `filter`: Phải match (không ảnh hưởng score, cache được)
- `must_not`: Không được match
- `should`: Nên match (tăng score nếu match)

### 5.6. Range Query
```json
GET /patients/_search
{
  "query": {
    "range": {
      "date_of_birth": {
        "gte": "1990-01-01",
        "lt": "2000-01-01"
      }
    }
  }
}
```

### 5.7. Wildcard Query
```json
GET /patients/_search
{
  "query": {
    "wildcard": {
      "full_name.keyword": "Nguyễn*"
    }
  }
}
```

### 5.8. Fuzzy Query (Tìm kiếm mờ)
```json
GET /patients/_search
{
  "query": {
    "fuzzy": {
      "full_name": {
        "value": "Nguyen",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

### 5.9. Prefix Query
```json
GET /patients/_search
{
  "query": {
    "prefix": {
      "patient_id": "P00"
    }
  }
}
```

### 5.10. Exists Query
```json
GET /patients/_search
{
  "query": {
    "exists": {
      "field": "email"
    }
  }
}
```

### 5.11. Pagination
```json
GET /patients/_search
{
  "from": 0,
  "size": 20,
  "query": {
    "match_all": {}
  }
}
```

### 5.12. Sorting
```json
GET /patients/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "date_of_birth": {
        "order": "desc"
      }
    },
    {
      "full_name.keyword": {
        "order": "asc"
      }
    }
  ]
}
```

### 5.13. Source Filtering (Chọn fields trả về)
```json
GET /patients/_search
{
  "query": {
    "match_all": {}
  },
  "_source": ["patient_id", "full_name", "date_of_birth"]
}
```

### 5.14. Highlighting
```json
GET /patients/_search
{
  "query": {
    "match": {
      "medical_history": "cao huyết áp"
    }
  },
  "highlight": {
    "fields": {
      "medical_history": {}
    }
  }
}
```

---

## 6. Mapping & Settings

### 6.1. Xem Mapping Hiện Tại
```json
GET /patients/_mapping
```

### 6.2. Các Data Types Quan Trọng

#### Text vs Keyword
```json
{
  "mappings": {
    "properties": {
      "full_name": {
        "type": "text",          // Full-text search, được phân tích
        "fields": {
          "keyword": {
            "type": "keyword",   // Exact match, sorting, aggregation
            "ignore_above": 256
          }
        }
      }
    }
  }
}
```

#### Numeric Types
```json
{
  "mappings": {
    "properties": {
      "age": { "type": "integer" },
      "weight": { "type": "float" },
      "height": { "type": "double" },
      "balance": { "type": "long" }
    }
  }
}
```

#### Date Type
```json
{
  "mappings": {
    "properties": {
      "appointment_date": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

#### Boolean
```json
{
  "mappings": {
    "properties": {
      "is_active": { "type": "boolean" }
    }
  }
}
```

#### Object & Nested
```json
{
  "mappings": {
    "properties": {
      "address": {
        "type": "object",       // Flattened
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" }
        }
      },
      "appointments": {
        "type": "nested",       // Giữ quan hệ giữa các fields
        "properties": {
          "date": { "type": "date" },
          "doctor": { "type": "keyword" }
        }
      }
    }
  }
}
```

### 6.3. Update Mapping (Add new field)
```json
PUT /patients/_mapping
{
  "properties": {
    "insurance_number": {
      "type": "keyword"
    }
  }
}
```

**Lưu ý:** Không thể thay đổi type của field đã tồn tại. Phải reindex.

### 6.4. Reindex
```json
POST /_reindex
{
  "source": {
    "index": "patients"
  },
  "dest": {
    "index": "patients_v2"
  }
}
```

### 6.5. Index Settings

#### Xem settings
```json
GET /patients/_settings
```

#### Update settings (dynamic)
```json
PUT /patients/_settings
{
  "index": {
    "number_of_replicas": 2,
    "refresh_interval": "30s"
  }
}
```

---

## 7. Aggregations

Aggregations cho phép phân tích và thống kê dữ liệu.

### 7.1. Metric Aggregations

#### Count
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "total_patients": {
      "value_count": {
        "field": "patient_id"
      }
    }
  }
}
```

#### Stats (min, max, avg, sum)
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "age_stats": {
      "stats": {
        "field": "age"
      }
    }
  }
}
```

#### Average
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "average_age": {
      "avg": {
        "field": "age"
      }
    }
  }
}
```

### 7.2. Bucket Aggregations

#### Terms Aggregation (Group by)
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "patients_by_city": {
      "terms": {
        "field": "city.keyword",
        "size": 10
      }
    }
  }
}
```

#### Date Histogram
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "patients_over_time": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "month"
      }
    }
  }
}
```

#### Range Aggregation
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "age_ranges": {
      "range": {
        "field": "age",
        "ranges": [
          { "to": 18 },
          { "from": 18, "to": 40 },
          { "from": 40, "to": 60 },
          { "from": 60 }
        ]
      }
    }
  }
}
```

### 7.3. Sub-Aggregations (Nested)
```json
GET /patients/_search
{
  "size": 0,
  "aggs": {
    "patients_by_city": {
      "terms": {
        "field": "city.keyword"
      },
      "aggs": {
        "average_age": {
          "avg": {
            "field": "age"
          }
        }
      }
    }
  }
}
```

### 7.4. Filter + Aggregation
```json
GET /patients/_search
{
  "size": 0,
  "query": {
    "range": {
      "date_of_birth": {
        "gte": "1990-01-01"
      }
    }
  },
  "aggs": {
    "patients_by_gender": {
      "terms": {
        "field": "gender.keyword"
      }
    }
  }
}
```

---

## 8. Performance & Optimization

### 8.1. Index Performance

#### Bulk Indexing
- Sử dụng `_bulk` API thay vì index từng document
- Batch size tối ưu: 1000-5000 documents hoặc 5-15MB

```json
POST /_bulk
{"index":{"_index":"patients"}}
{"patient_id":"P001","full_name":"Nguyễn Văn A"}
{"index":{"_index":"patients"}}
{"patient_id":"P002","full_name":"Trần Thị B"}
```

#### Refresh Interval
```json
PUT /patients/_settings
{
  "index": {
    "refresh_interval": "30s"  // Default: 1s
  }
}
```
- Tăng `refresh_interval` khi bulk indexing
- Set `-1` để disable auto-refresh khi import lớn

### 8.2. Search Performance

#### Use Filter Instead of Query
```json
// BAD (slower)
{
  "query": {
    "bool": {
      "must": [
        { "term": { "status": "active" } }
      ]
    }
  }
}

// GOOD (faster, cacheable)
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "status": "active" } }
      ]
    }
  }
}
```

#### Limit _source
```json
GET /patients/_search
{
  "_source": ["patient_id", "full_name"],  // Only return needed fields
  "query": { "match_all": {} }
}
```

#### Use Pagination Wisely
```bash
# BAD: Deep pagination
GET /patients/_search?from=10000&size=20

# GOOD: Use search_after for deep pagination
GET /patients/_search
{
  "size": 20,
  "query": { "match_all": {} },
  "search_after": [1234567890],
  "sort": [{ "created_at": "asc" }]
}
```

### 8.3. Mapping Optimization

#### Disable _source (nếu không cần)
```json
{
  "mappings": {
    "_source": {
      "enabled": false  // Tiết kiệm disk, nhưng không reindex được
    }
  }
}
```

#### Disable indexing cho fields không search
```json
{
  "mappings": {
    "properties": {
      "description": {
        "type": "text",
        "index": false  // Không index, chỉ lưu trữ
      }
    }
  }
}
```

#### Use keyword cho exact match
```json
{
  "mappings": {
    "properties": {
      "status": {
        "type": "keyword"  // Nhanh hơn text cho exact match
      }
    }
  }
}
```

### 8.4. Shard Strategy

#### Quy tắc chọn số shards
- **Small indices** (<50GB): 1-2 shards
- **Medium indices** (50-200GB): 3-5 shards
- **Large indices** (>200GB): 5-10 shards

```json
PUT /patients
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

#### Index Lifecycle Management (ILM)
Tự động quản lý index theo thời gian (hot-warm-cold-delete).

---

## 9. Security & Access Control

### 9.1. Tạo User Mới
```json
PUT /_plugins/_security/api/internalusers/patient_reader
{
  "password": "StrongPassword123!",
  "opendistro_security_roles": ["patient_read_role"]
}
```

### 9.2. Tạo Role
```json
PUT /_plugins/_security/api/roles/patient_read_role
{
  "cluster_permissions": [],
  "index_permissions": [
    {
      "index_patterns": ["patients*"],
      "allowed_actions": [
        "indices:data/read/search",
        "indices:data/read/get"
      ]
    }
  ]
}
```

### 9.3. Mapping Role to User
```json
PUT /_plugins/_security/api/rolesmapping/patient_read_role
{
  "users": ["patient_reader"]
}
```

### 9.4. Common Permissions
- `indices:data/read/*`: Read permissions
- `indices:data/write/*`: Write permissions
- `indices:admin/*`: Index admin (create, delete)
- `cluster:admin/*`: Cluster admin

---

## 10. Monitoring & Maintenance

### 10.1. Cluster Health
```json
GET /_cluster/health?pretty

// Response:
{
  "cluster_name": "opensearch",
  "status": "green",  // green/yellow/red
  "number_of_nodes": 1,
  "number_of_data_nodes": 1
}
```

**Status meanings:**
- **Green**: Tất cả shards (primary + replica) hoạt động
- **Yellow**: Tất cả primary shards hoạt động, một số replica chưa allocated
- **Red**: Một số primary shards không hoạt động

### 10.2. Node Stats
```json
GET /_nodes/stats?pretty
```

### 10.3. Index Stats
```json
GET /patients/_stats?pretty
```

### 10.4. Cat APIs (Human-readable)

```bash
# List all indices
GET /_cat/indices?v

# List shards
GET /_cat/shards?v

# List nodes
GET /_cat/nodes?v

# List allocation
GET /_cat/allocation?v
```

### 10.5. Shard Allocation
```json
GET /_cluster/allocation/explain?pretty
```

### 10.6. Snapshot & Restore

#### Register repository
```json
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/my_backup"
  }
}
```

#### Create snapshot
```json
PUT /_snapshot/my_backup/snapshot_1?wait_for_completion=true
{
  "indices": "patients,appointments",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

#### Restore snapshot
```json
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "patients"
}
```

---

## 11. Best Practices

### 11.1. Index Design

✅ **DO:**
- Sử dụng naming convention: `<project>-<entity>-<version>` (e.g., `bm-patients-v1`)
- Tạo mapping trước khi index data
- Sử dụng `keyword` cho exact match fields (ID, status, email)
- Sử dụng `text` cho full-text search fields (name, description)
- Enable `multi-fields` cho fields cần cả full-text và exact match

❌ **DON'T:**
- Index quá nhiều fields (>1000 fields/document)
- Sử dụng nested objects quá sâu (>3 levels)
- Store large binary data trong OpenSearch

### 11.2. Query Optimization

✅ **DO:**
- Sử dụng `filter` context cho exact matches (cacheable)
- Limit `_source` fields khi không cần toàn bộ document
- Sử dụng `search_after` cho deep pagination
- Cache frequent queries ở application layer

❌ **DON'T:**
- Sử dụng wildcard queries trên large datasets
- Deep pagination với `from`/`size` (>10,000)
- Sorting trên `text` fields (dùng `.keyword` subfield)

### 11.3. Performance

✅ **DO:**
- Bulk index với batch 1000-5000 docs
- Tăng `refresh_interval` khi bulk indexing
- Monitor heap usage (<75%)
- Use index aliases để zero-downtime reindex

❌ **DON'T:**
- Index documents từng cái một
- Tạo quá nhiều small indices
- Giữ `refresh_interval` quá ngắn nếu không cần near real-time

### 11.4. Security

✅ **DO:**
- Sử dụng HTTPS trong production
- Tạo separate users cho từng application
- Apply principle of least privilege
- Rotate credentials định kỳ

❌ **DON'T:**
- Sử dụng admin account cho applications
- Expose OpenSearch port ra public internet
- Store passwords trong code

---

## 12. Tích Hợp Với NestJS

### 12.1. Cài Đặt
```bash
npm install @nestjs/elasticsearch @elastic/elasticsearch
```

### 12.2. Module Configuration

#### `src/infrastructure/config/opensearch.config.ts`
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('opensearch', () => ({
  node: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  maxRetries: 3,
  requestTimeout: 30000,
}));
```

#### `src/infrastructure/opensearch/opensearch.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import opensearchConfig from '../config/opensearch.config';

@Module({
  imports: [
    ConfigModule.forFeature(opensearchConfig),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('opensearch.node'),
        auth: {
          username: configService.get<string>('opensearch.auth.username'),
          password: configService.get<string>('opensearch.auth.password'),
        },
        ssl: configService.get('opensearch.ssl'),
        maxRetries: configService.get<number>('opensearch.maxRetries'),
        requestTimeout: configService.get<number>('opensearch.requestTimeout'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ElasticsearchModule],
})
export class OpenSearchModule {}
```

### 12.3. Repository Pattern

#### `src/domain/interfaces/patient-search.repository.interface.ts`
```typescript
export interface IPatientSearchRepository {
  index(patient: Patient): Promise<void>;
  search(criteria: PatientSearchCriteria): Promise<PatientSearchResult>;
  update(patientId: string, data: Partial<Patient>): Promise<void>;
  delete(patientId: string): Promise<void>;
  bulkIndex(patients: Patient[]): Promise<void>;
}
```

#### `src/infrastructure/opensearch/repositories/patient-search.repository.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IPatientSearchRepository } from '../../../domain/interfaces/patient-search.repository.interface';
import { Patient } from '../../../domain/entities/patient.entity';
import { PatientSearchCriteria, PatientSearchResult } from '../../../application/dtos/patient-search.dto';

@Injectable()
export class PatientSearchRepository implements IPatientSearchRepository {
  private readonly INDEX_NAME = 'bm-patients-v1';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async index(patient: Patient): Promise<void> {
    await this.elasticsearchService.index({
      index: this.INDEX_NAME,
      id: patient.id,
      document: {
        patient_id: patient.patientId,
        full_name: patient.fullName,
        date_of_birth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt,
      },
    });
  }

  async search(criteria: PatientSearchCriteria): Promise<PatientSearchResult> {
    const { keyword, fromDate, toDate, page = 1, limit = 20 } = criteria;

    const must: any[] = [];

    // Full-text search
    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: ['full_name^3', 'patient_id^2', 'phone', 'email', 'address'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Date range filter
    if (fromDate || toDate) {
      must.push({
        range: {
          created_at: {
            ...(fromDate && { gte: fromDate }),
            ...(toDate && { lte: toDate }),
          },
        },
      });
    }

    const response = await this.elasticsearchService.search({
      index: this.INDEX_NAME,
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
        },
      },
      sort: [{ created_at: 'desc' }],
    });

    return {
      items: response.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      })),
      total: response.hits.total.value,
      page,
      limit,
    };
  }

  async update(patientId: string, data: Partial<Patient>): Promise<void> {
    await this.elasticsearchService.update({
      index: this.INDEX_NAME,
      id: patientId,
      doc: data,
    });
  }

  async delete(patientId: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: this.INDEX_NAME,
      id: patientId,
    });
  }

  async bulkIndex(patients: Patient[]): Promise<void> {
    const body = patients.flatMap((patient) => [
      { index: { _index: this.INDEX_NAME, _id: patient.id } },
      {
        patient_id: patient.patientId,
        full_name: patient.fullName,
        date_of_birth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt,
      },
    ]);

    await this.elasticsearchService.bulk({ body });
  }

  async createIndex(): Promise<void> {
    const exists = await this.elasticsearchService.indices.exists({
      index: this.INDEX_NAME,
    });

    if (exists) {
      return;
    }

    await this.elasticsearchService.indices.create({
      index: this.INDEX_NAME,
      body: {
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              vietnamese_analyzer: {
                type: 'standard',
              },
            },
          },
        },
        mappings: {
          properties: {
            patient_id: { type: 'keyword' },
            full_name: {
              type: 'text',
              analyzer: 'vietnamese_analyzer',
              fields: {
                keyword: { type: 'keyword', ignore_above: 256 },
              },
            },
            date_of_birth: { type: 'date', format: 'yyyy-MM-dd' },
            phone: { type: 'keyword' },
            email: { type: 'keyword' },
            address: { type: 'text' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
          },
        },
      },
    });
  }
}
```

### 12.4. Use Case Example

#### `src/application/use-cases/search-patients.use-case.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { IPatientSearchRepository } from '../../domain/interfaces/patient-search.repository.interface';
import { PatientSearchCriteria, PatientSearchResult } from '../dtos/patient-search.dto';

@Injectable()
export class SearchPatientsUseCase {
  constructor(
    private readonly patientSearchRepository: IPatientSearchRepository,
  ) {}

  async execute(criteria: PatientSearchCriteria): Promise<PatientSearchResult> {
    return this.patientSearchRepository.search(criteria);
  }
}
```

### 12.5. Controller Example

#### `src/presentation/controllers/patient-search.controller.ts`
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchPatientsUseCase } from '../../application/use-cases/search-patients.use-case';
import { PatientSearchCriteria } from '../../application/dtos/patient-search.dto';

@ApiTags('Patient Search')
@Controller('api/patients/search')
export class PatientSearchController {
  constructor(private readonly searchPatientsUseCase: SearchPatientsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Search patients' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'fromDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'toDate', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query() criteria: PatientSearchCriteria) {
    return this.searchPatientsUseCase.execute(criteria);
  }
}
```

### 12.6. Event-Driven Sync

#### `src/application/events/patient-created.event.ts`
```typescript
export class PatientCreatedEvent {
  constructor(public readonly patient: Patient) {}
}
```

#### `src/application/listeners/patient-created.listener.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PatientCreatedEvent } from '../events/patient-created.event';
import { IPatientSearchRepository } from '../../domain/interfaces/patient-search.repository.interface';

@Injectable()
export class PatientCreatedListener {
  constructor(
    private readonly patientSearchRepository: IPatientSearchRepository,
  ) {}

  @OnEvent('patient.created')
  async handlePatientCreated(event: PatientCreatedEvent) {
    await this.patientSearchRepository.index(event.patient);
  }
}
```

### 12.7. Environment Variables

#### `.env`
```env
# OpenSearch Configuration
OPENSEARCH_NODE=https://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=YourStrongPassword123!
```

---

## 📚 Tài Nguyên Bổ Sung

### Documentation
- [OpenSearch Official Docs](https://opensearch.org/docs/latest/)
- [OpenSearch Query DSL](https://opensearch.org/docs/latest/query-dsl/)
- [NestJS Elasticsearch](https://docs.nestjs.com/recipes/elasticsearch)

### Tools
- **OpenSearch Dashboards**: `http://localhost:5601`
- **curl/Postman**: Test API
- **Kibana Dev Tools**: Query console (nếu dùng Dashboards)

### Performance Testing
```bash
# Apache Bench
ab -n 1000 -c 10 https://localhost:9200/patients/_search

# JMeter, k6, etc.
```

---

## 🎯 Next Steps

1. ✅ Khởi động OpenSearch cluster
2. ✅ Tạo index đầu tiên (`patients`)
3. ✅ Thử nghiệm CRUD operations
4. ✅ Thực hành search queries
5. ✅ Tích hợp vào NestJS application
6. ✅ Setup event-driven sync
7. ✅ Monitor performance
8. ✅ Implement backup strategy

---

## 💡 Tips & Tricks

### 1. Dev Tools Shortcuts
```json
// Xóa tất cả documents trong index (DEV ONLY!)
POST /patients/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}

// Refresh index manually
POST /patients/_refresh

// Force merge segments
POST /patients/_forcemerge?max_num_segments=1
```

### 2. Debug Queries
```json
GET /patients/_search
{
  "query": { "match": { "full_name": "Nguyễn" } },
  "explain": true  // Shows scoring details
}
```

### 3. Analyze API (Test tokenizer)
```json
GET /patients/_analyze
{
  "analyzer": "vietnamese_analyzer",
  "text": "Nguyễn Văn A"
}
```

### 4. Count Documents
```json
GET /patients/_count
{
  "query": {
    "match": {
      "full_name": "Nguyễn"
    }
  }
}
```

---

**🎉 Chúc bạn làm chủ OpenSearch thành công!**

Nếu có câu hỏi, hãy tham khảo documentation hoặc OpenSearch community forums.

