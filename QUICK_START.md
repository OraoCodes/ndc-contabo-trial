# Quick Start Guide - Contabo Setup

## Step 1: Check if you have a VPS instance

After logging into Contabo at https://my.contabo.com:

1. **Navigate to "Servers & Hosting"** in the left sidebar
2. **Check if you see any VPS instances listed**

### Option A: You DON'T have a VPS yet

**Create a new VPS:**
1. Click **"Order"** or **"Cloud VPS"** 
2. Select a plan (minimum recommended):
   - **2 vCPU cores**
   - **4GB RAM** 
   - **200GB SSD** (or NVMe)
   - **Ubuntu 22.04 LTS** or **24.04 LTS**
3. Choose your region
4. Set a **root password** (save it securely!)
5. Complete the order
6. Wait 5-30 minutes for provisioning
7. You'll receive an email with server details

### Option B: You ALREADY have a VPS

**Get your server connection details:**
1. In "Servers & Hosting", click on your VPS instance
2. Note down:
   - **IP Address** (e.g., 123.45.67.89)
   - **Username** (usually `root` or `ubuntu`)
   - You should have the **password** from when you created it

---

## Step 2: Connect to your server

Open your terminal and connect:

```bash
# Replace YOUR_SERVER_IP with your actual IP address
ssh root@YOUR_SERVER_IP
# or if username is ubuntu:
ssh ubuntu@YOUR_SERVER_IP
```

Enter your password when prompted.

**If connection fails:**
- Make sure you're using the correct IP address
- Check that your firewall allows SSH (port 22)
- Verify the password is correct

---

## Step 3: Initial server setup (run these on the server)

Once connected via SSH, run these commands one by one:

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install essential tools
apt install -y curl wget git build-essential

# 3. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Verify Node.js
node --version
npm --version

# 5. Install pnpm (this project uses pnpm)
npm install -g pnpm
pnpm --version

# 6. Install Apache
sudo apt install -y apache2

# 7. Enable Apache modules
sudo a2enmod rewrite proxy proxy_http headers ssl

# 8. Start Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# 9. Configure firewall
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 4: Clone your project on the server

Still on the server, run:

```bash
# Create projects directory
mkdir -p ~/projects
cd ~/projects

# Clone your repository
git clone https://github.com/OraoCodes/ndc-contabo-trial.git
cd ndc-contabo-trial/ndc-frontend
```

---

## Step 5: Configure environment variables

```bash
# Copy environment file
cp .env .env.production

# Edit the file (you'll need to add your Supabase credentials)
nano .env.production
```

**Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.**

Make sure these variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Step 6: Deploy the application

```bash
# Make deploy script executable
chmod +x deploy/deploy.sh

# Run deployment
./deploy/deploy.sh
```

This will:
- Install dependencies
- Build the project
- Set up Apache configuration
- Create systemd service
- Start the application

---

## Step 7: Configure Apache with your domain/IP

```bash
# Edit Apache config
sudo nano /etc/apache2/sites-available/ndc.conf
```

Find the line `ServerName example.com` and change it to:
- Your domain name (if you have one), OR
- Your server IP address

**Example:**
```
ServerName 123.45.67.89
# or
ServerName yourdomain.com
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

```bash
# Enable the site
sudo a2ensite ndc.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Step 8: Check if everything is working

```bash
# Check Node.js service
sudo systemctl status ndc.service

# Check Apache
sudo systemctl status apache2

# View application logs
sudo journalctl -u ndc.service -n 50
```

---

## Step 9: Test your application

Open your browser and visit:
- `http://YOUR_SERVER_IP` (replace with your actual IP)

You should see your application!

---

## Troubleshooting

### Can't connect via SSH?
- Double-check the IP address
- Verify the password
- Make sure port 22 is open in Contabo firewall settings

### Service not starting?
```bash
# Check logs
sudo journalctl -u ndc.service -f

# Check if port 3000 is in use
sudo netstat -tlnp | grep 3000
```

### Apache not working?
```bash
# Check Apache logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/ndc_error.log

# Test Apache config
sudo apache2ctl configtest
```

### Permission issues?
```bash
sudo chown -R www-data:www-data /var/www/ndc
sudo chmod -R 755 /var/www/ndc
```

---

## Next Steps (Optional but Recommended)

1. **Set up SSL/HTTPS** with Let's Encrypt (see CONTABO_SETUP.md Step 8)
2. **Point your domain** to the server IP
3. **Set up automatic backups**
4. **Configure monitoring**

---

## Quick Reference

```bash
# Restart services
sudo systemctl restart ndc.service
sudo systemctl restart apache2

# View logs
sudo journalctl -u ndc.service -f
sudo tail -f /var/log/apache2/ndc_error.log

# Update application
cd ~/projects/ndc-contabo-trial/ndc-frontend
git pull
./deploy/deploy.sh
```

---

**Need more details?** See `CONTABO_SETUP.md` for the complete guide.
