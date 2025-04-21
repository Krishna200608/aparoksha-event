# 🎉 Aparoksha Event Management 🚀

Welcome to the Aparoksha Event Management System—a 🎯 platform designed for the premier 🏆 technical event of IIITA. This project consists of a ⚛️ React frontend and a 🖥️ Node.js/Express backend.

---

## 📜 Table of Contents 📌

- [✨ Features](#features)
- [⚙️ Installation](#installation)
- [🔧 Configuration](#configuration)
- [📌 Usage](#usage)
- [🤝 Contributing](#contributing)
- [📜 License](#license)

---

## ✨ Features 🔥

- **📅 Event Management:** Organize 🎭 and manage 📋 event schedules, registrations 📝, and updates 🔄.
- **🔐 User Authentication:** Secure login 🔑 and registration 📝 with 🔄 JWT-based authentication.
- **📧 Email Notifications:** Automated ✉️ email updates 🆕 using SMTP.
- **🗄️ Database Integration:**  MySQL 🐬 for event-related data.

---

## ⚙️ Installation 🛠️

### 🌐 Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### 🔙 Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run server
   ```

---

## 🔧 Configuration 🏗️

### 🌐 Frontend `.env` Variables 📄

Create a `.env` file in the `frontend` folder and add:

```env
VITE_BACKEND_URL = 'http://localhost:4000'
VITE_RAZORPAY_KEY_ID = "your_razorpay_secret_key"

```

### 🔙 Backend `.env` Variables 📄

Create a `.env` file in the `backend` folder and add:

```env
# 🍃 MongoDB Connection
MONBODB_URI="your_mongodb_uri_here"

# 🔑 JWT Secret
JWT_SECRET="your_jwt_secret_here"

# 🌐 Environment
NODE_ENV="development"

# ✉️ SMTP Configuration
SMTP_USER="your_smtp_user_here"
SMTP_PASS="your_smtp_password_here"
SENDER_EMAIL="your_sender_email_here"

# 🐬 Database Credentials
DB_HOST="your_db_host_here"
DB_USER="your_db_user_here"
DB_PASSWORD="your_db_password_here"
DB_NAME="your_db_name_here"

# 🚪 Server Port
PORT="your_server_port_here"

# ☁️ Cloudinary Configuration
CLOUDINARY_API_KEY="your_cloudinary_api_key_here"
CLOUDINARY_SECRET_KEY="your_cloudinary_secret_key_here"
CLOUDINARY_NAME="your_cloudinary_name_here"

# 💳 Payment Gateway Keys
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
RAZORPAY_KEY_ID="your_razorpay_key_id_here"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"

# 🌍 Client Configuration
CLIENT_URL="your_client_url_here"
CURRENCY="your_currency_here"

```

*Replace all placeholder values (e.g., `your_jwt_secret_here`, `your_smtp_user_here`, etc.) with actual credentials.*

### ✉️ SMTP Setup

To get SMTP credentials, create an account on [Brevo](https://app.brevo.com/) and generate SMTP keys.

---

## 📌 Usage 🏃‍♂️

1. **🌐 Frontend:** Built with ⚛️ React. Run `npm start` from `frontend` folder to start the 🌍 development server.
2. **🔙 Backend:** Powered by 🖥️ Node.js/Express. Run `npm run server` from `backend` folder to start the API 🛜 server.

Both parts communicate via the URL specified in `VITE_BACKEND_URL` in your `.env` file. 🔄

---

## 🤝 Contributing 🛤️

Contributions are welcome! 🚀 Please follow these steps:

1. 🍴 Fork the repository.
2. 🌱 Create a new branch (`git checkout -b feature/your-feature`).
3. 📝 Commit your changes.
4. 📤 Push to the branch.
5. 🔄 Open a pull request.

---

## 📜 License 📄

📜 This project is licensed under the IIITA License. 🔖


