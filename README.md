## Trello-style Backend (NestJS)

Backend quản lý board/list/card với phân quyền và upload file, xây trên NestJS + PostgreSQL (Prisma) + Redis cache, tài liệu hóa Swagger.

### Tính năng chính
- Auth JWT: đăng ký/đăng nhập/refresh/logout.
- Quản lý board/list/card: CRUD, phân trang/lọc, tìm ảnh nền từ Unsplash.
- Mời thành viên board bằng token email, phân quyền owner/editor/viewer; gán thành viên/nhãn cho card.
- Bình luận, đính kèm file (Multer), quản lý avatar (resize bằng Sharp).
- Quản trị người dùng, profile, cập nhật avatar.

### Yêu cầu môi trường
- Node.js >= 18, PostgreSQL, Redis.
- Tạo thư mục `public/uploads/{attachments,avatars}` nếu chưa có.

### Cấu hình `.env` mẫu
```
DATABASE_URL=postgresql://user:pass@localhost:5432/trello
PORT=3000
FRONTEND_URL=http://localhost:5173
APP_NAME=Trello Backend
APP_GLOBAL_PREFIX=api
SWAGGER_ENABLE=true
SWAGGER_PATH=api-docs
SWAGGER_SERVER_URL=http://localhost:3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
REFRESH_JWT_SECRET=your_refresh_secret
REFRESH_JWT_EXPIRES_IN=7d
UNSPLASH_ACCESS_KEY=your_unsplash_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=no-reply@example.com
EMAIL_PASSWORD=your_password
```

### Cài đặt & chạy
```bash
npm install
npx prisma migrate deploy   # hoặc migrate dev lần đầu
npx prisma db seed          # nếu cần dữ liệu mẫu
npm run start:dev
```
Ứng dụng chạy tại `http://localhost:3000`, API prefix `/api` (cấu hình qua `APP_GLOBAL_PREFIX`). Swagger tại `/api-docs` khi `SWAGGER_ENABLE=true`.

### Test & chất lượng
```bash
npm run lint
npm run test
npm run test:e2e
```

### Ghi chú bảo mật/vận hành
- Đặt `SWAGGER_ENABLE=false` trên môi trường production hoặc bảo vệ bằng reverse proxy/auth.
- Giới hạn origin qua `FRONTEND_URL` (có thể truyền nhiều giá trị, cách nhau dấu phẩy).
- Cấu hình dung lượng upload trong Multer nếu triển khai công khai.
