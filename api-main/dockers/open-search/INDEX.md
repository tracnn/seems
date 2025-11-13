# OpenSearch Documentation Index

## 📚 Cấu Trúc Tài Liệu

```
docker/open-search/
├── 📄 INDEX.md                          ← BẠN ĐANG Ở ĐÂY
├── 📄 QUICKSTART.md                     ← Bắt đầu trong 5 phút
├── 📄 README.md                         ← Tổng quan dự án
├── 📖 OPENSEARCH_MASTER_GUIDE.md        ← Hướng dẫn chi tiết (12 chương)
├── 📋 CHEATSHEET.md                     ← Commands tham khảo nhanh
├── ⚙️  docker-compose.yml               ← Cấu hình Docker
├── 📝 .env.example                      ← Template cấu hình
├── 🗂️  scripts/
│   ├── setup.ps1                        ← Setup tự động toàn bộ
│   ├── test-connection.ps1              ← Kiểm tra kết nối
│   ├── create-sample-index.ps1          ← Tạo index demo
│   └── example-queries.ps1              ← 15+ queries mẫu
└── 📁 data/                             ← Dữ liệu OpenSearch (auto-created)
```

## 🎯 Lộ Trình Học Tập

### Level 1: Beginner (1-2 giờ)
1. ✅ Đọc [QUICKSTART.md](./QUICKSTART.md) (5 phút)
2. ✅ Chạy `.\scripts\setup.ps1` để cài đặt
3. ✅ Chạy `.\scripts\test-connection.ps1` để test
4. ✅ Chạy `.\scripts\create-sample-index.ps1` để tạo data mẫu
5. ✅ Mở Dashboards: http://localhost:5601
6. ✅ Thử nghiệm Dev Tools với queries đơn giản

**Kết quả:** Hiểu cơ bản CRUD và search

### Level 2: Intermediate (3-5 giờ)
1. ✅ Đọc [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md) - Sections 1-5
   - Khái niệm cơ bản
   - CRUD Operations
   - Search & Query DSL
2. ✅ Chạy `.\scripts\example-queries.ps1` để xem 15 queries
3. ✅ Tự viết queries trong Dashboards Dev Tools
4. ✅ Đọc [CHEATSHEET.md](./CHEATSHEET.md) để tham khảo

**Kết quả:** Viết được queries phức tạp, bool queries, aggregations

### Level 3: Advanced (5-10 giờ)
1. ✅ Đọc [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md) - Sections 6-11
   - Mapping & Settings
   - Aggregations
   - Performance & Optimization
   - Security
   - Monitoring
   - Best Practices
2. ✅ Thực hành tối ưu queries
3. ✅ Setup monitoring và alerting
4. ✅ Implement backup strategy

**Kết quả:** Làm chủ OpenSearch, tối ưu performance

### Level 4: Integration (2-4 giờ)
1. ✅ Đọc [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md) - Section 12
   - Tích hợp NestJS
   - Repository Pattern
   - Event-driven sync
2. ✅ Implement search service trong app
3. ✅ Setup event listeners để sync data
4. ✅ Test integration

**Kết quả:** Tích hợp hoàn chỉnh vào NestJS app

## 📖 Hướng Dẫn Theo Mục Đích

### Tôi muốn... bắt đầu ngay
→ Đọc [QUICKSTART.md](./QUICKSTART.md)

### Tôi muốn... hiểu sâu OpenSearch
→ Đọc [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md)

### Tôi muốn... tham khảo command nhanh
→ Đọc [CHEATSHEET.md](./CHEATSHEET.md)

### Tôi muốn... tạo index và test
→ Chạy `.\scripts\create-sample-index.ps1`

### Tôi muốn... xem ví dụ queries
→ Chạy `.\scripts\example-queries.ps1`

