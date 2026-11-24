
<div align="center">
# HireSpot
### Find the Right Opportunity. Make the Next Move.

**A Job Portal & Applicant Tracking System**

A platform connecting talented candidates with the right career opportunities while helping recruiters manage the hiring process efficiently.

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-File_Storage-3448C5?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br/>

**Developed as a collaborative full-stack web development project.**

</div>

---

## About the Project

**HireSpot** is a full-stack job portal and applicant tracking system designed to simplify the recruitment process by bringing candidates, recruiters, and administrators together on a single platform.

Candidates can explore job opportunities, create professional profiles, upload resumes, apply for jobs, and track their application status.

Recruiters can create and manage job postings, view applicants, access candidate resumes, and manage the recruitment process.

Administrators can manage users, review job postings, monitor platform activity, and access dashboard analytics.

The project focuses on implementing practical full-stack web development concepts, including authentication, REST APIs, database management, file uploads, and role-based access control.

## Key Features

### 1. Candidate Module
- Candidate registration and login.
- Browse and search available job opportunities.
- Filter jobs based on different criteria.
- View detailed job descriptions.
- Apply for jobs with resume uploads.
- Save jobs for future reference.
- Create and update candidate profiles.
- Manage personal details, education, skills, and experience.
- Upload and manage profile pictures.
- Track submitted applications and their status.

### 2. Recruiter Module
- Recruiter registration and login.
- Manage company profile information.
- Create and publish job postings.
- Edit and manage existing job listings.
- Close or delete job postings.
- View all jobs posted by the recruiter.
- Access recruiter dashboard statistics.
- View candidates who applied for a particular job.
- Access candidate application details and resumes.
- Update application stages.
- Add notes to applications.

### 3. Admin Module
- Admin authentication.
- Admin dashboard with platform statistics.
- View and manage registered users.
- View individual user information.
- Activate or block eligible user accounts.
- Review job postings.
- Approve or reject job postings.
- Close job postings.
- View platform analytics.
- Manage admin profile information.

### 4. Additional Features
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control.
- RESTful API architecture.
- MongoDB database integration.
- Cloudinary file storage.
- Resume and profile picture management.
- Form validation and error handling.
- Responsive user interface.
- Node.js core module demonstrations.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js 19 |
| Programming Language | JavaScript (ES6+) |
| Styling | Tailwind CSS 4, CSS |
| Routing | React Router 7 |
| Build Tool | Vite 7 |
| Backend | Node.js |
| Backend Framework | Express.js 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcryptjs |
| File Upload | Multer |
| Cloud Storage | Cloudinary |
| API Validation | express-validator |
| Security | Helmet, CORS |
| Testing | Vitest, React Testing Library, Node.js Test Runner |
| API Testing | Postman |
| Version Control | Git and GitHub |

---

## Project Architecture

HireSpot follows a client-server architecture.

**Frontend (React)**

Handles the user interface, navigation, forms, dashboards, and communication with backend APIs.

**Backend (Node.js + Express)**

Handles authentication, business logic, API requests, authorization, database operations, and file uploads.

**Database (MongoDB)**

Stores application data, including users, profiles, jobs, and applications.

**Cloudinary**

Stores uploaded resumes and profile pictures.

### Application Flow

```text
                 HIRESPOT
                    |
          +---------+---------+
          |                   |
       Frontend             Backend
       (React)          (Node.js + Express)
                              |
                    +---------+---------+
                    |         |         |
                 MongoDB   Cloudinary   JWT
                    |         |         |
                 Database   Files    Authentication
```

---

## Project Structure

```text
HireSpot/
│
├── client/
│   ├── assets/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── candidate/
│   │   │   └── recruiter/
│   │   │
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── demos/
│   ├── events/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   │
│   ├── server.js
│   └── package.json
│
├── HireSpot.postman_collection.json
├── .gitignore
└── README.md
```

### Folder Description

