# 🎵 HaMekomon - Israeli Music Map

## 🌟 Project Overview

HaMekomon is a full-stack web application that maps Israeli musicians and bands to their geographical regions, using MongoDB for data storage, Express.js for the backend API, and a modern React frontend built with Vite and styled with HeroUI components.

The platform features:

- Interactive map of Israel with clickable regions
- Area Pages showcase artists grouped by their geographical region
- Artist profiles with biographical information, embedded spotify player and user discussions
- Voting system for artists and threaded comments (likes and dislikes)
- Bilingual support (Hebrew/English)
- User authentication and roles (Admin, Regular Users)
- Responsive design for all devices

## 🔧 Setup Instructions

### 1. Environment Files

After cloning the repository, extract the env.zip file you received alongside this project. It contains two folders:

env.zip
├── backend/
│   └── .env
└── client/
    └── .env

Move the .env files into the corresponding folders in your cloned repository and replcae MONGODB_CONNECTION_STRING in the backend `.env`.
The server will run on port 8181 by default, if you wish to change that edit VITE_BACKEND_PORT in both `.env` files.

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

## 👑 Admin Access

Default admin credentials:
```
Email: admin@hamekomon.com
Password: Admin@123!
```

### Admin Panel Features

The admin panel (`/admin`) provides:
- User management (view, delete, toggle admin status)
- Artist management (add, edit, delete)

## 🌐 Language Context

The application uses a React Context for language management.
All content of the application is available in Hebrew and English.

## 🌱 Data Seeding

On first run, if the database is empty, it will auto-seed data including:

1. 16 geographical areas
2. 331 artists (with area references)
3. 95 Users
4. Pre-generated AI comments referencing users, including reply threads 
5. Randomly generated artist and comment votes using a chosen configuration of probabilities
6. 1 admin user

## 🗺️ Map SVG Implementation

The interactive map uses SVG paths for region highlighting.

The map features:
- Hover effects with region highlighting
- Region name overlays in both languages
- Click navigation to area pages
- Responsive scaling
- Dynamic image overlays

## 🎨 HeroUI Components

The project utilizes the HeroUI template and components for a modern, consistent UI:

### Core Components Used:
- `Modal` for dialogs and forms
- `Button` with various styles
- `Input` and form controls
- `Card` for content containers
- `Navbar` for navigation
- `Avatar` for artist profiles
- `Toast` for notifications
- `Switch` for language toggle

## 📄 License
This project was created for educational purposes. You are free to explore, test, and extend it as needed for learning or grading.

