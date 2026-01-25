#!/usr/bin/env bash
set -euo pipefail

# deploy/deploy.sh
# Run this on the VPS from the repository root (where this script lives).
# It builds the project, installs production deps, copies the built SPA
# into `/var/www/ndc/dist/spa`, installs the Apache site if needed,
# installs the systemd unit and restarts services.

REPO_DIR="$(pwd)"
WWW_DIR="/var/www/ndc"
SPA_DST="$WWW_DIR/dist/spa"
APACHE_SITE_NAME="ndc.conf"

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
sudo rsync -a --delete "$REPO_DIR/../dist/spa/" "$SPA_DST/"
sudo chown -R www-data:www-data "$WWW_DIR"

echo "Copying server build to $WWW_DIR/dist/server (so systemd can run Node entry)"
sudo mkdir -p "$WWW_DIR/dist/server"
if [ -d "$REPO_DIR/../dist/server" ]; then
  sudo rsync -a --delete "$REPO_DIR/../dist/server/" "$WWW_DIR/dist/server/"
else
  echo "Warning: $REPO_DIR/../dist/server not found; build may have failed or server was not built." >&2
fi
sudo chown -R www-data:www-data "$WWW_DIR/dist/server"

echo "Copying package manifests and installing production dependencies into $WWW_DIR"
# Copy package manifests so we can install runtime deps where systemd expects them
sudo cp -f "$REPO_DIR/../package.json" "$WWW_DIR/package.json"
if [ -f "$REPO_DIR/../package-lock.json" ]; then
  sudo cp -f "$REPO_DIR/../package-lock.json" "$WWW_DIR/package-lock.json"
fi
if [ -f "$REPO_DIR/pnpm-lock.yaml" ]; then
  sudo cp -f "$REPO_DIR/pnpm-lock.yaml" "$WWW_DIR/pnpm-lock.yaml"
fi

# Prefer pnpm if available, fall back to npm. Install into $WWW_DIR so node can resolve packages.
if command -v pnpm >/dev/null 2>&1; then
  echo "Using pnpm to install production deps in $WWW_DIR"
  sudo pnpm install --prod --dir "$WWW_DIR" || true
elif command -v npm >/dev/null 2>&1; then
  if [ -f "$REPO_DIR/package-lock.json" ]; then
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
if [ ! -f "/etc/systemd/system/ndc.service" ]; then
  sudo cp "$REPO_DIR/deploy/ndc.service" /etc/systemd/system/ndc.service
  sudo systemctl daemon-reload
  sudo systemctl enable ndc.service
fi

echo "Restarting node service and apache..."
sudo systemctl restart ndc.service || true
sudo systemctl reload apache2 || true

echo "Deploy finished: $(date)"
echo "Check logs: sudo journalctl -u ndc.service -f and sudo tail -n 200 /var/log/apache2/ndc_error.log"
