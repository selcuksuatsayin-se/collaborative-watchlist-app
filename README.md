# 🎬 Collaborative Watchlist Platform

This is a full-stack web application built with React (Frontend) and Node.js/Express (Backend) . Follow the steps below to set up the project on your local machine.

## Demo:
https://collaborative-watchlist-app.vercel.app

## 1. Clone the Project

Open your terminal and run the following commands:

```Bash
git clone https://github.com/selcuksuatsayin-se/collaborative-watchlist-app.git
```

## 2. Backend (Server) Setup

The backend handles the database connection and API logic .

Navigate to the server folder:

Install dependencies: (Express, Mongoose, Dotenv, bcryptjs and jsonwebtoken, and CORS packages, axios)

```Bash
cd server
npm install
```

**Configure Environment Variables:** Create a file named .env in the server folder and add your credentials:

```Bash
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_api_key_here
```

## 3. Frontend (Client) Setup

The frontend is built with React and Tailwind CSS.

Navigate to the client folder: (Open a new terminal tab)

Install dependencies: (This installs Vite, Tailwind, react-toastify, axios react-router-dom and React packages)

```Bash
cd Collaborative-Watchlist-Platform
npm install
```
