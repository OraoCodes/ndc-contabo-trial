# Deployment Instructions for Contabo VPS

## One-Time Setup on Server

### 1. Create Environment File Storage

```bash
# Create a secure directory for environment files (outside git)
mkdir -p ~/env-files

# Create the production environment file
nano ~/env-files/.env.production
```

### 2. Add Your Credentials to .env.production

Copy these variables and replace with your actual values:

```bash
# Frontend (public - safe to expose)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend (secret - never expose!)
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

Save and exit (Ctrl+X, then Y, then Enter).

### 3. Secure the File

```bash
# Make sure only you can read it
chmod 600 ~/env-files/.env.production
```

## Deploying Updates

Every time you want to deploy new code:

```bash
# 1. Navigate to project
cd ~/projects/ndc-contabo-trial/ndc-frontend

# 2. Pull latest code from GitHub
git pull

# 3. Run the deployment script
./deploy/deploy.sh
```

**That's it!** The deployment script will automatically:
- Build the application
- Copy your environment file from `~/env-files/.env.production`
- Install dependencies
- Restart the services

## What Gets Deployed

- **Application**: `/var/www/ndc-new/`
- **Apache Config**: `/etc/apache2/sites-available/ndc-new.conf`
- **Systemd Service**: `/etc/systemd/system/ndc-new.service`
- **Port**: `3001` (Node.js API)
- **Web Access**: `http://ndc.sceju.org` (once DNS is configured)

## Checking Status

```bash
# Check if the Node.js app is running
sudo systemctl status ndc-new.service

# Check Apache
sudo systemctl status apache2

# View application logs
sudo journalctl -u ndc-new.service -f

# View Apache logs
sudo tail -f /var/log/apache2/ndc_error.log
```

## Security Notes

- **Never** commit `.env` or `.env.production` files to Git
- Keep `~/env-files/.env.production` permissions at `600`
- Environment files are automatically copied during deployment
- Your credentials stay on the server only
