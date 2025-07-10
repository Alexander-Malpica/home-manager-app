# 🏡 Home Manager App

Simplify your household management with an all-in-one platform for chores, bills, shopping lists, maintenance tracking, and more.

---

## 🚀 Features

- ✅ **Authentication** with Clerk (Sign In / Sign Up)
- 👨‍👩‍👧‍👦 Household creation & invitations
- 🧹 Chores tracking with assignees
- 🛒 Shopping list management
- 🧾 Bill tracking with payment logging
- 🛠️ Maintenance task logging
- 🔔 Notifications & activity feed
- 📊 Audit logs & role-based access
- 🌙 Light/Dark theme toggle
- 🌐 Preferences (language, timezone, etc.)

---

## 🧱 Tech Stack

- **Frontend**: Next.js 14 / React 18
- **UI**: MUI (Material UI) + Emotion
- **Auth**: Clerk.dev
- **Backend**: API Routes (Next.js) + Prisma ORM
- **Database**: PostgreSQL
- **Styling**: CSS-in-JS via Emotion
- **Deployment**: Vercel or custom

---

## 📸 Screenshots

<!-- 👉 Add your screenshots below -->
> `📷 [To be added here: App landing page, dashboard, modals, etc.]`

---

## ⚙️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Alexander-Malpica/home-manager-app.git
cd home-manager-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_CLERK_FRONTEND_API=...
```

### 4. Push Database Schema

```bash
npx prisma db push
```

### 5. Run the Dev Server

```bash
npm run dev
```

App should now be running at `http://localhost:3000`.

---

## 🗂️ Project Structure

```
├── app/
│   ├── dashboard/         // Main pages & routes
│   ├── api/               // Server-side route handlers
│   ├── lib/               // Prisma, helpers, and utils
│   └── hooks/             // Custom React hooks
├── components/            // Shared UI components
├── public/                // Static assets (logo, images)
├── theme/                 // MUI themes and context
└── prisma/                // DB schema and seed
```

---

## 🧪 Testing

You can write unit and integration tests using:
- [Jest](https://jestjs.io/) (preferred)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 📬 API Overview

- `GET /api/chores` - Fetch household chores
- `POST /api/chores` - Add new chore
- `POST /api/chores/delete` - Complete a chore
- `GET /api/notifications` - List notifications
- `POST /api/notifications/clear` - Mark all as read
- `POST /api/bills` - Add bill item
- `POST /api/bills/delete` - Mark bill as paid

➡️ For the full list of routes and logic, see the [`/app/api`](./app/api) folder.

---

## 👥 Roles & Permissions

| Role    | Can View | Can Edit | Can Invite |
|---------|----------|----------|------------|
| Owner   | ✅       | ✅       | ✅         |
| Member  | ✅       | ✅       | ❌         |
| Guest   | ✅       | ❌       | ❌         |

---

## 📌 TODO

- [ ] Add reminders for due chores/bills
- [ ] Offline support with service workers
- [ ] Push notifications
- [ ] Mobile responsive optimizations

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [Clerk.dev](https://clerk.dev) for user management
- [Prisma](https://www.prisma.io/) for database ORM
- [MUI](https://mui.com) for UI framework
