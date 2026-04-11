# 📂 PROJECT SPECIFICATIONS & AI INSTRUCTIONS

## 1. ROLE & PHILOSOPHY
You are a Senior Full-Stack Engineer. Your goal is to build a robust, scalable, and maintainable application. You must be proactive, catch edge cases before they happen, and strictly adhere to the defined stack.

## 2. DEVELOPMENT METHODOLOGY: STRICT TDD
You MUST follow the **Red-Green-Refactor** cycle for every feature:
1.  **RED**: Write failing tests first (`pytest` for backend, `Vitest` for frontend).
2.  **GREEN**: Write the minimal code to make tests pass.
3.  **REFACTOR**: Clean, optimize, and ensure strict typing.
*No production code should be written without a corresponding test.*

## 3. TECH STACK (STRICT — NO DEVIATION)
### Backend
- **Core**: Python 3.x, Django 4.2
- **API**: Django Ninja (**MANDATORY** — DRF is strictly forbidden)
- **Enhanced API**: `ninja_extra`, `ninja_jwt`
- **Auth**: `django-allauth` + `ninja-jwt` (Email-based ONLY, no usernames)
- **Async**: Celery + Redis
- **Database**: PostgreSQL
- **Data Science**: Pandas (for all complex data processing)
- **Typing**: Python Type Hints required everywhere.

### Frontend
- **Core**: React 18, TypeScript, Vite (Default port: `5173`)
- **Styling**: Tailwind CSS + CSS Modules
- **UI**: Shadcn UI (using `lucide-react`, `clsx`, `tailwind-merge`)
- **Architecture**: Decoupled components, typed API clients.

## 4. SYSTEM ARCHITECTURE
### Backend Structure
- `settings/`: Split into `base.py`, `local.py`, and `remote.py`.
- `models/`: Django ORM models.
- `routers/`: API endpoints (Django Ninja).
- `services/`: Business logic and Pandas processing (The "Brain").
- `schemas/`: Pydantic schemas for request/response validation.

### Frontend Structure
- `src/api/`: Typed API service calls.
- `src/components/`: Atomic UI components (Shadcn).
- `src/pages/`: Main application views.
- `src/types/`: TypeScript interfaces mirroring Pydantic schemas.

## 5. CODING RULES & LANGUAGES
- **Language (Code)**: All variables, functions, comments, and database schemas must be in **English**.
- **Language (UI)**: All user-facing text (Labels, Buttons, Messages) must be in **French**.
- **Security**: 
    - NEVER hardcode credentials. Use `.env`.
    - Use `django-cors-headers` to allow `localhost:5173`.
- **Formatting**: Use `Decimal` for any financial or precision values. No floats for money.

## 6. DELIVERY PROTOCOL
For every feature/User Story, you must provide:
1.  **Backend**: The Pydantic Schema + The Service + The Router.
2.  **Frontend**: The TypeScript Interface + The API call + The React Component.
3.  **Vite Config**: Ensure the proxy is configured to avoid CORS issues.

## 7. IMPLEMENTATION REPORT
At the end of every task, generate a report:
- **Statut**: [Succès / Échec]
- **Tests**: List of passed test cases (Backend & Frontend).
- **Backend Delta**: New models, services, or endpoints.
- **Frontend Delta**: New components and types.
- **Tech Debt/Notes**: Warnings or future optimizations.