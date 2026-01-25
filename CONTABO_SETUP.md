# Contabo VPS Setup Guide for NDC Contabo Trial

## What is Contabo?

**Contabo** is a German cloud hosting provider that offers affordable VPS (Virtual Private Server) hosting services. They provide:
- **Cloud VPS** - Virtual private servers with flexible resources
- **VDS (Virtual Dedicated Servers)** - More powerful dedicated resources
- **Object Storage** - Scalable storage solutions
- **Competitive pricing** - Often cheaper than AWS, DigitalOcean, or Linode

Contabo is ideal for hosting web applications like this NDC project because it offers:
- Full root access to your server
- Choice of operating systems (Ubuntu, Debian, CentOS, etc.)
- SSD storage options
- Multiple data center locations
- Easy scalability

---

## Step 1: Purchase a Contabo VPS

1. **Visit Contabo.com** and sign up for an account
2. **Navigate to Cloud VPS** section
3. **Choose a plan** - For this project, recommended minimum:
   - **2 vCPU cores**
   - **4GB RAM**
   - **200GB SSD** (or NVMe for better performance)
   - **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** (recommended)
4. **Select region** closest to your users
5. **Configure additional options**:
   - Auto Backup (optional but recommended)
   - Root password (save this securely!)
6. **Complete purchase** - Servers are usually provisioned within minutes to hours

---

## Step 2: Initial Server Setup

### 2.1 Access Your Server

After purchase, you'll receive an email with:
- Server IP address
- Root username (usually `root` or `ubuntu`)
- Root password
- Control Panel login credentials

**Save these credentials securely!**

### 2.2 Connect via SSH

From your local machine:

```bash
ssh root@YOUR_SERVER_IP
# or
ssh ubuntu@YOUR_SERVER_IP
```

Enter the password when prompted.

### 2.3 Initial Server Configuration

Once connected, run these commands to update and secure your server:

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential

# Create a non-root user for deployment (recommended)
adduser deploy
usermod -aG sudo deploy

# Set up SSH key authentication (more secure than password)
# On your local machine, generate SSH key if you don't have one:
# ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy your public key to the server
# On local machine:
# ssh-copy-id deploy@YOUR_SERVER_IP

# Or manually add your public key to server:
# On server, as deploy user:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key, save and exit
chmod 600 ~/.ssh/authorized_keys
```

---

## Step 3: Install Required Software

### 3.1 Install Node.js

This project requires Node.js. Install using NodeSource repository:

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install pnpm (this project uses pnpm)
npm install -g pnpm
pnpm --version
```

### 3.2 Install Apache Web Server

```bash
# Install Apache
sudo apt install -y apache2

# Enable required Apache modules
sudo a2enmod rewrite proxy proxy_http headers ssl

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

### 3.3 Install Git

```bash
# Git should already be installed, but verify:
git --version

# If not installed:
sudo apt install -y git
```

---

## Step 4: Configure Firewall

Set up UFW (Uncomplicated Firewall) to allow necessary ports:

```bash
# Install UFW if not present
sudo apt install -y ufw

# Allow SSH (important - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 5: Clone and Deploy Your Project

### 5.1 Clone Repository on Server

```bash
# Switch to deploy user (or use root if preferred)
sudo su - deploy

# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone your repository
git clone https://github.com/OraoCodes/ndc-contabo-trial.git
cd ndc-contabo-trial/ndc-frontend
```

### 5.2 Configure Environment Variables

```bash
# Copy and edit environment file
cp .env .env.production
nano .env.production
```

Update the following variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- Any other environment-specific variables

### 5.3 Run Deployment Script

The project includes a deployment script. Make it executable and run it:

```bash
# Make deploy script executable
chmod +x deploy/deploy.sh

# Run the deployment script
./deploy/deploy.sh
```

**Note:** The script expects to be run from the `ndc-frontend` directory and will:
- Install dependencies
- Build the project
- Copy files to `/var/www/ndc`
- Configure Apache
- Set up systemd service

### 5.4 Manual Deployment (Alternative)

If the script doesn't work, you can deploy manually:

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Create deployment directory
sudo mkdir -p /var/www/ndc/dist/spa
sudo mkdir -p /var/www/ndc/dist/server

