const assistantServices = [
  {
    id: "cloud",
    category: "Solução",
    title: "Cloud e produtividade",
    summary: "Colaboração, governação, adoção e otimização de ambientes de trabalho digitais.",
    href: "index.html#solucoes",
    keywords: ["cloud", "produtividade", "microsoft", "microsoft 365", "office 365", "licenciamento", "teams", "sharepoint", "email", "trabalho remoto", "colaboracao", "governacao"]
  },
  {
    id: "security",
    category: "Solução",
    title: "Segurança e resiliência",
    summary: "Identidade, acesso, proteção de dados, continuidade e prioridades de redução de risco.",
    href: "index.html#solucoes",
    keywords: ["seguranca", "zero trust", "risco", "phishing", "identidade", "acesso", "backup", "continuidade", "ciberseguranca", "protecao", "compliance"]
  },
  {
    id: "automation",
    category: "Solução",
    title: "Automação e dados",
    summary: "Mapeamento de processos, automação responsável e informação útil para decidir melhor.",
    href: "index.html#solucoes",
    keywords: ["automacao", "ia", "ai", "inteligencia artificial", "dados", "processos", "workflow", "power automate", "relatorios", "eficiencia", "manual"]
  },
  {
    id: "enablement",
    category: "Formação",
    title: "Capacitação de equipas",
    summary: "Workshops, adoção e práticas sustentáveis para aproveitar melhor a tecnologia disponível.",
    href: "index.html#solucoes",
    keywords: ["formacao", "training", "workshop", "capacitacao", "adocao", "equipa", "competencias", "aprender", "seguranca formacao"]
  },
  {
    id: "assessment",
    category: "Diagnóstico",
    title: "Encontrar o ponto de partida",
    summary: "Um diagnóstico rápido para transformar prioridades dispersas num primeiro passo claro.",
    href: "index.html#diagnostico",
    keywords: ["diagnostico", "avaliacao", "assessment", "comecar", "prioridade", "estrategia", "consultoria", "ajuda", "nao sei"]
  },
  {
    id: "partners",
    category: "Ecossistema",
    title: "Parceiros e distribuidores",
    summary: "Conheça os parceiros tecnológicos, de formação e comércio e a nossa rede de distribuição.",
    href: "index.html#parceiros",
    keywords: ["parceiros", "partner", "distribuidores", "microsoft", "google", "ibm", "shopify", "comptia", "easyfile", "also", "academy", "skunkworks africa"]
  },
  {
    id: "contact",
    category: "Contacto",
    title: "Falar com a equipa",
    summary: "Envie um pedido, fale por WhatsApp ou escolha o email certo para vendas e suporte.",
    href: "contacto.html",
    keywords: ["contacto", "contactar", "falar", "orcamento", "proposta", "preco", "vendas", "sales", "email", "telefone", "whatsapp", "santarem"]
  },
  {
    id: "store",
    category: "Loja",
    title: "Loja Skunkworks Portugal",
    summary: "Aceda à loja portuguesa para consultar as opções disponíveis.",
    href: "https://store.skunkworks.pt",
    keywords: ["loja", "shop", "comprar", "produto", "produtos", "licenca", "subscricao", "store"]
  },
  {
    id: "support",
    category: "Suporte",
    title: "Suporte ao cliente",
    summary: "Para assistência, contacte support@skunkworks.pt ou fale connosco por WhatsApp.",
    href: "mailto:support@skunkworks.pt",
    keywords: ["suporte", "support", "problema", "avaria", "assistencia", "incidente", "erro", "ajuda tecnica"]
  }
];

function assistantNormalize(value) {
  return String(value || "")
    .toLocaleLowerCase("pt-PT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assistantSearch(query) {
  const normalized = assistantNormalize(query);
  const terms = normalized.split(" ").filter((term) => term.length > 1);
  if (!terms.length) return [];

  return assistantServices
    .map((service) => {
      const haystack = assistantNormalize([service.title, service.summary, ...service.keywords].join(" "));
      let score = 0;
      if (haystack.includes(normalized)) score += 8;
      terms.forEach((term) => {
        const termPattern = new RegExp(`(?:^|\\s)${term}(?:$|\\s)`);
        const termMatches = term.length <= 3 ? termPattern.test(haystack) : haystack.includes(term);
        const title = assistantNormalize(service.title);
        const titleMatches = term.length <= 3 ? termPattern.test(title) : title.includes(term);
        if (termMatches) score += term.length > 5 ? 3 : 2;
        if (titleMatches) score += 2;
      });
      return { ...service, score };
    })
    .filter((service) => service.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function assistantResultCard(service) {
  const link = document.createElement("a");
  link.className = "search-result";
  link.href = service.href;
  if (service.href.startsWith("http")) link.rel = "noopener";
  link.innerHTML = `<small>${service.category}</small><strong>${service.title}</strong><span>${service.summary} →</span>`;
  return link;
}

const serviceSearchForm = document.querySelector("[data-service-search]");
const serviceSearchResults = document.querySelector("[data-search-results]");

function runServiceSearch(query) {
  if (!serviceSearchResults) return;
  const matches = assistantSearch(query);
  serviceSearchResults.replaceChildren();
  const intro = document.createElement("p");
  intro.textContent = matches.length
    ? `Encontrámos ${matches.length === 1 ? "uma opção relevante" : `${matches.length} opções relevantes`} para “${query}”.`
    : `Não encontrámos uma correspondência exata para “${query}”. Experimente uma destas opções.`;
  serviceSearchResults.append(intro);

  const grid = document.createElement("div");
  grid.className = "search-result-grid";
  const items = matches.length ? matches : assistantServices.slice(0, 3);
  items.forEach((service) => grid.append(assistantResultCard(service)));
  serviceSearchResults.append(grid);
  serviceSearchResults.hidden = false;
}

serviceSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = serviceSearchForm.querySelector("input[name='query']");
  const query = input.value.trim();
  if (query) runServiceSearch(query);
});

document.querySelectorAll("[data-search-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = serviceSearchForm?.querySelector("input[name='query']");
    if (input) input.value = button.dataset.searchPrompt;
    runServiceSearch(button.dataset.searchPrompt);
  });
});

