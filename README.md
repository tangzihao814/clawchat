# ClawChat

ClawChat is a lightweight web chat project with **admin** and **user** roles.

It is designed as a simple MVP for running a browser-based chat system where:

- regular users log in and enter their own dedicated chat session
- administrators can manage accounts, reset passwords, and control user access
- the app can be deployed behind a reverse proxy such as **Caddy**

## Features

### User side
- Username/password login
- Direct access to a bound chat session after login
- Session-aware chat page entry
- Logout support

### Admin side
- Admin login
- View all users
- Create new user accounts
- Enable / disable users
- Reset user passwords
- Enter the admin chat page

## Tech Stack

- **Node.js**
- **Express**
- **Cookie-based session auth** (in-memory)
- **JSON file storage** for user records
- **Vanilla HTML / CSS / JavaScript** frontend

## Project Structure

```text
clawchat/
├── public/
│   └── index.html
├── server.js
├── users.json
├── package.json
├── run.sh
└── README.md
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm start
```

By default it runs on:

- `HOST=0.0.0.0`
- `PORT=2000`

You can also run it with custom environment variables:

```bash
HOST=127.0.0.1 PORT=2000 OPENCLAW_BASE=https://pl.tangzh.top npm start
```

## Environment Variables

| Name | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `2000` | Service port |
| `OPENCLAW_BASE` | `https://pl.tangzh.top` | Upstream chat panel base URL |

## Authentication Model

- Sessions are stored in memory
- Login state is tracked by the `clawchat_session` cookie
- User data is stored in `users.json`
- Passwords are stored as bcrypt hashes

## API Endpoints

### Health
- `GET /api/health`

### Auth
- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id/enabled`
- `PATCH /api/admin/users/:id/password`

### Chat bootstrap
- `GET /api/chat/bootstrap`

## Deployment

A typical production setup is:

- run ClawChat as a `systemd` service
- bind it to `127.0.0.1:2000`
- expose it through **Caddy** with HTTPS

Example Caddy config:

```caddy
chat.example.com {
    encode gzip zstd
    reverse_proxy 127.0.0.1:2000
}
```

## Limitations

This repository is intentionally minimal and currently uses:

- in-memory sessions
- JSON file storage instead of a database
- a simple single-page frontend

For a larger production system, the next recommended upgrades are:

- PostgreSQL or MySQL for persistence
- Redis-backed session storage
- real message persistence
- audit logs
- invitation / registration flow
- usage quotas or billing

## Roadmap

- [ ] Persistent chat history
- [ ] Better admin dashboard
- [ ] Invite-based registration
- [ ] Role/permission expansion
- [ ] Database-backed storage
- [ ] Multi-model support

## License

Currently not specified.
