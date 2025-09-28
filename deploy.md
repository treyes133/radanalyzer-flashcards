# Firebase Deployment Instructions

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`

## Deploy Steps
1. Install function dependencies:
   ```bash
   cd functions
   npm install
   cd ..
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Project Configuration
- Project ID: radanalyzer-flashcards
- Hosting URL: https://radanalyzer-flashcards.web.app
- Functions URL: https://us-central1-radanalyzer-flashcards.cloudfunctions.net/app

## Firestore Setup
Ensure Firestore is enabled in the Firebase console for the radanalyzer project.