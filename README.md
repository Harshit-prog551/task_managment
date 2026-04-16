# Task Management System — Full Stack

A production-ready full-stack Task Management System built with **Java Spring Boot** (backend) and **React + Tailwind CSS** (frontend).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Auth | JWT (jjwt 0.12), BCrypt |
| Database | PostgreSQL |
| Frontend | React 18, Tailwind CSS, React Router v6, Axios |
| DevOps | Docker, Docker Compose, nginx |
| Docs | Swagger / OpenAPI 3 |
| Testing | JUnit 5, Mockito |

---

## Features

- JWT-based authentication with role-based access (ADMIN / USER)
- Full task CRUD with status, priority, due date, assigned user
- Upload up to 3 PDF files per task with download support
- Filtering by status, priority, due date
- Sorting + pagination
- Admin-only user management panel
- Responsive UI with drag-and-drop file upload
- Swagger UI at `/swagger-ui.html`

---

## Project Structure

```
task-management/
├── backend/                  # Spring Boot app
│   ├── src/main/java/com/taskmanager/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # JPA repositories
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── security/         # JWT, SecurityConfig
│   │   └── exception/        # Global error handling
│   └── Dockerfile
├── frontend/                 # React app
│   ├── src/
│   │   ├── api/              # Axios API calls
│   │   ├── context/          # Auth context
│   │   ├── components/       # Reusable UI components
│   │   └── pages/            # Route pages
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## Quick Start

### Option 1 — Docker (recommended)

```bash
# Clone and start everything
git clone <repo-url>
cd task-management
docker-compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

---

### Option 2 — Run Locally

#### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+

#### 1. Database setup
```sql
CREATE DATABASE taskdb;
```

#### 2. Backend
```bash
cd backend
# Update src/main/resources/application.properties with your DB credentials
mvn spring-boot:run
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173, proxies `/api` to backend.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filter/sort/page) |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/{id}/files` | Upload PDFs (max 3) |
| GET | `/api/tasks/{taskId}/files/{fileId}/download` | Download file |
| DELETE | `/api/tasks/{taskId}/files/{fileId}` | Remove file |

### Users (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/{id}` | Update user role/email |
| DELETE | `/api/users/{id}` | Delete user |

### Query Parameters for GET /api/tasks
```
status=PENDING|IN_PROGRESS|COMPLETED
priority=LOW|MEDIUM|HIGH
dueDate=YYYY-MM-DD
sortBy=id|title|dueDate|priority|status
sortDir=asc|desc
page=0
size=10
```

---

## Environment Variables (Production)

```env
# Backend
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/taskdb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=strongpassword
JWT_SECRET=your-minimum-512-bit-secret-key
JWT_EXPIRATION=86400000
FILE_UPLOAD_DIR=/app/uploads
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

---

## Running Tests

```bash
cd backend
mvn test
```

---

## Common Interview Questions from This Project

1. **How does JWT authentication work in Spring Security?**
   → `JwtFilter` reads the `Authorization: Bearer <token>` header, validates it via `JwtUtil`, then sets the `SecurityContext`.

2. **What is the difference between `@PreAuthorize` and `SecurityConfig` authorization?**
   → `SecurityConfig` handles URL-level security; `@PreAuthorize` handles method-level with SpEL expressions.

3. **How did you handle file uploads?**
   → `MultipartFile` via `FileStorageService`, stored locally, metadata saved in DB. Max 3 per task enforced in `TaskService`.

4. **How does pagination work with JPA?**
   → `JpaRepository` + `Pageable` returns `Page<T>`. `JpaSpecificationExecutor` enables dynamic filtering with `Specification`.

5. **What is BCrypt and why use it?**
   → Adaptive hashing with salt. Cost factor makes brute-force expensive. Spring's `BCryptPasswordEncoder` handles it.

6. **How does CORS work in Spring Boot?**
   → `CorsConfigurationSource` bean in `SecurityConfig` allows specific origins, methods, and headers.

---

## License
MIT
