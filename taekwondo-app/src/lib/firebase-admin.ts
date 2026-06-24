import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not found in environment variables. Push notifications will not work.');
      // Initialize without credentials just so it doesn't crash, but it won't be able to send
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
