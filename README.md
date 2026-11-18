# HireSpot — Job Portal & Applicant Tracking System

\<p align="center">
&#x20; \<strong>A platform connecting talented candidates with the right career opportunities.\</strong>
\</p>

\<p align="center">
&#x20; \<img src="[https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black](https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square\&logo=react\&logoColor=black)" alt="React" />
&#x20; \<img src="[https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square\&logo=nodedotjs\&logoColor=white)" alt="Node.js" />
&#x20; \<img src="[https://img.shields.io/badge/Express.js-Framework-000000?style=flat-square&logo=express&logoColor=white](https://img.shields.io/badge/Express.js-Framework-000000?style=flat-square\&logo=express\&logoColor=white)" alt="Express" />
&#x20; \<img src="[https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square\&logo=mongodb\&logoColor=white)" alt="MongoDB" />
&#x20; \<img src="[https://img.shields.io/badge/Cloudinary-Cloud_Storage-3448C5?style=flat-square&logo=cloudinary&logoColor=white](https://img.shields.io/badge/Cloudinary-Cloud_Storage-3448C5?style=flat-square\&logo=cloudinary\&logoColor=white)" alt="Cloudinary" />
&#x20; \<img src="[https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat-square\&logo=tailwindcss\&logoColor=white)" alt="Tailwind CSS" />
\</p>

---

## About the Project

**HireSpot** is a full-stack Job Portal and Applicant Tracking System (ATS) designed to simplify the recruitment process for both job seekers and employers.

The platform provides a centralized environment where candidates can discover opportunities, submit applications, and track their progress, while recruiters can publish job openings and manage applicants.

HireSpot focuses on making the hiring process more organized, accessible, and efficient through role-based functionality and a clean user interface.

## Key Features

### 👤 Candidate

- Create an account and securely log in.
- Manage personal and professional profile information.
- Browse available job opportunities.
- Search and filter jobs based on relevant criteria.
- View detailed job descriptions.
- Save interesting job opportunities.
- Apply for suitable positions.
- Track submitted applications and their status.
- Upload and manage profile pictures and resumes.

### 🏢 Recruiter

- Register and access a recruiter account.
- Create and publish job opportunities.
- Edit and manage existing job postings.
- View applicants for published jobs.
- Review candidate profiles and resumes.
- Manage application stages and candidate progress.
- Add notes while reviewing applicants.

### ⚙️ Administration

- Access administrative functionality.
- Manage platform users and job listings.
- Monitor platform activity and relevant statistics.

## Technology Stack

| Category          | Technologies                                       |
| ----------------- | -------------------------------------------------- |
| Frontend          | React.js, JavaScript, HTML5, CSS3                  |
| Styling           | Tailwind CSS, CSS                                  |
| Backend           | Node.js, Express.js                                |
| Database          | MongoDB                                            |
| ODM               | Mongoose                                           |
| Authentication    | JSON Web Token (JWT), bcryptjs                     |
| File Upload       | Multer                                             |
| Cloud Storage     | Cloudinary                                         |
| Routing           | React Router                                       |
| API Communication | REST APIs                                          |
| Testing           | Vitest, React Testing Library, Node.js Test Runner |
| Development Tools | Visual Studio Code, npm, Git, GitHub               |

## Application Architecture

HireSpot follows a client-server architecture with a structured backend organization.

```text
                 HIRESPOT
                     |
          +----------+----------+
          |                     |
      FRONTEND                BACKEND
          |                     |
        React                Node.js
          |                     |
    React Router             Express.js
          |                     |
    UI Components          REST API Routes
          |                     |
    Pages & Context        Controllers
                                |
                             Models
                                |
                           Mongoose
                                |
                            MongoDB
                                |
                     Cloudinary Storage
```

### How the application works

1. The user interacts with the React frontend.
2. The frontend sends requests to the Express backend.
3. Backend routes direct requests to the appropriate controllers.
4. Controllers process business logic and interact with database models.
5. Mongoose communicates with MongoDB to manage application data.
6. Cloudinary handles supported file storage operations.
7. The backend returns responses to the frontend.

## Authentication & Security

HireSpot uses authentication and authorization mechanisms to protect application resources.

- JWT-based authentication.
- Password hashing using bcryptjs.
- Role-based access control.
- Protected routes for authenticated users.
- Middleware-based request authorization.
- Environment variables for sensitive configuration.
- Helmet and CORS for additional HTTP security configuration.

## File Storage

Cloudinary is used for cloud-based storage of supported uploaded files.

The application uses it for:

- Candidate resume uploads.
- User profile picture uploads.

Multer handles incoming file uploads before they are processed by the backend.

## API Structure

The backend exposes REST API endpoints organized by functionality.

| API Prefix          | Purpose                               |
| ------------------- | ------------------------------------- |
| `/api/auth`         | Registration and authentication       |
| `/api/profile`      | Candidate profile management          |
| `/api/jobs`         | Job creation, browsing and management |
| `/api/applications` | Job application management            |
| `/api/admin`        | Administrative operations             |
| `/api/uploads`      | File upload operations                |
| `/api/files`        | File-related operations               |

## Project Structure

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
│   ├── data/
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

*The structure above presents the main application areas; individual files may vary as the project evolves.*

## Getting Started

Follow these steps to run HireSpot locally.

### Prerequisites

Install the following:

- Node.js
- npm
- MongoDB or a MongoDB Atlas connection
- Cloudinary account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Gupta2006/HireSpot.git
```

```bash
cd HireSpot
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory.

Add the required configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the placeholder values with your own credentials. Never upload your actual `.env` file or expose secret keys on GitHub.

### 4. Start the backend

Run the development script configured in `server/package.json`.

```bash
npm run dev
```

If the project uses a different start script, use the corresponding command from `server/package.json`.

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

Open the local URL displayed in your terminal to access HireSpot.

## Testing

The project includes testing support for frontend components and backend functionality.

Testing technologies include:

- Vitest
- React Testing Library
- Node.js Test Runner

Run the test scripts configured in the respective `client/package.json` and `server/package.json` files.

## API Testing

The repository includes a Postman collection:

`HireSpot.postman_collection.json`

Import this collection into Postman to organize and test the available API endpoints.

## Security & Repository Guidelines

- Keep credentials and secrets inside environment files.
- Do not commit `.env` files.
- Do not upload `node_modules` or generated build folders.
- Use protected branches and meaningful commit messages.
- Validate requests and protect restricted routes.

## Future Improvements

Potential areas for further development include:

- Advanced job recommendation functionality.
- Improved application analytics.
- Enhanced candidate-job matching.
- Additional recruitment reporting.
- Further automated testing.

## Contributors

HireSpot is developed as a collaborative full-stack project.

| Contributor      | Primary Responsibility              |
| ---------------- | ----------------------------------- |
| Keshav           | Authentication & Security           |
| Naman Gupta      | Job Management                      |
| Parampreet Singh | Candidate & Applications            |
| Sandeep Kumar    | Recruiter, Administration & Uploads |

## Project Repository

**GitHub:** [Gupta2006/HireSpot](https://github.com/Gupta2006/HireSpot)

---

\<p align="center">   \<strong>HireSpot — Find Opportunities. Build Careers. Simplify Hiring.\</strong> \</p>

\<p align="center">   Made with dedication by the HireSpot Team. \</p>
