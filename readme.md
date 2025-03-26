# 🎉 Aparoksha Event Management System 🚀

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
VITE_BACKEND_URL='http://localhost:4000'
```

### 🔙 Backend `.env` Variables 📄

Create a `.env` file in the `backend` folder and add:

```env
# 🍃 MongoDB connection
MONBODB_URI='mongodb://localhost:27017'

# 🔑 JWT Secret
JWT_SECRET='your_jwt_secret_here'

NODE_ENV='development'

# ✉️ SMTP Configuration
SMTP_USER="your_smtp_user_here"
SMTP_PASS='your_smtp_password_here'
SENDER_EMAIL="your_sender_email_here"

# 🐬 Database credentials
DB_HOST=localhost
DB_USER='your_db_user_here'
DB_PASSWORD='your_db_password_here'
DB_NAME='aparoksha'

# 🚪 Server Port
PORT=4000
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


