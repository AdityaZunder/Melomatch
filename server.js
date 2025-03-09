const express = require("express");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Firebase initialization
const serviceAccount = require("./src/config/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Import routes
const userRoutes = require("./src/routes/user");
app.use("/api/user", userRoutes);

// Test Firebase connection
app.get("/test-firebase", async (req, res) => {
  try {
    const testDoc = db.collection("test").doc("testDoc");
    await testDoc.set({ message: "Firebase is working!" });
    const doc = await testDoc.get();
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Melo Match backend running on port ${PORT}`);
});