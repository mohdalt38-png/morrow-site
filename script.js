// ---------- Cart (saved in this browser via localStorage) ----------
const CART_KEY = "morrowCart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateBagCount();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.name === item.name && c.color === item.color && c.size === item.size
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

function updateBagCount() {
  const badge = document.querySelector("#bagCount");
  if (!badge) return;
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "inline-flex" : "none";
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 200);
}

updateBagCount();

// Mobile menu toggle
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => nav.classList.toggle("open"));
}

// Fade-in on scroll for anything with .reveal
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// Rating bar fill animation (reviews page)
const barFills = document.querySelectorAll(".rating-bar-fill");
if (barFills.length) {
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("filled");
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  barFills.forEach((el) => barObserver.observe(el));
}

// Toast helper
const toast = document.querySelector("#toast");
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// Size selector
const sizes = document.querySelectorAll(".size");
sizes.forEach((size) => {
  size.addEventListener("click", () => {
    sizes.forEach((item) => item.classList.remove("active"));
    size.classList.add("active");
  });
});

// Color selector + price swap + image crossfade (products page)
const colors = document.querySelectorAll(".color");
const colorName = document.querySelector("#colorName");
const productImage = document.querySelector("#productImage");
const priceEl = document.querySelector("#price");

colors.forEach((color) => {
  color.addEventListener("click", () => {
    colors.forEach((item) => item.classList.remove("active"));
    color.classList.add("active");

    if (colorName) colorName.textContent = color.dataset.color;

    if (productImage && color.dataset.image) {
      productImage.classList.add("fading");
      setTimeout(() => {
        productImage.src = color.dataset.image;
        productImage.classList.remove("fading");
      }, 200);
    }

    if (priceEl && color.dataset.price) {
      priceEl.classList.add("bump");
      priceEl.textContent = color.dataset.price;
      setTimeout(() => priceEl.classList.remove("bump"), 200);
    }
  });
});

// Add to bag
const addToBag = document.querySelector("#addToBag");
if (addToBag) {
  addToBag.addEventListener("click", () => {
    const activeSize = document.querySelector(".size.active");
    const activeColor = document.querySelector(".color.active");
    const selectedSize = activeSize ? activeSize.textContent : "S";
    const selectedColor = activeColor ? activeColor.dataset.color : "Default";
    const priceText = priceEl ? priceEl.textContent : "S$69.99";
    const priceNumber = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const image = productImage ? productImage.src : "";

    addToCart({
      name: "Core Hoodie",
      color: selectedColor,
      size: selectedSize,
      price: priceNumber,
      image: image,
    });

    showToast(`Core Hoodie — ${selectedColor}, size ${selectedSize} added to bag`);
  });
}

// Newsletter signup
const signupForm = document.querySelector("#signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("You're on the list.");
    signupForm.reset();
  });
}

// ---------- Bag page rendering ----------
const bagItemsContainer = document.querySelector("#bagItems");
const bagEmptyState = document.querySelector("#bagEmpty");
const bagSummaryEl = document.querySelector("#bagSummary");
const bagSubtotalEl = document.querySelector("#bagSubtotal");
const bagTotalEl = document.querySelector("#bagTotal");
const checkoutLink = document.querySelector("#checkoutLink");

function renderBag() {
  if (!bagItemsContainer) return;
  const cart = getCart();

  if (cart.length === 0) {
    bagItemsContainer.style.display = "none";
    if (bagSummaryEl) bagSummaryEl.style.display = "none";
    if (bagEmptyState) bagEmptyState.style.display = "block";
    return;
  }

  if (bagEmptyState) bagEmptyState.style.display = "none";
  bagItemsContainer.style.display = "grid";
  if (bagSummaryEl) bagSummaryEl.style.display = "grid";

  bagItemsContainer.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;

    const row = document.createElement("div");
    row.className = "bag-item reveal in-view";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name} — ${item.color}" />
      <div class="bag-item-info">
        <h3>${item.name}</h3>
        <div class="meta">${item.color} &middot; Size ${item.size}</div>
        <div class="unit-price">S$${item.price.toFixed(2)} each</div>
        <div class="qty-control">
          <button data-action="decrease" data-index="${index}">−</button>
          <span>${item.qty}</span>
          <button data-action="increase" data-index="${index}">+</button>
        </div>
      </div>
      <div class="bag-item-right">
        <div class="line-total">S$${(item.price * item.qty).toFixed(2)}</div>
        <a href="#" class="remove-item" data-action="remove" data-index="${index}">Remove</a>
      </div>
    `;
    bagItemsContainer.appendChild(row);
  });

  if (bagSubtotalEl) bagSubtotalEl.textContent = `S$${subtotal.toFixed(2)}`;
  if (bagTotalEl) bagTotalEl.textContent = `S$${subtotal.toFixed(2)}`;

  bagItemsContainer.querySelectorAll("button, a[data-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const cart = getCart();
      const idx = parseInt(el.dataset.index, 10);
      const action = el.dataset.action;

      if (action === "increase") cart[idx].qty += 1;
      if (action === "decrease") {
        cart[idx].qty -= 1;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      if (action === "remove") cart.splice(idx, 1);

      saveCart(cart);
      renderBag();
    });
  });
}

renderBag();

// ---------- Checkout page rendering ----------
const checkoutSummary = document.querySelector("#checkoutSummary");
const checkoutTotalEl = document.querySelector("#checkoutTotal");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutStep = document.querySelector("#checkoutStep");
const checkoutSuccess = document.querySelector("#checkoutSuccess");

function renderCheckoutSummary() {
  if (!checkoutSummary) return;
  const cart = getCart();

  if (cart.length === 0) {
    checkoutSummary.innerHTML = `<p style="color:#666; font-size:13px;">Your bag is empty.</p>`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = "S$0.00";
    return;
  }

  checkoutSummary.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    const line = document.createElement("div");
    line.className = "order-line";
    line.innerHTML = `<span class="oname">${item.name} — ${item.color} (${item.size}) × ${item.qty}</span><span>S$${(item.price * item.qty).toFixed(2)}</span>`;
    checkoutSummary.appendChild(line);
  });

  if (checkoutTotalEl) checkoutTotalEl.textContent = `S$${total.toFixed(2)}`;
}

renderCheckoutSummary();

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      showToast("Your bag is empty.");
      return;
    }
    saveCart([]);
    if (checkoutStep) checkoutStep.style.display = "none";
    if (checkoutSuccess) checkoutSuccess.style.display = "block";
  });
}
