(function () {
  "use strict";

  var toastTimer = null;

  function showToast(message, type) {
    var toast = document.getElementById("toast");
    if (!toast) return;

    var icon = toast.querySelector("[data-toast-icon]");
    var text = toast.querySelector("[data-toast-text]");
    var variant = type === "error" ? "error" : "success";

    if (text) text.textContent = message;
    toast.setAttribute("data-type", variant);
    toast.setAttribute("role", variant === "error" ? "alert" : "status");

    if (icon) {
      icon.className =
        variant === "error"
          ? "grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-rose-600"
          : "grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-600";
    }

    toast.classList.remove("toast-show");
    void toast.offsetWidth;
    toast.classList.add("toast-show");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("toast-show");
    }, 3600);
  }

  function initReveal() {
    var elements = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    elements.forEach(function (element, index) {
      element.classList.add("reveal");
      element.style.transitionDelay = Math.min(index * 45, 220) + "ms";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initPrintButtons() {
    document.querySelectorAll("[data-print]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.print();
      });
    });
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.textContent = value;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initPrintButtons();
  });

  window.UI = {
    showToast: showToast,
    setText: setText,
    escapeHtml: escapeHtml
  };
})();
