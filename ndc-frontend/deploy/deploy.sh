#!/usr/bin/env bash
set -euo pipefail

# deploy/deploy.sh
# Run this on the VPS from the repository root (where this script lives).
# It builds the project, installs production deps, copies the built SPA
# into `/var/www/ndc/dist/spa`, installs the Apache site if needed,
# installs the systemd unit and restarts services.

REPO_DIR="$(pwd)"
WWW_DIR="/var/www/ndc-new"
SPA_DST="$WWW_DIR/dist/spa"
APACHE_SITE_NAME="ndc-new.conf"
ENV_FILE_SOURCE="$HOME/env-files/.env.production"

echo "Deploy started: $(date)"

if [ "$(id -u)" = "0" ]; then
  echo "Do NOT run this script as root. Run as your deploy user (e.g., 'deploy' or 'ubuntu')." >&2
  exit 1
fi

echo "Installing dependencies (production) and building..."
# Prefer pnpm if available, fall back to npm
if command -v pnpm >/dev/null 2>&1; then
  echo "Using pnpm to install dependencies..."
  pnpm install
else
  echo "Using npm to install dependencies..."
  npm install
fi

echo "Building client/server artifacts..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm run build
else
  npm run build
fi

echo "Ensuring $SPA_DST exists and copying built SPA files..."
sudo mkdir -p "$SPA_DST"
sudo rsync -a --delete "dist/spa/" "$SPA_DST/"
sudo chown -R www-data:www-data "$WWW_DIR"

echo "Copying server build to $WWW_DIR/dist/server (so systemd can run Node entry)"
sudo mkdir -p "$WWW_DIR/dist/server"
if [ -d "dist/server" ]; then
  sudo rsync -a --delete "dist/server/" "$WWW_DIR/dist/server/"
else
  echo "Warning: dist/server not found; build may have failed or server was not built." >&2
fi
sudo chown -R www-data:www-data "$WWW_DIR/dist/server"

echo "Copying package manifests and installing production dependencies into $WWW_DIR"
# Copy package manifests so we can install runtime deps where systemd expects them
sudo cp -f "package.json" "$WWW_DIR/package.json"
if [ -f "package-lock.json" ]; then
  sudo cp -f "package-lock.json" "$WWW_DIR/package-lock.json"
fi
if [ -f "pnpm-lock.yaml" ]; then
  sudo cp -f "pnpm-lock.yaml" "$WWW_DIR/pnpm-lock.yaml"
fi

# Prefer pnpm if available, fall back to npm. Install into $WWW_DIR so node can resolve packages.
if command -v pnpm >/dev/null 2>&1; then
  echo "Using pnpm to install production deps in $WWW_DIR"
  sudo pnpm install --prod --dir "$WWW_DIR" || true
elif command -v npm >/dev/null 2>&1; then
  if [ -f "package-lock.json" ]; then
    echo "Running npm ci --production --prefix $WWW_DIR"
    sudo npm ci --production --prefix "$WWW_DIR" || true
  else
    echo "Running npm install --production --prefix $WWW_DIR"
    sudo npm install --production --prefix "$WWW_DIR" || true
  fi
else
  echo "Warning: neither pnpm nor npm found in PATH; skipping production dependency install." >&2
fi

sudo chown -R www-data:www-data "$WWW_DIR"

echo "Copying environment file from secure location..."
# Environment files are stored outside the git repo for security
# They should be placed in ~/env-files/.env.production on the server
if [ -f "$ENV_FILE_SOURCE" ]; then
  echo "Found $ENV_FILE_SOURCE, copying to $WWW_DIR/.env.production"
  sudo cp "$ENV_FILE_SOURCE" "$WWW_DIR/.env.production"
  sudo chown www-data:www-data "$WWW_DIR/.env.production"
  sudo chmod 600 "$WWW_DIR/.env.production"
  echo "Environment file copied successfully"
else
  echo "WARNING: $ENV_FILE_SOURCE not found!"
  echo "Please create ~/env-files/.env.production with your Supabase credentials"
  echo "Example:"
  echo "  mkdir -p ~/env-files"
  echo "  nano ~/env-files/.env.production"
  echo "  # Add your VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc."
  echo ""
  echo "Deployment will continue but the app may not work without environment variables."
fi

echo "Installing Apache site (if not present)..."
if [ ! -f "/etc/apache2/sites-available/$APACHE_SITE_NAME" ]; then
  echo "Copying deploy/apache-ndc.conf to /etc/apache2/sites-available/$APACHE_SITE_NAME"
  sudo cp "$REPO_DIR/deploy/apache-ndc.conf" "/etc/apache2/sites-available/$APACHE_SITE_NAME"
  # The apache config contains both reverse-proxy and DocumentRoot variants.
  echo "(If necessary edit /etc/apache2/sites-available/$APACHE_SITE_NAME to set ServerName and DocumentRoot.)"
  sudo a2enmod rewrite proxy proxy_http headers ssl || true
  sudo a2ensite "$APACHE_SITE_NAME" || true
  sudo systemctl reload apache2 || true
else
  echo "Apache site $APACHE_SITE_NAME already present; skipping copy."
fi

echo "Installing systemd unit..."
if [ ! -f "/etc/systemd/system/ndc-new.service" ]; then
  sudo cp "$REPO_DIR/deploy/ndc-new.service" /etc/systemd/system/ndc-new.service
  sudo systemctl daemon-reload
  sudo systemctl enable ndc-new.service
fi

echo "Restarting node service and apache..."
sudo systemctl restart ndc-new.service || true
sudo systemctl reload apache2 || true

echo "Deploy finished: $(date)"
echo "Check logs: sudo journalctl -u ndc-new.service -f and sudo tail -n 200 /var/log/apache2/ndc_error.log"