### Tôi muốn... tích hợp vào NestJS
→ Xem Section 12 trong [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md#12-tích-hợp-với-nestjs)

### Tôi muốn... debug vấn đề
→ Chạy `.\scripts\test-connection.ps1` và xem logs

## 🎓 Nội Dung Chi Tiết

### [QUICKSTART.md](./QUICKSTART.md)
- ⚡ Setup trong 5 phút
- 🔑 3 queries quan trọng nhất
- 🚀 Tích hợp NestJS cơ bản
- 💡 Tips hữu ích
- 🔧 Docker commands

### [README.md](./README.md)
- 📝 Tổng quan dự án
- 🚀 Quick start
- 🛠️ Scripts tiện ích
- 🔧 Cấu hình
- 📊 Monitoring
- 🔒 Security
- 🚨 Troubleshooting

### [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md)
**Hướng dẫn toàn diện 12 chương:**

1. **Giới Thiệu & Kiến Thức Nền**
   - OpenSearch là gì?
   - Kiến trúc cơ bản
   - So sánh với SQL

2. **Khởi Động & Kiểm Tra**
   - Start OpenSearch
   - Test connection
   - Access Dashboards

3. **Các Khái Niệm Cơ Bản**
   - Index, Document, Field
   - Mapping, Shard, Replica

4. **CRUD Operations**
   - Create, Read, Update, Delete
   - Bulk operations

5. **Search & Query DSL**
   - Match, Term, Bool queries
   - Range, Wildcard, Fuzzy
   - Pagination, Sorting, Filtering

6. **Mapping & Settings**
   - Data types
   - Text vs Keyword
   - Reindex

7. **Aggregations**
   - Metric aggregations
   - Bucket aggregations
   - Sub-aggregations

8. **Performance & Optimization**
   - Index performance
   - Search performance
   - Mapping optimization
   - Shard strategy

9. **Security & Access Control**
   - User management
   - Role-based access
   - Permissions

10. **Monitoring & Maintenance**
    - Cluster health
    - Stats & metrics
    - Snapshot & restore

11. **Best Practices**
    - Index design
    - Query optimization
    - Performance tips
    - Security guidelines

12. **Tích Hợp Với NestJS**
    - Module setup
    - Repository pattern
    - Use cases
    - Event-driven sync

### [CHEATSHEET.md](./CHEATSHEET.md)
- 🚀 Quick commands
- 🔧 Cluster management
- 📊 Index operations
- 🔍 Search queries
- 📈 Aggregations
- 🔄 Reindex & aliases
- 🔒 Security
- 💡 Common patterns
- 📚 PowerShell helpers

## 🛠️ Scripts

### `setup.ps1`
**Mục đích:** Setup tự động toàn bộ
**Thực hiện:**
- Tạo file .env với password ngẫu nhiên
- Check Docker
- Start containers
- Wait for ready
- Show access info

**Khi nào dùng:** Lần đầu tiên setup

### `test-connection.ps1`
**Mục đích:** Kiểm tra kết nối và trạng thái
**Thực hiện:**
- Test basic connection
- Check cluster health
- List indices
- Test search API
- Show node stats

**Khi nào dùng:** Verify OpenSearch hoạt động tốt

### `create-sample-index.ps1`
**Mục đích:** Tạo index demo với dữ liệu mẫu
**Thực hiện:**
- Tạo index `bm-patients-demo`
- Insert 8 bệnh nhân mẫu
- Setup mapping đầy đủ

**Khi nào dùng:** Cần data để test queries

### `example-queries.ps1`
**Mục đích:** Học OpenSearch qua 15+ queries
**Thực hiện:**
- Match all
- Full-text search
- Bool queries
- Range queries
- Aggregations
- Sorting
- Highlighting
- và nhiều hơn...

**Khi nào dùng:** Học cách viết queries

## 🔑 Key Concepts

### Index
- Giống "database" trong SQL
- Chứa documents cùng schema
- Có mapping và settings

### Document
- Giống "row" trong SQL
- Format JSON
- Có _id duy nhất

### Mapping
- Giống "schema" trong SQL
- Define data types
- Index options

### Query DSL
- Domain Specific Language
- JSON-based
- Powerful và flexible

### Aggregations
- Analytics trên data
- Group by, stats, histogram
- Nested aggregations

## 💻 Common Tasks

### Tìm kiếm bệnh nhân theo tên
```json
GET /patients/_search
{
  "query": {
    "match": {
      "full_name": "Nguyễn"
    }
  }
}
```

### Lọc bệnh nhân theo ngày sinh
```json
GET /patients/_search
{
  "query": {
    "range": {
      "date_of_birth": {
        "gte": "1990-01-01",
        "lte": "2000-12-31"
      }
    }
  }
}
```

### Thống kê bệnh nhân theo giới tính
```json
GET /patients/_search
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

## 🔗 External Resources

- [OpenSearch Official Docs](https://opensearch.org/docs/latest/)
- [Query DSL Reference](https://opensearch.org/docs/latest/query-dsl/)
- [NestJS Elasticsearch](https://docs.nestjs.com/recipes/elasticsearch)
- [OpenSearch Forum](https://forum.opensearch.org/)

## 🆘 Support

### Gặp vấn đề?
1. Chạy `.\scripts\test-connection.ps1`
2. Check logs: `docker-compose logs opensearch`
3. Xem [README.md](./README.md) - Troubleshooting section
4. Search trong [OPENSEARCH_MASTER_GUIDE.md](./OPENSEARCH_MASTER_GUIDE.md)

### Cần giúp đỡ?
- Đọc troubleshooting guide
- Check OpenSearch logs
- Google error message
- Ask in OpenSearch forum

## ✅ Checklist

### Setup
- [ ] Đã chạy `setup.ps1`
- [ ] OpenSearch đang chạy (port 9200)
- [ ] Dashboards đang chạy (port 5601)
- [ ] Test connection thành công

### Learning
- [ ] Đọc QUICKSTART
- [ ] Tạo sample index
- [ ] Chạy example queries
- [ ] Thử nghiệm trên Dashboards
- [ ] Đọc MASTER GUIDE (sections 1-5)

### Integration
- [ ] Cài đặt @nestjs/elasticsearch
- [ ] Tạo OpenSearchModule
- [ ] Implement search service
- [ ] Setup event sync
- [ ] Test integration

### Production Ready
- [ ] Đổi admin password
- [ ] Tạo separate users
- [ ] Setup backup strategy
- [ ] Enable monitoring
- [ ] Optimize performance
- [ ] Security hardening

---

**🎉 Chúc bạn thành công với OpenSearch!**

*Bắt đầu từ: [QUICKSTART.md](./QUICKSTART.md)*

