#!/bin/bash

# Script để chuyển đổi từ JavaScript về TypeScript
echo "🔄 Chuyển đổi từ JavaScript về TypeScript..."

# Cập nhật index.html để sử dụng main.ts
sed -i 's|src="/src/main.js"|src="/src/main.ts"|g' index.html

echo "✅ Đã chuyển đổi index.html để sử dụng main.ts"
echo "📝 Lưu ý: File main.js vẫn được giữ lại để rollback"
echo "🚀 Chạy 'npm run dev' để khởi động development server" 