from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import asyncpg
from contextlib import asynccontextmanager
import os
import uuid
from typing import List, Optional
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")

# Global connection pool
db_pool = None

async def init_db():
    # Helper to setup tables if they don't exist
    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS Employee (
                id UUID PRIMARY KEY,
                employeeId VARCHAR(255) UNIQUE NOT NULL,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                department VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS Attendance (
                id UUID PRIMARY KEY,
                employeeId UUID REFERENCES Employee(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(50) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (employeeId, date)
            );
        """)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    # Connect to PostgreSQL
    db_pool = await asyncpg.create_pool(DATABASE_URL)
    await init_db()
    yield
    # Close pool
    await db_pool.close()

app = FastAPI(title="HRMS Lite API (Postgres)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- MODELS -------------

class EmployeeCreate(BaseModel):
    employeeId: str
    fullName: str
    email: EmailStr
    department: str

class AttendanceMark(BaseModel):
    employeeId: str
    date: str
    status: str

# ------------- ROUTES -------------

@app.get("/")
def read_root():
    return {"message": "Welcome to HRMS Lite API (asyncpg raw SQL)"}

@app.get("/api/dashboard")
async def get_dashboard_metrics():
    async with db_pool.acquire() as conn:
        total_employees = await conn.fetchval("SELECT COUNT(*) FROM Employee")
        
        # Today's date
        today = datetime.now().date()
        todays_attendance = await conn.fetchval("""
            SELECT COUNT(*) FROM Attendance 
            WHERE date = $1 AND status = 'Present'
        """, today)
        
        return {
            "totalEmployees": total_employees or 0,
            "todaysAttendance": todays_attendance or 0
        }

@app.get("/api/employees")
async def get_employees():
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM Employee ORDER BY createdAt DESC")
        # Convert asyncpg.Record to dict and stringify UUID/datetime for JSON response
        return [{**dict(row), 'id': str(row['id']), 'createdAt': row['createdat'].isoformat() if row.get('createdat') else None} for row in rows]

@app.post("/api/employees", status_code=status.HTTP_201_CREATED)
async def create_employee(data: EmployeeCreate):
    new_id = uuid.uuid4()
    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO Employee (id, employeeId, fullName, email, department)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            """, new_id, data.employeeId, data.fullName, data.email, data.department)
            return {**dict(row), 'id': str(row['id'])}
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Employee ID or Email already exists.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/employees/{id}")
async def delete_employee(id: str):
    try:
        emp_uuid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
        
    async with db_pool.acquire() as conn:
        result = await conn.execute("DELETE FROM Employee WHERE id = $1", emp_uuid)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": "Employee deleted"}

@app.get("/api/attendance/{employee_id}")
async def get_attendance(employee_id: str, date: Optional[str] = None):
    try:
        emp_uuid = uuid.UUID(employee_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
        
    async with db_pool.acquire() as conn:
        if date:
            try:
                dt = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format")
            rows = await conn.fetch("""
                SELECT * FROM Attendance 
                WHERE employeeId = $1 AND date = $2
                ORDER BY date DESC
            """, emp_uuid, dt)
        else:
            rows = await conn.fetch("""
                SELECT * FROM Attendance 
                WHERE employeeId = $1 
                ORDER BY date DESC
            """, emp_uuid)
        return [{
            **dict(row), 
            'id': str(row['id']), 
            'employeeid': str(row['employeeid']),
            'date': row['date'].isoformat()
        } for row in rows]

@app.post("/api/attendance")
async def mark_attendance(data: AttendanceMark):
    try:
        dt = datetime.strptime(data.date, "%Y-%m-%d").date()
        emp_uuid = uuid.UUID(data.employeeId)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format or UUID.")
        
    if data.status not in ["Present", "Absent"]:
        raise HTTPException(status_code=400, detail="Status must be Present or Absent")
            
    new_id = uuid.uuid4()
    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO Attendance (id, employeeId, date, status)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            """, new_id, emp_uuid, dt, data.status)
            return {
                **dict(row), 
                'id': str(row['id']), 
                'employeeid': str(row['employeeid']),
                'date': row['date'].isoformat()
            }
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
