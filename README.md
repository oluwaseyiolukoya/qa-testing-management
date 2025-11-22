# QA Testing Management System

A comprehensive web-based QA testing management application built with React and PHP.

## 🌟 Features

- **Project Management** - Organize test cases by projects
- **Test Case Management** - Create, edit, and track test cases
- **Test Execution** - Execute test runs and record results
- **Module Organization** - Group test cases by modules
- **Reports & Analytics** - Visualize testing metrics and trends
- **Team Management** - Manage team members and roles (Admin only)
- **Role-Based Access** - Admin, Manager, Tester, and Viewer roles

## 🚀 Quick Start

### Development

1. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend:**
   ```bash
   cd backend
   php -S localhost:8000 -t public
   ```

3. **Database:**
   - Import `database/schema.sql`
   - Run `database/seed_users.php`

### Production Deployment

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete deployment instructions to Namecheap shared hosting.

Quick reference: **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Quick deployment checklist
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Build summary and overview

## 🔐 Default Credentials

| Username | Password   | Role    |
|----------|------------|---------|
| admin    | admin123   | ADMIN   |
| tester   | tester123  | TESTER  |

**⚠️ Change these immediately after first login!**

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Recharts
- React Router
- Axios

### Backend
- PHP 8.4
- MySQL 9.5
- Custom JWT Authentication
- RESTful API

## 📁 Project Structure

```
QA_testing/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities & API clients
│   │   └── types/        # TypeScript types
│   └── dist/             # Production build
├── backend/              # PHP backend
│   ├── config/           # Configuration
│   ├── database/         # Migrations & seeds
│   ├── public/           # Public entry point
│   └── src/
│       ├── Controllers/  # API controllers
│       ├── Models/       # Database models
│       ├── Middleware/   # Auth middleware
│       └── Utils/        # Utilities
└── database/
    └── exports/          # Database exports
```

## 🌐 Live Demo

**URL:** https://qatest.cmpmediapartner.com

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Development

Built with ❤️ using modern web technologies.

---

**Version:** 1.0.0  
**Last Updated:** November 22, 2025
