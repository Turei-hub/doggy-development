// Doggy Development — Firebase connection details.
//
// These values are NOT secrets. Firebase web config is public by design — it
// identifies your project, it doesn't grant access to it. What actually guards
// your data is firestore.rules. It is fine that this file is in a public repo.
//
// From the Firebase console: Project settings → General → Your apps → website.

export const firebaseConfig = {
  apiKey: "AIzaSyDxujsSwsa4dm-s8GAh6VTnwzCRLU5qRrU",
  authDomain: "doggy-development.firebaseapp.com",
  projectId: "doggy-development",
  storageBucket: "doggy-development.firebasestorage.app",
  messagingSenderId: "168985904685",
  appId: "1:168985904685:web:7dde45a76c2da0dce61aa4"
};

export const isConfigured = Boolean(firebaseConfig && firebaseConfig.projectId);
