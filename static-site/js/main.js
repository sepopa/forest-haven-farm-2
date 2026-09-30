// Forest Haven Farm — shared front-end behavior for the static prototype.
// Swap API_BASE_URL below once the FastAPI backend is running/deployed.
const API_BASE_URL = window.FHF_API_BASE_URL || "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFaqAccordion();
  initMenuFilters();
  initOrderForm();
  initContactForm();
  setMinPickupDate();
});

/* ---------------- Mobile nav ---------------- */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- FAQ accordion ---------------- */
function initFaqAccordion() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });
}

/* ---------------- Menu filters ---------------- */
function initMenuFilters() {
  const pills = document.querySelectorAll(".filter-pill");
  const items = document.querySelectorAll(".menu-item");
  if (!pills.length) return;
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      const filter = pill.dataset.filter;
      items.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.style.display = show ? "" : "none";
      });
    });
  });
}

/* ---------------- Pickup date minimum (48h out) ---------------- */
function setMinPickupDate() {
  const input = document.getElementById("order-pickup-date");
  if (!input) return;
  const min = new Date();
  min.setDate(min.getDate() + 2);
  input.min = min.toISOString().split("T")[0];
}

/* ---------------- Order form ---------------- */
function initOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("order-msg");
    const submitBtn = document.getElementById("order-submit");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.policy_ack = form.querySelector("#order-policy").checked;

    setSubmitting(submitBtn, true, "Submitting…");
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      showMsg(msg, "success", "Thanks! Your order request was received — we'll confirm by email or phone within 24 hours.");
      form.reset();
      setMinPickupDate();
    } catch (err) {
      showMsg(
        msg,
        "error",
        "We couldn't reach the order system right now (is the backend running?). Please email hello@foresthavenfarm.com and we'll get you booked in."
      );
    } finally {
      setSubmitting(submitBtn, false, "Submit Order Request");
    }
  });
}

/* ---------------- Contact form ---------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("contact-msg");
    const submitBtn = document.getElementById("contact-submit");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());

    setSubmitting(submitBtn, true, "Sending…");
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      showMsg(msg, "success", "Message sent — thanks for reaching out! We'll reply within a day or two.");
      form.reset();
    } catch (err) {
      showMsg(
        msg,
        "error",
        "We couldn't reach the server right now (is the backend running?). Please email hello@foresthavenfarm.com directly."
      );
    } finally {
      setSubmitting(submitBtn, false, "Send Message");
    }
  });
}

function setSubmitting(btn, isSubmitting, label) {
  if (!btn) return;
  btn.disabled = isSubmitting;
  btn.textContent = label;
}

function showMsg(el, type, text) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-msg show ${type}`;
}
