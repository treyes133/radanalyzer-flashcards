#!/bin/bash

# Alternative method: Export image as tar file
docker save 192.168.50.20:5000/flashcards:latest | gzip > flashcards.tar.gz

echo "Image exported to flashcards.tar.gz"
echo "Transfer this file to your server and run:"
echo "gunzip -c flashcards.tar.gz | docker load"
echo "Then use the portainer-stack.yml to deploy"