# Copy built files
sudo cp -r dist/spa/* /var/www/ndc/dist/spa/
sudo cp -r dist/server/* /var/www/ndc/dist/server/

# Copy package files and install production dependencies
sudo cp package.json /var/www/ndc/
sudo cp pnpm-lock.yaml /var/www/ndc/ 2>/dev/null || true
cd /var/www/ndc
sudo pnpm install --prod

# Set permissions
sudo chown -R www-data:www-data /var/www/ndc
```

---

## Step 6: Configure Apache

### 6.1 Update Apache Configuration

Edit the Apache configuration file:

```bash
sudo nano /etc/apache2/sites-available/ndc.conf
```

Update the `ServerName` and `ServerAlias` with your domain name:

```apache
ServerName yourdomain.com
ServerAlias www.yourdomain.com
```

If you don't have a domain yet, you can use your server's IP address temporarily.

### 6.2 Enable the Site

```bash
# Enable the site
sudo a2ensite ndc.conf

# Disable default site (optional)
sudo a2dissite 000-default.conf

# Test Apache configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Step 7: Configure Systemd Service

The deployment script should have created the systemd service. Verify it:

```bash
# Check service status
sudo systemctl status ndc.service

# If not created, create it manually:
sudo cp deploy/ndc.service /etc/systemd/system/ndc.service
sudo systemctl daemon-reload
sudo systemctl enable ndc.service
sudo systemctl start ndc.service
```

---

## Step 8: Set Up Domain Name (Optional but Recommended)

### 8.1 Point Domain to Server

1. Go to your domain registrar
2. Add an A record pointing to your Contabo server IP:
   ```
   Type: A
   Name: @ (or yourdomain.com)
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```
3. Add a CNAME for www:
   ```
   Type: CNAME
   Name: www
   Value: yourdomain.com
   TTL: 3600
   ```

### 8.2 Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Apache for HTTPS
# It will also set up auto-renewal
```

---

## Step 9: Verify Deployment

### 9.1 Check Services

```bash
# Check Node.js service
sudo systemctl status ndc.service

# Check Apache
sudo systemctl status apache2

# View application logs
sudo journalctl -u ndc.service -f

# View Apache error logs
sudo tail -f /var/log/apache2/ndc_error.log
```

### 9.2 Test Application

- Visit `http://YOUR_SERVER_IP` or `http://yourdomain.com`
- Check that the application loads correctly
- Test API endpoints if applicable

---

## Step 10: Ongoing Maintenance

### 10.1 Update Application

When you make changes to your code:

```bash
# SSH into server
ssh deploy@YOUR_SERVER_IP

# Navigate to project
cd ~/projects/ndc-contabo-trial/ndc-frontend

# Pull latest changes
git pull origin main

# Run deployment script again
./deploy/deploy.sh
```

### 10.2 Monitor Logs

```bash
# Application logs
sudo journalctl -u ndc.service -n 100

# Apache access logs
sudo tail -f /var/log/apache2/ndc_access.log

# Apache error logs
sudo tail -f /var/log/apache2/ndc_error.log
```

### 10.3 Backup

Set up regular backups:

```bash
# Create backup script
nano ~/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/ndc-backup-$DATE.tar.gz /var/www/ndc
```

Make executable and add to crontab:
```bash
chmod +x ~/backup.sh
crontab -e
# Add: 0 2 * * * /home/deploy/backup.sh
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check service status
sudo systemctl status ndc.service

# Check logs
sudo journalctl -u ndc.service -n 50

# Verify Node.js is running
ps aux | grep node

# Check if port 3000 is in use
sudo netstat -tlnp | grep 3000
```

### Apache Not Serving Content

```bash
# Check Apache status
sudo systemctl status apache2

# Test Apache configuration
sudo apache2ctl configtest

# Check error logs
sudo tail -f /var/log/apache2/error.log
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/ndc

# Fix permissions
sudo chmod -R 755 /var/www/ndc
```

---

## Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
2. **Use SSH keys** instead of passwords
3. **Disable root login** via SSH (edit `/etc/ssh/sshd_config`)
4. **Set up fail2ban** to prevent brute force attacks
5. **Regular backups** of your application and database
6. **Use SSL/HTTPS** for all traffic
7. **Keep Node.js and dependencies updated**

---

## Additional Resources

- [Contabo Documentation](https://help.contabo.com/)
- [Contabo Control Panel](https://my.contabo.com/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [Apache Documentation](https://httpd.apache.org/docs/)

---

## Quick Reference Commands

```bash
# Restart services
sudo systemctl restart ndc.service
sudo systemctl restart apache2

# View logs
sudo journalctl -u ndc.service -f
sudo tail -f /var/log/apache2/ndc_error.log

# Check service status
sudo systemctl status ndc.service
sudo systemctl status apache2

# Deploy updates
cd ~/projects/ndc-contabo-trial/ndc-frontend
git pull
./deploy/deploy.sh
```

---

**Need Help?** Check the project's GitHub repository or Contabo support documentation.
