# CLAUDE.md

必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a daily report management system (日報管理システム) built with a React frontend and Spring Boot backend, designed for Japanese business environments with user roles (管理者/上長/部下).

## Architecture

- **Frontend**: React + TypeScript using Vite, Chakra UI for components
- **Backend**: Spring Boot 3.2.0 with Java 17, Maven for dependency management
- **Database**: PostgreSQL with JPA/Hibernate
- **Deployment**: Docker Compose for containerized development

## Development Commands

### Frontend (React + Vite)

```bash
cd frontend
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run    # Start Spring Boot application on port 8080
./mvnw clean compile     # Compile the project
./mvnw test              # Run tests
```

### Docker Development

```bash
# Currently only frontend is enabled in docker-compose.yml
docker-compose up frontend    # Start frontend container
docker-compose up             # Start all enabled services

# To enable full stack (uncomment services in docker-compose.yml):
docker-compose up             # Starts database, backend, and frontend
```

## Project Structure

### Frontend Architecture

- Uses Chakra UI v3 with custom theme system
- Vite configuration includes proxy to backend at `/api` -> `http://localhost:8080`
- Component structure follows UI provider pattern with color mode support
- Dependencies include React Query, React Router, React Hook Form, Jotai for state management

### Backend Architecture

- Spring Boot with web and JPA starters
- PostgreSQL integration configured
- Maven wrapper included for consistent builds
- Docker-ready with multi-stage build optimization

### Database Schema

- `users` table: id, username, email, role (管理者/上長/部下), created_at
- `daily_reports` table: id, user_id, report_date, content, next_plan, status, timestamps
- Initial seed data included for testing

## Current Development State

The project is in early development:

- Backend Java source code is not yet implemented (empty src/main/java structure)
- Frontend shows default Vite React template
- Database schema is defined but backend/database services are commented out in docker-compose.yml
- Only frontend container is currently active

## Key Technical Details

- Frontend proxy configuration handles API routing through Vite
- Docker configuration optimized for development with volume mounts
- PostgreSQL uses Japanese-friendly character encoding
- Maven configuration includes Spring Boot parent for dependency management
