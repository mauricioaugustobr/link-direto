// Link Direto — tudo roda no navegador, nada é enviado.

// ---- Funções puras (testáveis) ----

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

// Brasil: DDD + 8 ou 9 dígitos. Outros países: 6 a 14 dígitos.
function validateNumber(ddi, numero) {
  const digits = onlyDigits(numero);
  if (!digits) return { ok: false, reason: "empty" };
  if (ddi === "55") {
    if (digits.length < 10) return { ok: false, reason: "short" };
    if (digits.length > 11) return { ok: false, reason: "long" };
    return { ok: true, digits };
  }
  if (digits.length < 6) return { ok: false, reason: "short" };
  if (digits.length > 14) return { ok: false, reason: "long" };
  return { ok: true, digits };
}

function buildLink({ ddi, numero, mensagem }) {
  const digits = onlyDigits(ddi) + onlyDigits(numero);
  const text = String(mensagem || "").trim();
  return "https://wa.me/" + digits + (text ? "?text=" + encodeURIComponent(text) : "");
}

// Máscara só para o Brasil: (21) 99999-9999 / (21) 3333-4444
function formatBR(digits) {
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d.length ? "(" + d : "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  const split = rest.length > 8 ? 5 : 4;
  if (rest.length <= split) return "(" + ddd + ") " + rest;
  return "(" + ddd + ") " + rest.slice(0, split) + "-" + rest.slice(split);
}

if (typeof module !== "undefined") {
  module.exports = { onlyDigits, validateNumber, buildLink, formatBR };
}

// ---- Interface ----

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const ddi = $("ddi");
  const numero = $("numero");
  const mensagem = $("mensagem");
  const count = $("count");
  const hint = $("numero-hint");
  const phone = document.querySelector(".phone");
  const result = $("result");
  const link = $("link");
  const copiar = $("copiar");
  const abrir = $("abrir");
  const compartilhar = $("compartilhar");
  const previewNumero = $("preview-numero");
  const previewMsg = $("preview-msg");
  const toast = $("toast");

  const HINT_DEFAULT = "Com DDD. Só números, a gente formata.";
  const HINT_ERRORS = {
    short: "Faltam dígitos. Confira o DDD e o número.",
    long: "Dígitos demais. Tire o código do país, ele já está ao lado.",
  };

  let current = "";
  let touched = false;
  let toastTimer;

  if (navigator.share) compartilhar.hidden = false;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function setEnabled(on) {
    copiar.disabled = !on;
    compartilhar.disabled = !on;
    abrir.setAttribute("aria-disabled", String(!on));
    abrir.tabIndex = on ? 0 : -1;
  }

  function update() {
    let digits = onlyDigits(numero.value);
    if (ddi.value === "55") {
      // Colou com +55 na frente? Tira, o código do país já está no seletor.
      if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
      numero.value = formatBR(digits);
      numero.placeholder = "(21) 99999-9999";
    } else {
      numero.placeholder = "Número com código de área";
    }

    const check = validateNumber(ddi.value, numero.value);
    const text = mensagem.value.trim();
    count.textContent = mensagem.value.length + "/1000";

    const showError = !check.ok && check.reason !== "empty" && touched;
    phone.classList.toggle("is-error", showError);
    hint.classList.toggle("is-error", showError);
    hint.textContent = showError ? HINT_ERRORS[check.reason] : HINT_DEFAULT;

    previewNumero.textContent =
      "+" + ddi.value + " " + (numero.value || (ddi.value === "55" ? "(21) 99999-9999" : "seu número"));
    previewMsg.textContent = text || "Sem mensagem pronta: o cliente escreve do zero.";
    previewMsg.classList.toggle("is-empty", !text);

    if (check.ok) {
      current = buildLink({ ddi: ddi.value, numero: check.digits, mensagem: text });
      // Mostra legível; copia a versão codificada.
      link.textContent = "wa.me/" + ddi.value + check.digits + (text ? "?text=" + text : "");
      abrir.href = current;
      result.dataset.state = "ready";
      setEnabled(true);
    } else {
      current = "";
      link.textContent = "Digite o número para gerar o link";
      abrir.href = "#";
      result.dataset.state = "empty";
      setEnabled(false);
    }
  }

  async function copy() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = current;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    copiar.classList.add("is-done");
    copiar.querySelector("span").textContent = "Copiado!";
    showToast("Link copiado. Cola na bio, no site ou no anúncio.");
    setTimeout(() => {
      copiar.classList.remove("is-done");
      copiar.querySelector("span").textContent = "Copiar link";
    }, 1800);
  }

  numero.addEventListener("input", update);
  numero.addEventListener("blur", () => {
    touched = true;
    update();
  });
  ddi.addEventListener("change", update);
  mensagem.addEventListener("input", update);
  copiar.addEventListener("click", copy);
  compartilhar.addEventListener("click", () => {
    if (current) navigator.share({ title: "Fale comigo no WhatsApp", url: current }).catch(() => {});
  });
  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      mensagem.value = chip.dataset.msg;
      update();
      mensagem.focus();
    })
  );
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    copy();
  });

  update();
}
