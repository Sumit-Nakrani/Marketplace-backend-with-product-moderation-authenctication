# 🛒 Marketplace Backend with Product Moderation & Authentication

A robust REST API backend for a marketplace application built with **Node.js**, **Express**, and **MongoDB**. Features include user authentication, product management with moderation, image uploads, SMS notifications, and input validation.

---

## 🚀 Features

- 🔐 **User Authentication** — Register, Login with JWT (Bearer token + Cookie support)
- 🛡️ **Product Moderation** — Products go through a moderation pipeline before listing
- 📦 **Product Management** — CRUD operations with pagination
- 🖼️ **Image Upload** — File uploads via Multer with Sharp for image processing
- 📱 **SMS Notifications** — Twilio integration for SMS alerts
- 📧 **Email Support** — Nodemailer integration
- ✅ **Input Validation** — Joi-based schema validation
- 🍪 **Cookie-based Auth** — Secure token storage in cookies
- 🔒 **Password Hashing** — bcryptjs for secure password storage

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Primary Database |
| MySQL2 | Secondary Database |
| JWT | Authentication Tokens |
| Multer + Sharp | Image Upload & Processing |
| Twilio | SMS Notifications |
| Nodemailer | Email Notifications |
| Joi | Input Validation |
| bcryptjs | Password Hashing |

---

## 📁 Project Structure

```
├── config/          # Database & app configuration
├── controllers/     # Route handler logic
├── middleware/      # Auth, error handling, upload middleware
├── models/          # Mongoose & DB models
├── routes/          # API route definitions
├── utils/           # Helper utilities
├── validation/      # Joi validation schemas
├── public/          # Static files & uploaded images
├── server.js        # App entry point
└── package.json
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/marketplace-backend.git
cd marketplace-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4. Start the server

```bash
# Development (with nodemon)
npm start

# Production
node server.js
```

Server runs on `http://localhost:5000`

---

## 📡 API Endpoints

### 🔐 Auth Routes (`/api`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/register` | Register new user | ❌ |
| POST | `/api/login` | Login & get token | ❌ |
| GET | `/api/profile` | Get user profile | ✅ |

> **Token Auth:** Send token as `Authorization: Bearer <token>` header OR as a cookie.

### 📦 Product Routes (`/api/product`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/product` | Create new product | ✅ |
| GET | `/api/product` | Get all products | ❌ |
| GET | `/api/product/:id` | Get single product | ❌ |
| PUT | `/api/product/:id` | Update product | ✅ |
| DELETE | `/api/product/:id` | Delete product | ✅ |
| GET | `/api/product-list` | Paginated product list | ❌ |

### 📱 SMS Routes (`/api/sms`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sms/send` | Send SMS notification |

---

## 🔐 Authentication Flow

1. **Register** → POST `/api/register` with name, email, password
2. **Login** → POST `/api/login` → receives JWT token (also set in cookie, expires in 1 min)
3. **Access Protected Routes** → Send token via:
   - Header: `Authorization: Bearer <token>`
   - Cookie: automatically sent by browser

---

## 📄 Pagination

Product listing supports pagination:

```
GET /api/product-list?page=1&limit=10
```

**Response:**
```json
{
  "totalItems": 100,
  "currentPage": 1,
  "perPage": 10,
  "products": [...]
}
```

---

## 🖼️ Image Uploads

- Uploaded images are served at `/public/...`
- Processed with **Sharp** for optimization
- Handled by **Multer** middleware

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 👤 Author

Made with  by [Sumit](https://github.com/Sumit-Nakrani)