| Folder | Purpose |
|---|---|
| client | React frontend application |
| assets | Images and other frontend assets |
| components | Reusable UI components |
| context | Authentication and shared application context |
| hooks | Custom React hooks |
| layouts | Application layouts |
| pages | Candidate, recruiter, and admin pages |
| services | API communication and utility services |
| server | Express backend application |
| config | Database configuration |
| controllers | Backend request handling and business logic |
| models | MongoDB database models |
| routes | Backend API route definitions |
| middleware | Authentication, authorization, uploads, and error handling |
| scripts | Admin setup and verification scripts |
| demos | Node.js core module demonstrations |
| events | EventEmitter implementation |
| utils | Utility functions |
| data | Local data used by demonstration modules |

---

## Database and File Storage

### MongoDB

MongoDB is used as the primary database for storing application information.

The project uses Mongoose to define schemas and interact with MongoDB.

Main database models include:

- **User:** Stores user account details, login credentials, roles, and account status.
- **Profile:** Stores candidate and recruiter profile information.
- **Job:** Stores job descriptions, requirements, recruiter information, and job status.
- **Application:** Stores candidate applications, application stages, and recruiter notes.

### Cloudinary

Cloudinary is used for cloud-based file storage.

It handles:

- Resume uploads.
- Profile picture uploads.
- File storage and retrieval.

The backend uses Multer to process uploaded files before sending them to Cloudinary.

### Authentication and Security

**JWT (JSON Web Token)**

Used to authenticate users and protect restricted API routes.

**bcryptjs**

Used to hash passwords before storing them in the database.

**Role-Based Access Control**

Ensures that candidates, recruiters, and administrators can access only the routes permitted for their roles.

**Helmet and CORS**

Used for additional HTTP security headers and cross-origin request configuration.

---

## Installation and Setup

Follow these steps to run HireSpot locally.

### Prerequisites

Make sure you have installed:

- Node.js (20 or newer recommended)
- npm
- MongoDB or MongoDB Atlas account
- Cloudinary account
- Git

Verify Node.js and npm:

```bash
node --version
npm --version
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/Gupta2006/HireSpot.git
```

Navigate to the project directory:

```bash
cd HireSpot
```

### Step 2: Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file inside the `server` directory.

Add the following configuration:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Replace the placeholder values with your actual credentials.

**Important:** Never upload your `.env` file or expose your private credentials on GitHub.

### Step 4: Start the Backend Server

From the server directory:

```bash
npm run dev
```

The backend server runs on:

```text
http://localhost:5000
```

### Step 5: Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

### Step 6: Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal.

Usually:

```text
http://localhost:5173
```

The frontend communicates with the backend through the configured Vite API proxy.

---

## API Endpoints

All backend API routes are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Authenticate user |

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/jobs | Search available jobs |
| GET | /api/jobs/:id | Get job details |
| POST | /api/jobs | Create a job |
| GET | /api/jobs/mine | Get recruiter's jobs |
| GET | /api/jobs/mine/stats | Get recruiter statistics |
| PATCH | /api/jobs/:id | Update a job |
| PATCH | /api/jobs/:id/close | Close a job |
| DELETE | /api/jobs/:id | Delete a job |
| GET | /api/jobs/:id/applicants | View job applicants |

### Applications

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/applications | Apply for a job |
| GET | /api/applications/me | Get candidate applications |
| PATCH | /api/applications/:id/stage | Update application stage |
| POST | /api/applications/:id/notes | Add application notes |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/profile/me | Get candidate profile |
| PUT | /api/profile/me | Update candidate profile |
| GET | /api/profile/recruiter/me | Get recruiter profile |
| PUT | /api/profile/recruiter/me | Update recruiter profile |
| GET | /api/profile/saved | Get saved jobs |
| POST | /api/profile/saved/:jobId | Save a job |
| DELETE | /api/profile/saved/:jobId | Remove a saved job |

