# Flashcards App

A modern, mobile-first flashcard application with Docker support.

## Features

- **CSV Upload**: Upload word/definition pairs via web interface
- **Study Mode**: Sequential card review with navigation
- **Endless Mode**: Random cards based on confidence scoring
- **Confidence System**: Thumbs up/down affects card frequency
- **Mobile-First**: Responsive design optimized for mobile devices
- **Modern UI**: Clean, gradient-based interface

## Setup

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create a service account:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save as `firebase-service-account.json`

### Quick Start

#### Using Docker Compose (Recommended)

```bash
# Set Firebase credentials as environment variable
export FIREBASE_SERVICE_ACCOUNT=$(cat firebase-service-account.json)
docker-compose up -d
```

Visit http://localhost:8080

#### Using Docker

```bash
docker build -t flashcards .
docker run -p 8080:3000 -e FIREBASE_SERVICE_ACCOUNT="$(cat firebase-service-account.json)" flashcards
```

#### Local Development

```bash
npm install
node server.js
```

### Firebase Emulator Suite

Use Node.js 20 (see `.nvmrc`) before starting the Emulator Suite.

```bash
# in project root
nvm use
npm install

# start emulators (hosting, firestore, functions, ui)
# the script prepares functions/venv and mirrors firebase_admin if needed
npm run emulators
```

When the emulators are running the web app is available at http://localhost:5002 and API
requests are rewritten to the local `app` Cloud Function.

## CSV Format

Create a CSV file with headers in the first row:

```csv
word,definition
hello,a greeting or expression of goodwill
world,the earth and all its inhabitants
computer,an electronic device for processing data
```

## Usage

1. Upload your CSV file using the upload button
2. Choose between Study mode (sequential) or Endless mode (random)
3. Flip cards to see definitions/words
4. In Endless mode, use thumbs up/down to adjust card frequency
5. Cards you struggle with appear more often

## Confidence Algorithm

- Thumbs up: +0.1 confidence (max 1.0)
- Thumbs down: -0.15 confidence (min 0.0)
- Lower confidence = higher probability in Endless mode
- Same card never shown twice in a row
