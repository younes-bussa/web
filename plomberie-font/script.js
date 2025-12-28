// Année dynamique dans le footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Défilement fluide avec prise en compte de la navbar
const OFFSET = 80; // hauteur approximative de la navbar

document.querySelectorAll('.nav a, .btn-demande, .btn-secondary').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const top = target.offsetTop - OFFSET;
    window.scrollTo({
      top,
      behavior: "smooth"
    });
  });
});

// Mise en surbrillance du lien actif
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(sec => {
    const top = window.scrollY;
    const offset = sec.offsetTop - (OFFSET + 20);
    const height = sec.offsetHeight;

    if (top >= offset && top < offset + height) {
      current = sec.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// Apparition progressive des sections (dynamique visuelle)
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".section").forEach(sec => observer.observe(sec));

// Formulaire de demande – pour l’instant côté front uniquement
const demandeForm = document.getElementById("demandeForm");
if (demandeForm) {
  const statusEl = document.getElementById("demandeStatus");

  demandeForm.addEventListener("submit", e => {
    e.preventDefault();

    // Ici, plus tard, on appellera ton backend Node.js
    statusEl.style.color = "green";
    statusEl.textContent =
      "Merci, votre demande a été enregistrée. L’envoi d’email sera activé avec le serveur Node.js.";
    demandeForm.reset();
  });
}
