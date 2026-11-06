// One small script used by every page (CSP does not allow inline scripts).

// 1) "Add to Cart" buttons
document.addEventListener("click", async (event) => {
  const btn = event.target.closest(".add-to-cart");
  if (!btn) return;

  const originalText = btn.textContent;
  btn.disabled = true;
  try {
    const res = await fetch(`/cart/add/${btn.dataset.id}`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    const data = await res.json();

    if (res.status === 401) {
      window.location.href = data.login || "/user/login";
      return;
    }
    if (!res.ok) {
      alert(data.message || "Could not add to cart");
      btn.disabled = false;
      return;
    }
    const counter = document.getElementById("cartCount");
    if (counter) counter.textContent = data.cartCount;
    btn.textContent = "Added ✓";
    setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1200);
  } catch {
    alert("Network error. Please try again.");
    btn.disabled = false;
  }
});

// 2) Filters that submit their form as soon as they change
document.querySelectorAll("[data-autosubmit]").forEach((el) => {
  el.addEventListener("change", () => el.form.submit());
});

// 3) Forms with data-confirm="..." ask before submitting (e.g. delete, cancel)
document.querySelectorAll("form[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!confirm(form.dataset.confirm)) event.preventDefault();
  });
});
