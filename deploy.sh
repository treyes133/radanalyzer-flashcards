#!/bin/bash

# Build for linux/amd64 platform
docker buildx build --platform linux/amd64 -t 192.168.50.20:5000/flashcards:latest . --push

echo "Image pushed to 192.168.50.20:5000/flashcards:latest"
echo "Deploy in Portainer using this image name"