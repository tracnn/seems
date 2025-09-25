#!/bin/bash

# Script để chuyển đổi từ TypeScript về JavaScript
echo "🔄 Chuyển đổi từ TypeScript về JavaScript..."

# Cập nhật index.html để sử dụng main.js
sed -i 's|src="/src/main.ts"|src="/src/main.js"|g' index.html

echo "✅ Đã chuyển đổi index.html để sử dụng main.js"
echo "📝 Lưu ý: File main.js vẫn được giữ lại để rollback"
echo "🚀 Chạy 'npm run dev' để khởi động development server" 