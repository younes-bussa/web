const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Transporter mail (adapte host/port si tu n'utilises pas Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  const { nom, email, telephone, description } = req.body;

  if (!nom || (!email && !telephone) || !description) {
    return res.status(400).json({
      success: false,
      error: "Champs manquants.",
    });
  }

  const mailOptions = {
    from: `"Site Plomberie" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "Nouvelle demande depuis le site",
    text: `
Nom      : ${nom}
Email    : ${email || "Non fourni"}
Téléphone: ${telephone || "Non fourni"}

Description :
${description}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (err) {
    console.error("Erreur envoi mail :", err);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi de l'email.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("API Plomberie OK");
});

app.listen(PORT, () => {
  console.log(`Serveur backend sur port ${PORT}`);
});
