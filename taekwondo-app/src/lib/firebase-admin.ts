import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

if (!admin.apps.length) {
  try {
    let serviceAccount: any = null;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Check if JSON string env is available
    if (serviceAccountJson && serviceAccountJson.trim().startsWith('{')) {
      serviceAccount = JSON.parse(serviceAccountJson);
    } else {
      // Fallback: load from physical file inside standalone path
      const filePath = path.join(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT credentials not found. Push notifications will not work.');
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const messaging = admin.apps.length > 0 ? admin.messaging() : null;

export async function sendPushNotification(token: string, title: string, body: string, data?: { [key: string]: string }) {
  if (!messaging) {
    console.warn('Firebase messaging is not initialized. Skipping notification to', token);
    return false;
  }
  
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };
    
    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}
