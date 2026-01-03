# Dayflow — Human Resource Management System (HRMS)

Dayflow is a modern, secure, and scalable **Human Resource Management System (HRMS)** designed for hackathons, academic projects, and early-stage organizations. It centralizes essential HR operations such as employee onboarding, attendance tracking, leave management, and payroll visibility into a single, user-friendly platform.

The system is built with industry-standard architecture, role-based access control, and a clean professional UI, making it easy to present, deploy, and extend.

---

## 🚀 Project Overview

Managing HR operations manually using spreadsheets and emails leads to inefficiency, errors, and security risks. Dayflow solves this problem by providing a unified digital HR platform that automates daily HR workflows while maintaining data security and transparency.

**Target Users**
- Small and medium organizations
- Startups
- Educational institutions
- Internal HR departments

---

## 🎯 Core Features

### 🔐 Authentication & Authorization
- Secure Sign Up and Sign In
- Email verification
- JWT-based authentication
- Role-based access control (RBAC)

### 👤 Employee Features
- Personal and professional profile management
- Daily check-in and check-out
- View attendance history
- Apply for leave (Paid, Sick, Unpaid)
- Track leave approval status
- View payroll details (read-only)

### 🧑‍💼 Admin / HR Features
- Manage employees and roles
- View organization-wide attendance
- Approve or reject leave requests
- Configure payroll structure
- Generate attendance and HR reports

### ⏱ Attendance Management
- Daily attendance tracking
- Weekly and monthly summaries
- Leave-adjusted attendance calculation

---

## 🧠 System Architecture

Frontend (React)
        ↓
REST API (Node.js + Express)
        ↓
Service Layer
(Auth | Attendance | Leave | Payroll)
        ↓
Database (PostgreSQL)

---

## 🛠 Tech Stack

**Frontend:** React, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express.js, JWT, Bcrypt  
**Database:** PostgreSQL, SQLite  
**DevOps:** Docker, GitHub Actions  

---

## 📁 Project Structure

dayflow/
├── client/
├── server/
├── database/
├── setup_project.sh
├── .env.example
└── README.md

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/rud12/dayflow.git
cd dayflow
npm install
cp .env.example .env
```

---

## ▶️ Running Locally

```bash
docker run --name dayflow-postgres -e POSTGRES_DB=dayflow -e POSTGRES_USER=dayflow -e POSTGRES_PASSWORD=dayflow -p 5432:5432 -d postgres:15
npm run migrate
npm run seed
npm run dev
```

---

## 🔒 Security

- Password hashing using bcrypt
- JWT authentication
- Role-based authorization
- Secure environment variables

---

## 🚀 Future Scope

- Mobile App (React Native)
- Payroll automation
- Analytics dashboard
- Geo-fenced attendance

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Rudra Kachhia  
GitHub: https://github.com/rud12/dayflow
