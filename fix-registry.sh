#!/bin/bash

echo "Configuring Docker for insecure registry..."

# For macOS Docker Desktop
mkdir -p ~/.docker
cat > ~/.docker/daemon.json << EOF
{
  "insecure-registries": ["192.168.50.20:5000"]
}
EOF

echo "Docker daemon.json created at ~/.docker/daemon.json"
echo "Please restart Docker Desktop and run deploy.sh again"
echo ""
echo "Alternative: Use docker save/load method:"
echo "docker save 192.168.50.20:5000/flashcards:latest | gzip > flashcards.tar.gz"
echo "Then upload flashcards.tar.gz to your server and run:"
echo "gunzip -c flashcards.tar.gz | docker load"