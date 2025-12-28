// server.js
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== RESEND CONFIG =====
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY n'est pas définie dans les variables d'environnement.");
}
if (!process.env.EMAIL_TO) {
  console.warn("⚠️  EMAIL_TO n'est pas définie dans les variables d'environnement.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ===== ROUTES =====

// Test simple pour voir si l'API est up
app.get("/", (req, res) => {
  res.send("API Plomberie OK");
});

// Formulaire de contact
app.post("/api/contact", async (req, res) => {
  const { nom, email, telephone, description } = req.body;

  // Validation basique
  if (!nom || (!email && !telephone) || !description) {
    return res.status(400).json({
      success: false,
      error: "Champs manquants.",
    });
  }

  try {
    const result = await resend.emails.send({
      from: "Plomberie <onboarding@resend.dev>",   // expéditeur technique Resend
      to: process.env.EMAIL_TO,                    // adresse où TU reçois les mails
      subject: "Nouvelle demande depuis miplomberie",
      html: `
        <h2>Nouvelle demande client</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email || "Non fourni"}</p>
        <p><strong>Téléphone :</strong> ${telephone || "Non fourni"}</p>
        <p><strong>Description :</strong></p>
        <p>${description.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("✅ Email envoyé via Resend:", result);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur Resend:", err);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi de l'email.",
    });
  }
});

// ===== LANCEMENT SERVEUR =====
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur port ${PORT}`);
});
