# 🛒 Product Store - Hệ thống quản lý sản phẩm

## 📋 Giới thiệu

**Product Store** là một ứng dụng web full-stack được xây dựng với **Nuxt 3** (Frontend) và **NestJS** (Backend). Hệ thống cho phép quản lý sản phẩm, người dùng, và tương tác realtime thông qua WebSocket.

### 🎯 Mục tiêu dự án

- Xây dựng hệ thống quản lý sản phẩm hoàn chỉnh với phân quyền User/Admin
- Tích hợp realtime notifications và live updates
- Áp dụng các best practices trong phát triển web hiện đại

---

## 🚀 Công nghệ sử dụng

### Frontend

| Công nghệ            | Phiên bản | Mô tả                        |
| -------------------- | --------- | ---------------------------- |
| **Nuxt 3**           | 4.2.1     | Framework Vue.js với SSR/SSG |
| **Vue 3**            | 3.5.24    | Composition API, Reactivity  |
| **Pinia**            | 3.0.4     | State Management             |
| **TailwindCSS**      | 4.1.17    | Utility-first CSS            |
| **Socket.io Client** | 4.8.1     | WebSocket realtime           |
| **TipTap**           | 3.11.0    | Rich Text Editor             |
| **Chart.js**         | 4.5.1     | Biểu đồ thống kê             |
| **TypeScript**       | 5.9.3     | Type-safe JavaScript         |

### Backend (NestJS)

| Công nghệ         | Mô tả                         |
| ----------------- | ----------------------------- |
| **NestJS**        | Backend framework             |
| **Prisma**        | ORM Database                  |
| **MongoDB**       | NoSQL Database                |
| **Redis**         | Caching                       |
| **Cloudflare R2** | Image Storage (S3-compatible) |
| **Socket.io**     | WebSocket Server              |
| **JWT**           | Authentication                |

---

## ✨ Tính năng chính

### 🔐 1. Authentication & Authorization

#### Đăng ký / Đăng nhập

- Đăng ký tài khoản với username, email, password
- Đăng nhập với JWT Token
- Tự động refresh session
- Phân quyền **USER** và **ADMIN**

#### Bảo mật tài khoản

- **Phát hiện Developer Tools (F12)**: Hệ thống theo dõi việc mở DevTools
- **Cảnh báo tự động**: Gửi thông báo cảnh báo khi phát hiện
- **Khóa tài khoản**: Tự động khóa sau 15 lần vi phạm/ngày
- **Modal thông báo khóa**: Hiển thị modal không thể đóng khi tài khoản bị khóa

---

### 🔒 2. Bảo vệ hình ảnh - Signed URL (Image Protection)

Hệ thống sử dụng **Cloudflare R2** kết hợp **AWS S3 Presigned URL** để bảo vệ hình ảnh sản phẩm khỏi việc bị truy cập trái phép.

#### Cơ chế hoạt động

**1. Lưu trữ hình ảnh:**

- Hình ảnh được upload lên **Cloudflare R2** (S3-compatible storage)
- Chỉ lưu `imageKey` trong database, không lưu URL trực tiếp
- Bucket R2 được cấu hình **private** - không thể truy cập công khai

**2. Tạo Signed URL:**

```typescript
// r2.service.ts
async getSignedUrl(key: string, expiresIn: number = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: this.bucket,
    Key: key,
  });
  return await getSignedUrl(this.s3Client, command, { expiresIn });
}
```

- `expiresIn: 300` = URL hết hạn sau **5 phút** (300 giây)
- Sử dụng `@aws-sdk/s3-request-presigner` để tạo chữ ký

**3. Phân quyền xem ảnh theo trạng thái sản phẩm:**

| Trạng thái  | Cách trả về URL                                |
| ----------- | ---------------------------------------------- |
| `PUBLISHED` | Public URL                                     |
| `PRIVATE`   | Signed URL                                     |
| `WHITELIST` | Signed URL + chỉ user trong whitelist xem được |

```typescript
// product.service.ts - getImageUrl()
if (product.status === ProductStatus.PUBLISHED) {
  // Trả về public URL
  return `${publicUrl}/${product.imageKey}`;
}
// Các trạng thái khác → Signed URL có thời hạn
return this.r2Service.getSignedUrl(product.imageKey, 300);
```

