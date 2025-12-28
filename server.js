const express = require("express");
const cors = require("cors");

// fetch pour Node (via node-fetch)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // remplace bodyParser.json()

// Log de contrôle au démarrage
console.log("✅ Backend démarré sur port", PORT);
console.log("RESEND_API_KEY définie ?", !!process.env.RESEND_API_KEY);
console.log("EMAIL_TO défini ?", !!process.env.EMAIL_TO);

// Endpoint API pour le formulaire
app.post("/api/contact", async (req, res) => {
  const { nom, email, telephone, description } = req.body;

  if (!nom || (!email && !telephone) || !description) {
    return res.status(400).json({
      success: false,
      error: "Champs manquants.",
    });
  }

  const payload = {
    from: "Plomberie <onboarding@resend.dev>", // adresse technique valide Resend
    to: process.env.EMAIL_TO,
    subject: "Nouvelle demande depuis le site miplomberie",
    text: `
Nom      : ${nom}
Email    : ${email || "Non fourni"}
Téléphone: ${telephone || "Non fourni"}

Description :
${description}
    `,
  };

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await resp.text();
    console.log("Réponse Resend:", resp.status, bodyText);

    if (!resp.ok) {
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'envoi de l'email.",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Erreur réseau vers Resend:", err);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi de l'email.",
    });
  }
});

// GET pour test basique
app.get("/", (req, res) => {
  res.send("API Plomberie OK");
});

app.listen(PORT, () => {
  console.log(`Serveur backend sur port ${PORT}`);
});
