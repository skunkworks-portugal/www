const root = document.documentElement;
const body = document.body;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const themeButton = document.querySelector("[data-theme-toggle]");
const languageButton = document.querySelector("[data-language-toggle]");

const storedTheme = localStorage.getItem("sw-theme");
if (storedTheme === "light" || storedTheme === "dark") root.dataset.theme = storedTheme;

function currentTheme() {
  if (root.dataset.theme) return root.dataset.theme;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

themeButton?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("sw-theme", next);
});

function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  if (mobileMenu) mobileMenu.hidden = true;
  body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  if (mobileMenu) mobileMenu.hidden = open;
  body.classList.toggle("menu-open", !open);
});

mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => { if (window.innerWidth > 1040) closeMenu(); });
window.addEventListener("scroll", () => header?.classList.toggle("scrolled", window.scrollY > 8), { passive: true });

const resultContent = {
  clarity: {
    pt: ["Sessão de descoberta e roteiro", "Mapeie objetivos, dependências e riscos. Termine com prioridades claras e um primeiro passo que a equipa consegue validar."],
    en: ["Discovery session and roadmap", "Map goals, dependencies and risks. Finish with clear priorities and a first step the team can validate."]
  },
  security: {
    pt: ["Revisão de postura de segurança", "Comece por identidades, dados críticos e continuidade. Priorize as melhorias com maior redução de risco e menor fricção."],
    en: ["Security posture review", "Start with identities, critical data and continuity. Prioritise improvements that reduce the most risk with the least friction."]
  },
  flow: {
    pt: ["Mapeamento e automação de processos", "Escolha um fluxo frequente e mensurável. Remova passos desnecessários antes de automatizar o que fica."],
    en: ["Process mapping and automation", "Choose one frequent, measurable flow. Remove unnecessary steps before automating what remains."]
  },
  adoption: {
    pt: ["Sprint de adoção e capacitação", "Identifique os momentos de trabalho onde as ferramentas ajudam mais e crie práticas simples que a equipa consegue repetir."],
    en: ["Adoption and enablement sprint", "Identify the work moments where tools help most and create simple practices the team can repeat."]
  }
};

let language = localStorage.getItem("sw-language") === "en" ? "en" : "pt";

function updateAssessment() {
  const selected = document.querySelector('input[name="priority"]:checked');
  const result = document.querySelector("[data-assessment-result]");
  if (!selected || !result) return;
  const [title, copy] = resultContent[selected.value][language];
  result.querySelector("[data-result-title]").textContent = title;
  result.querySelector("[data-result-copy]").textContent = copy;
  result.hidden = false;
}

function applyLanguage(next) {
  language = next;
  root.lang = next === "pt" ? "pt-PT" : "en";
  localStorage.setItem("sw-language", next);
  document.querySelectorAll("[data-pt][data-en]").forEach((element) => {
    element.textContent = element.dataset[next];
  });
  if (languageButton) {
    languageButton.textContent = next === "pt" ? "EN" : "PT";
    languageButton.setAttribute("aria-label", next === "pt" ? "Mudar idioma para inglês" : "Switch language to Portuguese");
  }
  document.title = next === "pt"
    ? "Skunkworks Portugal — Tecnologia com propósito"
    : "Skunkworks Portugal — Technology with purpose";
  document.querySelector('meta[name="description"]')?.setAttribute(
    "content",
    next === "pt"
      ? "Skunkworks Portugal — tecnologia, cloud, segurança, automação e capacitação para equipas que querem avançar."
      : "Skunkworks Portugal—cloud, security, automation and enablement for teams ready to move forward."
  );
  document.querySelectorAll(".brand").forEach((brand) => brand.setAttribute("aria-label", next === "pt" ? "Skunkworks Portugal — início" : "Skunkworks Portugal — home"));
  document.querySelector("[data-nav-label]")?.setAttribute("aria-label", next === "pt" ? "Navegação principal" : "Primary navigation");
  menuButton?.setAttribute("aria-label", next === "pt" ? "Abrir navegação" : "Open navigation");
  themeButton?.setAttribute("aria-label", next === "pt" ? "Mudar tema" : "Change theme");
  document.querySelector(".scroll-cue")?.setAttribute("aria-label", next === "pt" ? "Descer para soluções" : "Scroll to solutions");
  document.querySelector(".mobile-menu nav")?.setAttribute("aria-label", next === "pt" ? "Navegação móvel" : "Mobile navigation");
  document.querySelector(".site-footer nav")?.setAttribute("aria-label", next === "pt" ? "Rodapé" : "Footer");
  updateAssessment();
}

languageButton?.addEventListener("click", () => applyLanguage(language === "pt" ? "en" : "pt"));
applyLanguage(language);

document.querySelectorAll('input[name="priority"]').forEach((input) => input.addEventListener("change", updateAssessment));

document.querySelector("[data-copy-result]")?.addEventListener("click", async () => {
  const selected = document.querySelector('input[name="priority"]:checked');
  const status = document.querySelector("[data-copy-status]");
  if (!selected || !status) return;
  const [title, copy] = resultContent[selected.value][language];
  const summary = `Skunkworks Portugal — ${title}\n${copy}`;
  try {
    await navigator.clipboard.writeText(summary);
    status.textContent = language === "pt" ? "Resumo copiado." : "Summary copied.";
  } catch {
    status.textContent = language === "pt" ? "Não foi possível copiar automaticamente." : "Couldn't copy automatically.";
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}