**4. Refresh URL khi hết hạn:**

- API endpoint: `GET /products/:id/refresh-image`
- Khi URL hết hạn 5 phút, frontend gọi API để lấy URL mới
- Kiểm tra quyền truy cập trước khi cấp URL mới

#### Lợi ích bảo mật

| Lợi ích                         | Mô tả                                                |
| ------------------------------- | ---------------------------------------------------- |
| ✅ **Chống hotlinking**         | Không thể nhúng ảnh vào website khác vì URL hết hạn  |
| ✅ **Chống download trái phép** | Copy URL ra ngoài → 5 phút sau không dùng được       |
| ✅ **Kiểm soát truy cập**       | Chỉ user có quyền mới được xem ảnh PRIVATE/WHITELIST |
| ✅ **Bảo vệ tài sản**           | Ảnh sản phẩm không bị leak ra ngoài hệ thống         |
| ✅ **Audit trail**              | Có thể log ai đã request URL nào                     |

#### Validation khi upload

```typescript
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

- Chỉ chấp nhận file ảnh hợp lệ
- Giới hạn dung lượng tối đa 5MB
- Hỗ trợ upload từ file hoặc từ URL (kể cả Google Drive)

---

### 👤 3. Phân hệ User

#### 3.1 Xem sản phẩm

- Danh sách sản phẩm với **phân trang**
- **Tìm kiếm** sản phẩm theo tên
- Xem chi tiết sản phẩm với hình ảnh

#### 3.2 Tương tác sản phẩm

- ❤️ **Like/Unlike** sản phẩm (thả tim)
- 🔖 **Save/Unsave** sản phẩm (lưu vào bookmark)
- Xem danh sách **sản phẩm đã lưu**

#### 3.3 Hệ thống bình luận (Review)

- 💬 **Viết bình luận** với Rich Text Editor (TipTap)
- ↩️ **Trả lời bình luận** (nested comments)
- 👍👎 **Like/Dislike** bình luận
- ✏️ **Sửa/Xóa** bình luận của mình
- **Realtime updates**: Bình luận mới hiển thị ngay lập tức

#### 3.4 Thông báo (Notifications)

- 🔔 **Dropdown thông báo** với badge đếm chưa đọc
- Các loại thông báo:
  - Có người **thích bình luận** của bạn
  - Có người **không thích bình luận** của bạn
  - Có người **trả lời bình luận** của bạn
  - Thông báo **cảnh báo bảo mật**
  - Thông báo **từ Admin**
- **Đánh dấu đã đọc** (từng cái hoặc tất cả)
- **Xóa thông báo**
- **Realtime**: Thông báo mới hiện ngay, xóa notification khi unlike/unsave

---

### 👨‍💼 4. Phân hệ Admin

#### 4.1 Dashboard thống kê

- 📊 **Biểu đồ tổng quan**:
  - Số lượng sản phẩm
  - Số lượng người dùng
  - Số lượng bình luận
  - Số lượng reactions
- 📈 **Chart.js** visualization

#### 4.2 Quản lý sản phẩm

- **CRUD đầy đủ**: Thêm, sửa, xóa, xem sản phẩm
- **Upload ảnh**: Từ file hoặc URL
- **Trạng thái sản phẩm**:
  - `PRIVATE`: Chỉ admin thấy
  - `WHITELIST`: Chỉ user được chọn thấy
  - `PUBLIC`: Tất cả thấy (nếu có)
- **Import Excel**: Nhập hàng loạt sản phẩm từ file Excel
- **Soft Delete**: Xóa mềm vào thùng rác
- **Thùng rác**: Khôi phục hoặc xóa vĩnh viễn
- **Quản lý bình luận**: Ẩn/hiện bình luận vi phạm

#### 4.3 Quản lý người dùng

- 📋 **Danh sách users** với phân trang
- 🔍 **Tìm kiếm** theo username/email
- 🔒 **Khóa/Mở khóa** tài khoản
- 👑 **Thay đổi role**: USER ↔ ADMIN
- Xem thông tin chi tiết user

#### 4.4 Gửi thông báo

- 📢 **Gửi thông báo hàng loạt** đến users
- Chọn người nhận cụ thể hoặc tất cả
- Soạn nội dung với HTML

#### 4.5 DevTools Logs

- 📝 **Theo dõi vi phạm** mở F12
- Xem lịch sử theo ngày
- Thống kê số lần vi phạm mỗi user

#### 4.6 Thông báo Admin nhận được

- Khi user **thích sản phẩm** → Admin nhận thông báo
- Khi user **lưu sản phẩm** → Admin nhận thông báo
- Khi user **bình luận** → Admin nhận thông báo
- Khi **bỏ thích/bỏ lưu/xóa comment** → Thông báo tự động xóa

---

### ⚡ 5. Realtime Features (WebSocket)

| Event                    | Mô tả                          |
| ------------------------ | ------------------------------ |
| `newReview`              | Bình luận mới xuất hiện ngay   |
| `reviewUpdated`          | Cập nhật like/dislike realtime |
| `reviewDeleted`          | Xóa comment realtime           |
| `notification`           | Thông báo mới                  |
| `notificationDeleted`    | Xóa thông báo realtime         |
| `productReactionUpdated` | Cập nhật like sản phẩm         |
| `productSavedUpdated`    | Cập nhật bookmark              |
| `accountBanned`          | Thông báo tài khoản bị khóa    |

---

## 📁 Cấu trúc thư mục

```
DWS-FE/
├── app/
│   ├── components/          # Vue Components
│   │   ├── core/            # Base components (Button, Modal, Input...)
│   │   ├── molecules/       # Composite components
│   │   └── organisms/       # Complex components
│   ├── composables/         # Vue Composables (hooks)
│   │   ├── useSocket.ts     # WebSocket management
│   │   ├── useNotification.ts
│   │   ├── useBannedUser.ts
│   │   └── ...
│   ├── layouts/             # Page layouts
│   │   ├── user.vue         # User layout
│   │   └── admin.vue        # Admin layout
│   ├── middleware/          # Route middleware
│   │   ├── auth.global.ts   # Auth check
│   │   ├── admin.ts         # Admin only
│   │   └── guest.ts         # Guest only
│   ├── pages/               # File-based routing
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── admin/           # Admin pages
│   │   └── user/            # User pages
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   └── user.ts
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities
│       └── api.ts           # API client
├── public/                  # Static files
├── nuxt.config.ts           # Nuxt configuration
└── package.json
```

---

## 🛠️ Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- pnpm (khuyến nghị)

### Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd DWS-FE

# Cài đặt dependencies
pnpm install
```