### File Management

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/uploads/resume | Upload resume |
| POST | /api/uploads/profile-picture | Upload profile picture |
| DELETE | /api/uploads/profile-picture | Remove profile picture |
| GET | /api/files/:id | Access an authorized resume |
| DELETE | /api/files/:id | Remove resume |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/dashboard | Admin dashboard |
| GET | /api/admin/profile/me | Get admin profile |
| PUT | /api/admin/profile/me | Update admin profile |
| GET | /api/admin/users | List users |
| GET | /api/admin/users/:id | Get user details |
| PATCH | /api/admin/users/:id/status | Update user status |
| GET | /api/admin/jobs | List jobs |
| PATCH | /api/admin/jobs/:id/approve | Approve job |
| PATCH | /api/admin/jobs/:id/reject | Reject job |
| PATCH | /api/admin/jobs/:id/close | Close job |
| GET | /api/admin/analytics | Platform analytics |

**Note:** Protected endpoints require a valid JWT authentication token and appropriate user permissions.

---

## Job Application Workflow

The main recruitment workflow is:

1. Recruiter registers and creates a job posting.
2. The job goes through the configured job review process.
3. Approved jobs become available to candidates.
4. Candidates browse and apply for suitable jobs.
5. Recruiters view the submitted applications.
6. Recruiters review candidate details and resumes.
7. Application stages are updated as the recruitment process progresses.

### Application Stages

- Applied
- Shortlisted
- Interview
- Offered
- Rejected

---

## Admin Configuration

The project includes an admin bootstrap script.

To create or initialize the admin account:

Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`.

Then run:

```bash
cd server
npm run bootstrap:admin
```

Use the configured credentials to access the admin area.

---

## Testing and Development Commands

### Frontend Commands

Run these commands inside the `client` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm test` | Run frontend tests |
| `npm run lint` | Run ESLint |

### Backend Commands

Run these commands inside the `server` directory.

| Command | Description |
|---|---|
| `npm start` | Start backend server |
| `npm run dev` | Start server in watch mode |
| `npm test` | Run backend tests |
| `npm run lint` | Run ESLint |
| `npm run demo:core` | Run Node.js core module demonstrations |
| `npm run verify:cloudinary` | Verify Cloudinary configuration |
| `npm run verify:integration` | Run integration verification |
| `npm run bootstrap:admin` | Initialize admin account |

### Postman API Testing

A Postman collection is included in the repository:

`HireSpot.postman_collection.json`

Steps:

1. Download and install Postman.
2. Open Postman.
3. Import the `HireSpot.postman_collection.json` file.
4. Start the backend server.
5. Configure the required collection variables.
6. Register or log in to obtain an authentication token.
7. Test the available API endpoints.

---

## Team Members

HireSpot was developed collaboratively by the following team members:

| S.No. | Team Member | GitHub Branch |
|---|---|---|
| 1 | Naman Gupta | Naman |
| 2 | Keshav | Keshav |
| 3 | Parampreet | Parampreet |
| 4 | Sandeep | sandeep |

### Collaboration

The project uses Git and GitHub for collaborative development and version control.

Each team member works through an individual development branch, helping maintain organized code changes and collaboration.

**GitHub Repository:**  
[https://github.com/Gupta2006/HireSpot](https://github.com/Gupta2006/HireSpot)

---

## Future Enhancements

Potential improvements for future versions include:

- Email notifications for application updates.
- Advanced job recommendation functionality.
- Improved search and filtering.
- Enhanced application analytics.
- Additional automated testing.
- Deployment and production configuration.

---

## Security

- Passwords are stored using secure hashing.
- JWT authentication protects restricted routes.
- Role-based authorization controls access.
- Backend credentials are maintained in environment variables.
- Cloudinary credentials are kept on the server.
- Uploaded files are processed through backend upload middleware.

Never commit `.env` files, private credentials, or sensitive user information to the repository.

---

<div align="center">

## HireSpot

**Connecting Talent with Opportunities.**

Built with React, Node.js, Express, MongoDB, and Cloudinary.

<br/>

⭐ If you find this project interesting, consider giving the repository a star!

**Developed by Team HireSpot**

</div>
