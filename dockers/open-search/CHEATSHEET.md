# OpenSearch Cheat Sheet

## 🚀 Quick Commands

### Cluster Management
```bash
# Health check
GET /_cluster/health

# Cluster stats
GET /_cluster/stats

# Node info
GET /_cat/nodes?v

# Pending tasks
GET /_cluster/pending_tasks
```

### Index Management
```bash
# List all indices
GET /_cat/indices?v

# Create index
PUT /my-index

# Delete index
DELETE /my-index

# Get index info
GET /my-index

# Get mapping
GET /my-index/_mapping

# Get settings
GET /my-index/_settings

# Update settings
PUT /my-index/_settings
{
  "number_of_replicas": 1
}

# Refresh index
POST /my-index/_refresh

# Flush index
POST /my-index/_flush

# Force merge
POST /my-index/_forcemerge?max_num_segments=1

# Close index
POST /my-index/_close

# Open index
POST /my-index/_open

# Index stats
GET /my-index/_stats
```

### Document Operations
```bash
# Index document (auto ID)
POST /my-index/_doc
{
  "field": "value"
}

# Index document (custom ID)
PUT /my-index/_doc/1
{
  "field": "value"
}

# Get document
GET /my-index/_doc/1

# Update document
POST /my-index/_update/1
{
  "doc": {
    "field": "new_value"
  }
}

# Delete document
DELETE /my-index/_doc/1

# Bulk operations
POST /_bulk
{"index":{"_index":"my-index","_id":"1"}}
{"field":"value1"}
{"index":{"_index":"my-index","_id":"2"}}
{"field":"value2"}
```

### Search Queries
```bash
# Match all
GET /my-index/_search
{
  "query": {
    "match_all": {}
  }
}

# Match query
GET /my-index/_search
{
  "query": {
    "match": {
      "field": "search text"
    }
  }
}

# Term query (exact)
GET /my-index/_search
{
  "query": {
    "term": {
      "status": "active"
    }
  }
}

# Multi-match
GET /my-index/_search
{
  "query": {
    "multi_match": {
      "query": "text",
      "fields": ["field1", "field2"]
    }
  }
}

# Bool query
GET /my-index/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "field1": "value1" } }
      ],
      "filter": [
        { "term": { "status": "active" } }
      ],
      "must_not": [
        { "term": { "deleted": true } }
      ],
      "should": [
        { "match": { "field2": "value2" } }
      ]
    }
  }
}

# Range query
GET /my-index/_search
{
  "query": {
    "range": {
      "age": {
        "gte": 18,
        "lte": 65
      }
    }
  }
}

# Wildcard
GET /my-index/_search
{
  "query": {
    "wildcard": {
      "name": "jo*n"
    }
  }
}

# Exists
GET /my-index/_search
{
  "query": {
    "exists": {
      "field": "email"
    }
  }
}

# Count
GET /my-index/_count
{
  "query": {
    "match": {
      "status": "active"
    }
  }
}
```

### Aggregations
```bash
# Terms aggregation
GET /my-index/_search
{
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": {
        "field": "status"
      }
    }
  }
}

# Stats aggregation
GET /my-index/_search
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

# Date histogram
GET /my-index/_search
{
  "size": 0,
  "aggs": {
    "over_time": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "month"
      }
    }
  }
}

# Range aggregation
GET /my-index/_search
{
  "size": 0,
  "aggs": {
    "age_ranges": {
      "range": {
        "field": "age",
        "ranges": [
          { "to": 18 },
          { "from": 18, "to": 65 },
          { "from": 65 }
        ]
      }
    }
  }
}

# Nested aggregation
GET /my-index/_search
{
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": {
        "field": "status"
      },
      "aggs": {
        "avg_age": {
          "avg": {
            "field": "age"
          }
        }
      }
    }
  }
}
```

### Sorting & Pagination
```bash
# Sort
GET /my-index/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "created_at": "desc" },
    { "name.keyword": "asc" }
  ]
}

# Pagination
GET /my-index/_search
{
  "from": 0,
  "size": 20,
  "query": { "match_all": {} }
}

# Search after (for deep pagination)
GET /my-index/_search
{
  "size": 20,
  "query": { "match_all": {} },
  "search_after": [1234567890],
  "sort": [{ "created_at": "asc" }]
}
```

### Mapping
```bash
# Create index with mapping
PUT /my-index
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "age": { "type": "integer" },
      "email": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}

# Add field to mapping
PUT /my-index/_mapping
{
  "properties": {
    "new_field": {
      "type": "keyword"
    }
  }
}
```

### Reindex
```bash
# Reindex to new index
POST /_reindex
{
  "source": {
    "index": "old-index"
  },
  "dest": {
    "index": "new-index"
  }
}

# Reindex with query
POST /_reindex
{
  "source": {
    "index": "old-index",
    "query": {
      "term": {
        "status": "active"
      }
    }
  },
  "dest": {
    "index": "new-index"
  }
}
```

