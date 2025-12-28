const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // remplace bodyParser.json()

// Petit check au démarrage
if (!process.env.RESEND_API_KEY || !process.env.EMAIL_TO) {
  console.warn("⚠️ RESEND_API_KEY ou EMAIL_TO non définis dans l'environnement Render.");
}

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
        from: "Plomberie <onboarding@resend.dev>",
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

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Erreur API Resend:", resp.status, txt);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'envoi de l'email.",
      });
    }

    // Tout s'est bien passé côté Resend
    return res.json({ success: true });
  } catch (err) {
    console.error("Erreur réseau vers Resend:", err);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi de l'email.",
    });
  }
});

// Pour tester rapidement l'API
app.get("/", (req, res) => {
  res.send("API Plomberie OK");
});

app.listen(PORT, () => {
  console.log(`Serveur backend sur port ${PORT}`);
});
