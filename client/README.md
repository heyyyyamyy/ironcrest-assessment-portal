# IronCrest Assessment Portal

## Local Run

**Prerequisites**

- Node.js >= 20.19 (or 22 LTS)
- npm

### Backend (API)

```bash
cd server
npm install
```

Create/update [server/.env](../server/.env):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
PORT=3000
```

Initialize DB and seed:

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

Run:

```bash
npm run dev
```

### Frontend (Web)

```bash
cd client
npm install
npm run dev
```

Open: http://localhost:5173

The frontend proxies `/api/*` to `http://localhost:3000` in development.

**Default credentials**

- Admin: `admin` / `admin123`
- Candidates: create from Admin Dashboard (it generates an `IC-XXXX` id + password)

## Deploy to VPS (Ubuntu + Nginx + Node)

This deployment serves the frontend as static files and proxies `/api/*` to the Node server.

### 1) Install system dependencies

```bash
sudo apt update
sudo apt install -y nginx git
```

Install Node.js (recommended: 22 LTS) using your preferred method (NodeSource / nvm).

### 2) Deploy backend

```bash
cd /opt
sudo git clone <YOUR_REPO_URL> ironcrest-assessment-portal
sudo chown -R $USER:$USER ironcrest-assessment-portal

cd ironcrest-assessment-portal/server
npm install
```

Create [server/.env](../server/.env) for production:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="use-a-long-random-string"
PORT=3000
```

Build and initialize DB:

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run build
```

Run the API using a process manager (example: pm2):

```bash
sudo npm i -g pm2
pm2 start dist/server.js --name ironcrest-api --cwd /opt/ironcrest-assessment-portal/server
pm2 save
pm2 startup
```

### 3) Build and deploy frontend

```bash
cd /opt/ironcrest-assessment-portal/client
npm install
npm run build
```

Copy build output to the Nginx web root:

```bash
sudo mkdir -p /var/www/ironcrest
sudo rsync -a --delete dist/ /var/www/ironcrest/
```

### 4) Configure Nginx

Create `/etc/nginx/sites-available/ironcrest`:

```nginx
server {
  server_name YOUR_DOMAIN;
  root /var/www/ironcrest;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/ironcrest /etc/nginx/sites-enabled/ironcrest
sudo nginx -t
sudo systemctl reload nginx
```

### 5) HTTPS (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

## Deploy to VPS (Ubuntu + Coolify)

This deployment runs the backend and frontend as two services in Coolify and routes them on the same domain:

- Frontend: `/`
- Backend: `/api/*`

Keeping both on the same origin avoids CORS issues (the backend disables CORS headers in production by default).

### 1) Install Coolify on the VPS

On a fresh Ubuntu VPS:

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Then open Coolify in your browser (the installer prints the URL) and finish initial setup.

### 2) Create the backend service (API)

In Coolify:

1. Create a new application from your Git repository
2. Set the root/build directory to `server`
3. Set the exposed port to `3000`

**Build command**

```bash
npm ci --include=dev && npx prisma generate && npm run build
```

**Start command**

```bash
npx prisma db push && node dist/server.js
```

**Environment variables**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=use-a-long-random-string
DATABASE_URL=file:/data/dev.db
```

**Persistent storage**

Add a persistent volume mounted at:

- `/data`

This keeps the SQLite DB file (`/data/dev.db`) across deploys.

**Health check (optional)**

Use:

- Path: `/api/health`

### 3) Create the frontend service (Web)

In Coolify:

1. Create a new application from the same Git repository
2. Set the root/build directory to `client`

**Build command**

```bash
npm ci --include=dev && npm run build
```

**Publish/output directory**

- `dist`

**Environment variables**

Leave `VITE_API_BASE_URL` unset to use the default `/api`, or set it explicitly:

```env
VITE_API_BASE_URL=/api
```

### 4) Attach domains (same domain, path-based routing)

In Coolify domains/proxy settings:

- Frontend: `https://YOUR_DOMAIN` (no path)
- Backend: `https://YOUR_DOMAIN/api` (path prefix `/api`)

Make sure the proxy forwards requests with the `/api` prefix intact (no path stripping), since the API routes are mounted under `/api`.

### 5) Verify

Open:

- `https://YOUR_DOMAIN` (frontend)
- `https://YOUR_DOMAIN/api/health` (API health)
