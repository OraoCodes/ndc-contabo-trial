# Deploy NDC to Contabo

Use this guide to get the app running on a Contabo VPS and to deploy updates.

---

## Prerequisites

- A Contabo VPS (Ubuntu 22.04 or 24.04 recommended).
- SSH access (root or a user with sudo).
- Domain pointing to the VPS IP (optional; you can use the IP at first).

For **first-time server setup** (Node, Apache, firewall, user, etc.), follow **[CONTABO_SETUP.md](./CONTABO_SETUP.md)** Steps 1–4, then return here.

---

## One-time setup on the server

### 1. Clone the repo and install tooling

```bash
# As your deploy user (e.g. deploy or ubuntu), not root
sudo su - deploy   # or: ssh deploy@YOUR_SERVER_IP

mkdir -p ~/projects
cd ~/projects
git clone https://github.com/OraoCodes/ndc-contabo-trial.git
cd ndc-contabo-trial/ndc-frontend
```

### 2. Node.js and pnpm

```bash
# Node 20 (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm
```

### 3. Production env file (required for build and runtime)

```bash
mkdir -p ~/env-files
nano ~/env-files/.env.production
```

Paste and fill in your values (get these from Supabase dashboard):

```bash
# Frontend (public – embedded in build)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend (secret – server only)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Save and secure:

```bash
chmod 600 ~/env-files/.env.production
```

### 4. Apache (if not already installed)

```bash
sudo apt install -y apache2
sudo a2enmod rewrite proxy proxy_http headers ssl
sudo systemctl enable apache2
sudo systemctl start apache2
```

---

## Deploy (first time and updates)

Run from the **ndc-frontend** directory on the server:

```bash
cd ~/projects/ndc-contabo-trial/ndc-frontend

# Pull latest code (for updates)
git pull origin main

# Run the deploy script (build, copy files, install deps, restart services)
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

The script will:

- Copy `~/env-files/.env.production` for the build and into the app directory
- Install dependencies and run `pnpm run build` (or `npm run build`)
- Deploy to `/var/www/ndc-new/` (SPA + Node server)
- Install the Apache site as `ndc-new.conf` if missing
- Install and start the systemd unit `ndc-new.service`
- Restart the Node app and reload Apache

---

## After first deploy: set ServerName

Edit the Apache site and set your domain or IP:

```bash
sudo nano /etc/apache2/sites-available/ndc-new.conf
```

Change:

```apache
ServerName example.com
ServerAlias www.example.com
```

to your domain or IP, e.g.:

```apache
ServerName ndc.sceju.org
ServerAlias www.ndc.sceju.org
```

Or for IP-only:

```apache
ServerName YOUR_SERVER_IP
```

Then:

```bash
sudo a2ensite ndc-new.conf
sudo a2dissite 000-default.conf   # optional
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## Check that it’s running

```bash
# Node app (serves SPA + API on port 3000)
sudo systemctl status ndc-new.service

# Apache (proxies to Node)
sudo systemctl status apache2

# Logs
sudo journalctl -u ndc-new.service -f
sudo tail -f /var/log/apache2/ndc_error.log
```

Open in a browser: `http://YOUR_SERVER_IP` or `http://yourdomain.com`.

---

## HTTPS (recommended)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

---

## Quick reference

| Item            | Value                    |
|----------------|---------------------------|
| App directory   | `/var/www/ndc-new`        |
| Apache site     | `ndc-new.conf`            |
| Systemd unit    | `ndc-new.service`         |
| Node port       | 3000 (proxied by Apache)  |
| Env file (server) | `~/env-files/.env.production` |

**Deploy updates:**  
`cd ~/projects/ndc-contabo-trial/ndc-frontend && git pull && ./deploy/deploy.sh`
