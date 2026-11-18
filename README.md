# HireSpot — Job Portal & Applicant Tracking System

\<p align="center">
&#x20; \<strong>A platform connecting talented candidates with the right career opportunities.\</strong>
\</p>

\<p align="center">
&#x20; ![React]\([https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react\&logoColor=black))
&#x20; ![Tailwind CSS]\([https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white))
&#x20; ![Node.js]\([https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white))
&#x20; ![Express]\([https://img.shields.io/badge/Express.js-Framework-000000?style=for-the-badge&logo=express&logoColor=white](https://img.shields.io/badge/Express.js-Framework-000000?style=for-the-badge\&logo=express\&logoColor=white))
&#x20; ![MongoDB]\([https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white))
&#x20; ![Cloudinary]\([https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=for-the-badge\&logo=cloudinary\&logoColor=white))
\</p>

---

## 🚀 About HireSpot

**HireSpot** is a full-stack Job Portal and Applicant Tracking System (ATS) designed to simplify recruitment for job seekers and employers.

Candidates can explore job opportunities, apply for positions, and track their applications. Recruiters can publish vacancies, review applicants, and manage recruitment activities through a centralized platform.

## ✨ Key Features

### 👤 Candidate

- User registration and secure login.
- Personal and professional profile management.
- Browse, search, and filter job opportunities.
- View detailed job descriptions.
- Save interesting jobs.
- Apply for available positions.
- Track application status.
- Upload resumes and profile pictures.

### 🏢 Recruiter

- Recruiter registration and login.
- Create, publish, edit, and manage job postings.
- View candidates who applied for jobs.
- Review candidate profiles and resumes.
- Manage application stages.
- Add notes while reviewing applicants.

### ⚙️ Administration

- Administrative access and management functionality.
- Manage platform users and job listings.
- Monitor relevant platform activities.

## 🛠️ Technology Stack

| Area           | Technologies                                       |
| -------------- | -------------------------------------------------- |
| Frontend       | React.js, JavaScript                               |
| Styling        | Tailwind CSS, CSS3                                 |
| Backend        | Node.js, Express.js                                |
| Database       | MongoDB, Mongoose                                  |
| Authentication | JWT, bcryptjs                                      |
| File Upload    | Multer                                             |
| Cloud Storage  | Cloudinary                                         |
| API            | REST APIs                                          |
| Testing        | Vitest, React Testing Library, Node.js Test Runner |
| Tools          | VS Code, npm, Git, GitHub                          |

## 🏗️ Application Architecture

```text
                    HIRESPOT
                       |
             +---------+---------+
             |                   |
          FRONTEND             BACKEND
             |                   |
           React              Node.js
             |                   |
       React Router           Express.js
             |                   |
       UI Components         API Routes
             |                   |
       Pages & Context       Controllers
                                 |
                               Models
                                 |
                              Mongoose
                                 |
                              MongoDB
                                 |
                         Cloudinary Storage
```

### Request Flow

1. User interacts with the React frontend.
2. Frontend sends requests to backend REST APIs.
3. Express routes direct requests to controllers.
4. Controllers handle application logic.
5. Mongoose communicates with MongoDB.
6. Cloudinary stores supported uploaded files.
7. Backend sends the response to the frontend.

## 🔐 Authentication & Security

- JWT-based authentication.
- Password hashing using bcryptjs.
- Role-based access control.
- Protected frontend and backend routes.
- Middleware-based authorization.
- Environment variables for sensitive credentials.
- HTTP security configuration using supported middleware.

## ☁️ File Storage

Cloudinary provides cloud storage for supported user uploads:

- Candidate resumes.
- User profile pictures.

Multer handles incoming file uploads before backend processing.

## 🔗 API Structure

The backend organizes REST API functionality into separate route modules.

| API Prefix          | Function                    |
| ------------------- | --------------------------- |
| `/api/auth`         | Authentication              |
| `/api/profile`      | Candidate profiles          |
| `/api/jobs`         | Job browsing and management |
| `/api/applications` | Job applications            |
| `/api/admin`        | Administration              |
| `/api/uploads`      | File uploads                |
| `/api/files`        | File operations             |

*Confirm the actual mounted routes in the backend before relying on these prefixes.*

## 📁 Project Structure

```text
HireSpot/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── candidate/
│   │   │   ├── recruiter/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── tests/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── HireSpot.postman_collection.json
```

## 💻 Getting Started

### Prerequisites

- Node.js and npm
- MongoDB or MongoDB Atlas
- Cloudinary account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Gupta2006/HireSpot.git
cd HireSpot
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Use your actual project configuration names and credentials. Never commit `.env` to GitHub.

### 4. Start the backend

Use the development command defined in `server/package.json`, for example:

```bash
npm run dev
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the local URL shown in the terminal.

## 🧪 Testing

The project includes testing support for frontend components and backend functionality.

- Vitest
- React Testing Library
- Node.js Test Runner

Run the relevant test scripts defined in the respective package files.

## 📬 API Testing with Postman

The repository includes a Postman collection:

`HireSpot.postman_collection.json`

Import it into Postman to test and organize the available API requests.

## 🔒 Repository Guidelines

- Never commit `.env` files or private credentials.
- Exclude `node_modules` and generated build folders.
- Keep commits focused and descriptive.
- Validate requests and protect restricted resources.

## 👥 Contributors

| Contributor      | Primary Responsibility              |
| ---------------- | ----------------------------------- |
| Keshav           | Authentication & Security           |
| Naman Gupta      | Job Management                      |
| Parampreet Singh | Candidate & Applications            |
| Sandeep Kumar    | Recruiter, Administration & Uploads |

## 🔗 Project Links

**GitHub Repository:** [HireSpot](https://github.com/Gupta2006/HireSpot)

---

\<p align="center">   \<strong>HireSpot — Find Opportunities. Build Careers. Simplify Hiring.\</strong> \</p>

\<p align="center">   Made with dedication by the HireSpot Team ❤️ \</p>
