const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : require('./firebase-service-account.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    return admin.firestore();
};

module.exports = { initializeFirebase };