### Aliases
```bash
# Create alias
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "my-index-v1",
        "alias": "my-index"
      }
    }
  ]
}

# Remove alias
POST /_aliases
{
  "actions": [
    {
      "remove": {
        "index": "my-index-v1",
        "alias": "my-index"
      }
    }
  ]
}

# Switch alias (zero-downtime)
POST /_aliases
{
  "actions": [
    { "remove": { "index": "my-index-v1", "alias": "my-index" } },
    { "add": { "index": "my-index-v2", "alias": "my-index" } }
  ]
}
```

### Templates
```bash
# Create index template
PUT /_index_template/my-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "message": { "type": "text" }
      }
    }
  }
}

# List templates
GET /_index_template

# Delete template
DELETE /_index_template/my-template
```

### Snapshots
```bash
# Register repository
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups"
  }
}

# Create snapshot
PUT /_snapshot/my_backup/snapshot_1
{
  "indices": "my-index",
  "ignore_unavailable": true
}

# List snapshots
GET /_snapshot/my_backup/_all

# Restore snapshot
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "my-index"
}

# Delete snapshot
DELETE /_snapshot/my_backup/snapshot_1
```

### Security
```bash
# Create user
PUT /_plugins/_security/api/internalusers/myuser
{
  "password": "StrongPassword123!",
  "opendistro_security_roles": ["my_role"]
}

# Create role
PUT /_plugins/_security/api/roles/my_role
{
  "cluster_permissions": [],
  "index_permissions": [
    {
      "index_patterns": ["my-index*"],
      "allowed_actions": [
        "indices:data/read/*"
      ]
    }
  ]
}

# Map role to user
PUT /_plugins/_security/api/rolesmapping/my_role
{
  "users": ["myuser"]
}
```

### Analysis
```bash
# Test analyzer
GET /_analyze
{
  "analyzer": "standard",
  "text": "Quick Brown Fox"
}

# Test field analyzer
GET /my-index/_analyze
{
  "field": "my_field",
  "text": "Quick Brown Fox"
}
```

### Performance
```bash
# Explain query
GET /my-index/_search
{
  "explain": true,
  "query": {
    "match": {
      "field": "value"
    }
  }
}

# Profile query
GET /my-index/_search
{
  "profile": true,
  "query": {
    "match": {
      "field": "value"
    }
  }
}

# Segment info
GET /my-index/_segments
```

## 💡 Common Patterns

### Full-text search with filters
```json
GET /patients/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "Nguyễn",
            "fields": ["full_name", "address"]
          }
        }
      ],
      "filter": [
        {
          "range": {
            "age": { "gte": 18 }
          }
        },
        {
          "term": {
            "status": "active"
          }
        }
      ]
    }
  },
  "sort": [
    { "_score": "desc" },
    { "created_at": "desc" }
  ],
  "from": 0,
  "size": 20
}
```

### Autocomplete search
```json
GET /patients/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match_phrase_prefix": {
            "full_name": {
              "query": "Nguy",
              "max_expansions": 10
            }
          }
        },
        {
          "wildcard": {
            "full_name.keyword": "*Nguy*"
          }
        }
      ]
    }
  }
}
```

### Fuzzy search (typo tolerance)
```json
GET /patients/_search
{
  "query": {
    "match": {
      "full_name": {
        "query": "Nguyen",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

### Date range with aggregation
```json
GET /appointments/_search
{
  "query": {
    "range": {
      "appointment_date": {
        "gte": "2025-01-01",
        "lte": "2025-12-31"
      }
    }
  },
  "aggs": {
    "monthly_appointments": {
      "date_histogram": {
        "field": "appointment_date",
        "calendar_interval": "month"
      }
    }
  }
}
```

## 🔧 PowerShell Helpers

### Quick curl wrapper
```powershell
function Os-Query {
    param(
        [string]$Method = "GET",
        [string]$Path,
        [string]$Body = ""
    )
    
    $password = "YourStrongPassword123!"
    $pair = "admin:$password"
    $encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
    $headers = @{
        Authorization = "Basic $encodedCreds"
        "Content-Type" = "application/json"
    }
    
    $uri = "https://localhost:9200${Path}"
    
    if ($Body) {
        Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $Body -SkipCertificateCheck
    } else {
        Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -SkipCertificateCheck
    }
}

# Usage:
# Os-Query -Path "/_cluster/health"
# Os-Query -Method POST -Path "/my-index/_search" -Body '{"query":{"match_all":{}}}'
```

## 📚 Resources

- [Full Guide](./OPENSEARCH_MASTER_GUIDE.md)
- [OpenSearch Docs](https://opensearch.org/docs/latest/)
- [Query DSL](https://opensearch.org/docs/latest/query-dsl/)

