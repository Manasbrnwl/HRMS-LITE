# HRMS Lite

A lightweight, modern Human Resource Management System built for tracking employees and their daily attendance.

---

## 🌟 Features

*   **Employee Management**: Add, view, and remove employees from the system. Track essential details like their Employee ID, Name, Email, and Department.
*   **Attendance Tracking**: Mark daily attendance (Present/Absent) for any registered employee.
*   **Filter & View Records**: View recent attendance history for specific employees, with the ability to filter down records to a specific date.
*   **Live Dashboard**: Get a quick overview of system metrics, such as total registered employees and today's total present count.
*   **Fully Containerized**: The entire stack, including the frontend and backend, is containerized using Docker Compose for seamless local development and deployment.
*   **Responsive UI**: A beautiful, accessible, and responsive interface built with Tailwind CSS and Shadcn UI components.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 18 powered by Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI (Radix UI primitives)
*   **Routing**: React Router DOM (v6)
*   **Icons**: Lucide React

### Backend
*   **Framework**: FastAPI (Python 3.11)
*   **Database Engine**: PostgreSQL
*   **Database Client**: `asyncpg` (raw SQL for maximum performance)
*   **Validation**: Pydantic

### Infrastructure
*   **Database Hosting**: Neon DB (Serverless Postgres)
*   **Containerization**: Docker & Docker Compose

---

## 🏗️ Architecture

The system uses a two-tier architecture running inside Docker containers:

1.  **Frontend Service (`hrms_frontend`)**: Vite development server running on port `5173`. Uses a reverse proxy setup to expose the UI.
2.  **Backend Service (`hrms_backend`)**: Uvicorn ASGI server running FastAPI on port `8000`. Connects directly to a remote Neon PostgreSQL database over the internet.

### Database Schema

The PostgreSQL database consists of two tables:
1.  **`Employee`**: Tracks `id` (UUID), `employeeId` (Unique String), `fullName`, `email`, `department`, and `createdAt`.
2.  **`Attendance`**: Tracks `id` (UUID), `employeeId` (Foreign Key), `date`, `status` (Present/Absent), and `createdAt`.
*Note: A unique constraint exists on `(employeeId, date)` to prevent duplicate attendance marks for a single employee on the same day.*

---

## 🚀 How to Run Locally

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
*   A remote PostgreSQL database URL (The `asyncpg` backend requires a standard Postgres URL. E.g., Neon DB).

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd assessment
   ```

2. **Configure Environment Variables:**
   Navigate into the `backend` folder and open the `.env` file (create it if it doesn't exist):
   ```bash
   cd backend
   ```
   Add your PostgreSQL connection string:
   ```env
   # backend/.env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```

3. **Start the containers:**
   From the root of the project (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build -d
   ```
   *The `-d` flag runs the containers in detached (background) mode.*

4. **Access the Applications:**
   *   **Frontend UI:** [http://localhost:5173](http://localhost:5173)
   *   **Backend API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

5. **Stopping the project:**
   When you're done, simply run:
   ```bash
   docker-compose down
   ```

---

## 📡 API Endpoints 

The FastAPI backend exposes the following RESTful endpoints:

*   `GET /api/dashboard` - Get metrics for the dashboard (total employees, today's attendance).
*   `GET /api/employees` - List all registered employees.
*   `POST /api/employees` - Register a new employee *(Validates unique Email and Employee ID).*
*   `DELETE /api/employees/{id}` - Delete an employee by their UUID.
*   `GET /api/attendance/{employee_id}` - Get attendance records for a single employee. Accepts an optional `?date=YYYY-MM-DD` query parameter for filtering.
*   `POST /api/attendance` - Mark attendance for an employee on a specific date.

---