### Cấu hình môi trường

Tạo file `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3003/api/v1
NUXT_PUBLIC_WS_URL=http://localhost:3003
```

### Chạy Development

```bash
pnpm dev
```

Ứng dụng chạy tại: `http://localhost:3000`

### Build Production

```bash
pnpm build
pnpm preview
```

---

## 🔑 Tài khoản Demo

| Role  | Username | Password   |
| ----- | -------- | ---------- |
| Admin | `admin`  | `admin123` |
| User  | `user1`  | `user123`  |

---

## 📱 Screenshots

### User Interface

- Trang chủ sản phẩm
- Chi tiết sản phẩm với bình luận
- Dropdown thông báo
- Trang sản phẩm đã lưu

### Admin Interface

- Dashboard thống kê
- Quản lý sản phẩm
- Quản lý người dùng
- DevTools Logs

---

## 🎓 Điểm nổi bật kỹ thuật

### 1. Realtime Architecture

- WebSocket với Socket.io
- Event-driven updates
- Optimistic UI updates

### 2. State Management

- Pinia stores với persistence
- Composables pattern
- Reactive global state

### 3. Security

- JWT Authentication
- Route Guards (Middleware)
- DevTools Detection
- Auto account locking

### 4. UX/UI

- Responsive design
- Toast notifications
- Loading states
- Error handling
- Confirm dialogs

### 5. Code Quality

- TypeScript strict mode
- ESLint configuration
- Component-based architecture
- Separation of concerns

---

## 👥 Thành viên nhóm

| Họ tên  | MSSV   | Vai trò   |
| ------- | ------ | --------- |
| [Tên 1] | [MSSV] | [Vai trò] |
| [Tên 2] | [MSSV] | [Vai trò] |

---

## 📄 License

MIT License - Dự án học tập

---

## 📞 Liên hệ

- Email: [your-email]
- GitHub: [your-github]

# yarn

yarn build

# bun

bun run build

````

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
````

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
