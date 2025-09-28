#!/bin/bash

# Alternative: Build locally for amd64 then export
docker build --platform linux/amd64 -t flashcards:amd64 .
docker tag flashcards:amd64 192.168.50.20:5000/flashcards:latest
docker save 192.168.50.20:5000/flashcards:latest | gzip > flashcards-amd64.tar.gz

echo "AMD64 image exported to flashcards-amd64.tar.gz"
echo "Transfer to server and run: gunzip -c flashcards-amd64.tar.gz | docker load"