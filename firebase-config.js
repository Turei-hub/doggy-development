// Doggy Development — Firebase connection details.
//
// Paste the config object Firebase gives you when you register a web app
// (SETUP.md step 3) between the braces below.
//
// These values are NOT secrets. Firebase web config is public by design — it
// identifies your project, it doesn't grant access to it. What actually guards
// your data is firestore.rules. It is fine that this file is in a public repo.
//
// Until you fill this in, the site runs in demo mode: the gallery shows the
// example dogs and the upload form politely says it isn't connected yet.

export const firebaseConfig = {
  // apiKey: "AIza...",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project",
  // storageBucket: "your-project.firebasestorage.app",
  // messagingSenderId: "000000000000",
  // appId: "1:000000000000:web:abcdef123456"
};

export const isConfigured = Boolean(firebaseConfig && firebaseConfig.projectId);
