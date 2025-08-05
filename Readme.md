
---

# 📝 React Blog App – Full Stack Blog Platform

A feature-rich, full-stack blogging platform with authentication, rich-text editing, image uploads, and more — built with modern web technologies.

---

## 📚 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Folder Structure](#-folder-structure)
3. [Features](#-features)
4. [Installation & Setup](#-installation--setup)
5. [Environment Variables](#-environment-variables)
6. [Scripts](#-scripts)
7. [API Overview](#-api-overview)
8. [Future Improvements](#-future-improvements)
9. [Demo](#demo)

---

## 🔧 Tech Stack

### Frontend (`react-blog-app`)

* **React + TypeScript** – UI framework with type safety
* **Tailwind CSS** – Utility-first styling
* **styled-components** – Scoped component styling
* **Slate.js** – Rich-text editor
* **Firebase Auth** – Email/password & magic link authentication
* **React Router** – SPA routing
* **Context API + Custom Providers** – App-wide state and role management
* **Cloudinary** – Image and video uploads & optimization
* **Vite** – Fast frontend bundler
* **LocalStorage** – Auto-saving blog drafts
* **Google Authentication** via Firebase


### Backend (`react-blog-app-server`)

* **Node.js + Express** – Backend server and API routes
* **MongoDB + Mongoose** – Database and ODM
* **Multer** – File upload handling
* **Cloudinary SDK** – Media upload integration
* **Nodemailer** – Email sending
* **Role-Based Access Control** – Permission handling via `role_permissions.js`

---

## 📁 Folder Structure

### Project Root

```
blog-app/
├── react-blog-app/          # Frontend
├── react-blog-app-server/   # Backend
└── README.md
```

<details>
<summary>Click to expand full structure</summary>

### Frontend (`react-blog-app`)

```
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── css/
│   ├── helper/
│   ├── pages/
│   ├── Provider/
│   ├── static/
│   ├── styled-element/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── .env
├── vite.config.ts
├── firebase.config.ts
└── tsconfig.json
```

### Backend (`react-blog-app-server`)

```
├── api/
├── controller/
├── helper/
├── model/
├── router/
├── Schema/
├── conn.js
├── db.js
├── index.js
├── role_permissions.js
├── .env
└── package.json
```

</details>

---

## ✨ Features

* 📝 Rich-text blog editor with autosave
* 🔐 Email/password and email link authentication
* 🖼️ Media uploads via Cloudinary
* 👥 Role-based access control (admin/author/user)
* 📄 Paginated blog listing
* 📬 Email notifications to subscribers,blog editors
* 🔎 Search and filter support
* 📦 Modern build system using Vite
* ⚡ Fast, responsive UI with Tailwind and styled-components
* 🌐 RESTful API with modular routing


---

## 🚀 Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/Debaraj-stha/react-blog-app.git
cd blog-app
```

### 2. Frontend Setup

```bash
cd react-blog-app
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd ../react-blog-app-server
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Frontend `.env`

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Backend `.env`

```
GMAIL_PASSWORD=
EMAIL=
CLOUNIARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MONGO_URL
```

---

## 📜 Scripts

### Frontend

```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
```

### Backend

```bash
npm run dev       # Run with nodemon
node index.js     # Run normally
```

---

## 📡 API Overview (Example Routes)

| Method | Route              | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | /api/auth/         | Register user              |
| GET    | /api/blogs         | Fetch paginated blogs      |
| POST   | /api/blogs         | Create a new blog          |
| PUT    | /api/blogs/\:id    | Edit blog post             |
| DELETE | /api/blog/\:id     | Delete blog post           |


---

## 🔮 Future Improvements

* ✅ Real-time collaboration with **Socket.io**
* 🧪 Unit & integration testing (Jest + React Testing Library)
* ✍️ Markdown support in editor
* 🌍 Internationalization (i18n)

---


##  Demo
 [Watch-video](https://www.youtube.com/watch?v=phjJOCKW2Rk)

## Update

* Setup socket on client and server for collaboration
* can send message in real time withing room members
* WebRTC setup


