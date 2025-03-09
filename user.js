const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Use Firestore from Firebase Admin
const db = admin.firestore(); 

// Save user data
router.post("/", async (req, res) => {  
  try {
    const { userId, topSongs, imageAnalysis } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await db.collection("users").doc(userId).set({
      spotifyId: userId,
      topSongs,
      imageAnalysis,
      createdAt: new Date(),
    });

    res.json({ message: "User data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user data
router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userDoc = await db.collection("users").doc(userId).get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(userDoc.data());
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({ error: error.message });
    }
});

// Get all users
router.get("/all", async (req, res) => {
    try {
      const usersSnapshot = await db.collection("users").get();
      let users = [];
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, data: doc.data() });
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;