const chatMarkup = `
  <button class="chat-launcher" type="button" data-chat-launcher aria-controls="skunkworks-chat" aria-expanded="false">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17.5 3.5 21l4.2-1.8A9 9 0 1 0 5 17.5Z"/><path d="M8 11h8M8 14h5"/></svg>
    <span>Pergunte-nos</span>
  </button>
  <section class="chat-panel" id="skunkworks-chat" data-chat-panel role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>
    <header class="chat-header">
      <div class="chat-title"><strong id="chat-title">Ask Skunkworks</strong><small>Assistente de serviços</small></div>
      <button class="chat-close" type="button" data-chat-close aria-label="Fechar conversa">×</button>
    </header>
    <div class="chat-messages" data-chat-messages aria-live="polite"></div>
    <div class="chat-quick-replies" data-chat-quick-replies aria-label="Perguntas sugeridas">
      <button type="button">Melhorar produtividade</button>
      <button type="button">Reforçar segurança</button>
      <button type="button">Automatizar processos</button>
      <button type="button">Contactar vendas</button>
    </div>
    <form class="chat-form" data-chat-form>
      <label class="visually-hidden" for="chat-input">Escreva a sua pergunta</label>
      <input id="chat-input" name="message" type="text" autocomplete="off" placeholder="Como podemos ajudar?" required>
      <button class="chat-send" type="submit" aria-label="Enviar pergunta">→</button>
    </form>
  </section>`;

document.body.insertAdjacentHTML("beforeend", chatMarkup);

const chatLauncher = document.querySelector("[data-chat-launcher]");
const chatPanel = document.querySelector("[data-chat-panel]");
const chatClose = document.querySelector("[data-chat-close]");
const chatMessages = document.querySelector("[data-chat-messages]");
const chatForm = document.querySelector("[data-chat-form]");
const chatInput = chatForm?.querySelector("input[name='message']");

function appendChatMessage(text, type = "bot", actions = []) {
  const message = document.createElement("div");
  message.className = `chat-message chat-message--${type}`;
  const copy = document.createElement("p");
  copy.textContent = text;
  message.append(copy);

  if (actions.length) {
    const actionRow = document.createElement("div");
    actionRow.className = "chat-message-actions";
    actions.forEach((action) => {
      const link = document.createElement("a");
      link.href = action.href;
      link.textContent = action.label;
      if (action.href.startsWith("http")) link.rel = "noopener";
      actionRow.append(link);
    });
    message.append(actionRow);
  }

  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function chatResponse(query) {
  const normalized = assistantNormalize(query);
  if (/^(ola|bom dia|boa tarde|boa noite|hello|hi)\b/.test(normalized)) {
    return { text: "Olá! Posso ajudar a encontrar um serviço, a loja, suporte ou o contacto certo.", actions: [] };
  }
  if (normalized.includes("whatsapp") || normalized.includes("telefone")) {
    return { text: "Pode falar diretamente com a equipa por WhatsApp.", actions: [{ label: "+35 191551931", href: "https://wa.me/35191551931" }] };
  }

  const matches = assistantSearch(query);
  if (!matches.length) {
    return {
      text: "Ainda não encontrei uma correspondência clara. Posso encaminhá-lo para um diagnóstico rápido ou para a nossa equipa.",
      actions: [{ label: "Fazer diagnóstico", href: "index.html#diagnostico" }, { label: "Contactar", href: "contacto.html" }]
    };
  }

  const best = matches[0];
  const actions = [{ label: `Ver ${best.category.toLowerCase()}`, href: best.href }];
  if (!["contact", "support", "store"].includes(best.id)) actions.push({ label: "Falar com vendas", href: "contacto.html" });
  return { text: `${best.title}: ${best.summary}`, actions };
}

function askChat(query) {
  appendChatMessage(query, "user");
  const response = chatResponse(query);
  window.setTimeout(() => appendChatMessage(response.text, "bot", response.actions), 180);
}

function openChat() {
  chatPanel.hidden = false;
  chatLauncher.setAttribute("aria-expanded", "true");
  if (!chatMessages.children.length) {
    appendChatMessage("Olá! Diga-me o que precisa de resolver. Posso pesquisar os nossos serviços e indicar o melhor próximo passo.");
  }
  window.setTimeout(() => chatInput?.focus(), 0);
}

function closeChat() {
  chatPanel.hidden = true;
  chatLauncher.setAttribute("aria-expanded", "false");
  chatLauncher.focus();
}

chatLauncher.addEventListener("click", () => chatPanel.hidden ? openChat() : closeChat());
chatClose.addEventListener("click", closeChat);
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = chatInput.value.trim();
  if (!query) return;
  chatInput.value = "";
  askChat(query);
});

document.querySelectorAll("[data-chat-quick-replies] button").forEach((button) => {
  button.addEventListener("click", () => askChat(button.textContent));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatPanel.hidden) closeChat();
});
