
# Shopping Lists Manager

A full-stack web application for **collaborative shopping list management** with  **real-time updates** . The project is built with a focus on **Clean Architecture** to ensure scalability, testability, and a clear separation of concerns.

## 🚀 Technologies

### Backend

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL with TypeORM
* **Real-time:** WebSockets (Socket.IO)
* **Authentication:** JWT (JSON Web Tokens) & Argon2 (via hash-wasm)

### Frontend

* **Library:** React 18 with Vite
* **Language:** TypeScript
* **State Management:** Context API (Auth & WebSocket contexts)
* **API Client:** Axios with Interceptors
* **Styling:** Custom CSS (Utility-based approach)

---

## 🏗️ Architecture (Clean Architecture)

The backend follows **Clean Architecture** principles, divided into three distinct layers:

1. **Domain Layer:** Contains "pure" business logic, including **Entities** (User, ShoppingList, Item) and  **Repository Interfaces** . It is independent of any frameworks or databases.
2. **Application Layer:** Orchestrates business logic through **Use Cases** (e.g., `RegisterUserUseCase`, `CreateItemUseCase`) and handles data validation using  **DTOs** .
3. **Infrastructure Layer:** Handles technical details such as  **TypeORM Schemas** ,  **Database Repositories** ,  **HTTP Controllers** ,  **JWT Strategies** , and  **WebSocket Gateways** .

---

## ✨ Features

* **User Authentication:** Secure registration and login with Argon2 password hashing and JWT-protected sessions.
* **Shopping Lists:** Users can create, view, and delete shopping lists.
* **Collaborative Management:** List owners can add other users to their lists by email.
* **Item Management:** Add items to lists with quantity, units, and priority levels (Low, Medium, High). Items can be marked as purchased or pending.
* **Real-Time Sync:** Instant updates across all connected clients when items are added, updated, or deleted using WebSocket rooms.

---

## 📁 Project Structure

```
shopping-lists-manager/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── domain/         # Entities & Repository Interfaces
│   │   ├── application/    # Use Cases & DTOs
│   │   ├── infrastructure/ # Framework-specific implementations (DB, HTTP, WS)
│   │   └── modules/        # NestJS Modules
├── frontend/               # React Application
│   ├── src/
│   │   ├── api/            # Axios client & services
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth & WebSocket state management
│   │   ├── pages/          # Application views (Login, Lists, Items)
│   │   └── types/          # TypeScript global interfaces
```

---

## 🛠️ Setup and Installation

### Prerequisites

* Node.js (v22+ recommended)
* PostgreSQL database

### 1. Backend Setup

1. Navigate to the directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and configure:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=shopping_lists
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start in development mode: `npm run start:dev`

### 2. Frontend Setup

1. Navigate to the directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:3000
   ```
4. Start the development server: `npm run dev`

---

## 🔒 Security

* **CORS:** Configured to allow only specific frontend origins.
* **Authorization:** All sensitive endpoints are protected by a `JwtAuthGuard`.
* **Validation:** Strict input validation using `class-validator` pipes on the backend.
* **Data Integrity:** CASCADE DELETE ensures that removing a list automatically cleans up its members and items.
