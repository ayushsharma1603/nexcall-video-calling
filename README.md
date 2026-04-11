# NexCall 🎥💬

**NexCall** is a real-time chat and video calling web application built with the MERN stack and powered by [Stream](https://getstream.io/) APIs for scalable communication.

This monorepo contains both the frontend and backend folders.

---

## 🧩 Features

- 🔐 User Authentication with JWT
- 🔐 Email OTP verification during sign-up with Brevo
- 💬 Real-time Messaging via Stream Chat API
- 📹 One-on-One and Group Video Calls using Stream Video SDK
- 🧠 Context-based State Management
- 🖼️ Responsive UI built with TailwindCSS and DaisyUI
- ⚙️ Vite-based React setup for blazing-fast performance

---

## 📁 Project Structure

```
nexcall/
├── frontend/    # React app with TailwindCSS
└── backend/     # Node.js Express API with MongoDB and JWT Auth
```

## 🛠 Tech Stack

| Area     | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React, TailwindCSS, React Query    |
| Backend  | Node.js, Express, MongoDB, JWT     |
| Realtime | Stream Chat & Video SDK            |
| Tools    | Vite, DaisyUI, Axios, Lucide Icons |

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ayushsharma1603/nexcall-video-calling.git
```

### 2. Setup Backend

```bash
cd backend
npm install
# Create a .env file with necessary variables
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 🔐 Environment Variables

```bash
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=verified_sender@yourdomain.com
BREVO_SENDER_NAME=NexCall
SIGNUP_OTP_TTL_MINUTES=10
SIGNUP_OTP_MAX_ATTEMPTS=5
VITE_STREAM_API_KEY=your_stream_api_key
```

## 🙌 Contributing

Feel free to open issues or PRs if you'd like to improve NexCall or add new features.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🔗 Connect

- [Portfolio](https://ayush-devfolio.vercel.app/)
- [LinkedIn](https://linkedin.com/in/ayush-sharma1603123)
- [GitHub](https://github.com/ayushsharma1603)

---

> Built with ❤️ by **Ayush Sharma**
