document.addEventListener("DOMContentLoaded", function () {
  const productsContainer = document.querySelector(".shop__products");
  const cartList = document.querySelector(".cart__list");
  const cartCount = document.querySelector(".cart__count");
  const cartTotal = document.createElement("div");

  cartTotal.classList.add("cart__total");
  cartList.after(cartTotal);

  const confirmBtn = document.createElement("button");
  confirmBtn.classList.add("cart__confirm");
  confirmBtn.textContent = "Confirm Order";
  cartTotal.after(confirmBtn);

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  async function fetchData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading JSON file:", error);
    }
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateCartCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
  }

  async function renderProducts() {
    if (!productsContainer) {
      console.error("Products container not found");
      return;
    }

    const products = await fetchData();

    products.forEach((product, index) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product");
      productElement.setAttribute("data-id", index);
      productElement.setAttribute("data-name", product.name);
      productElement.setAttribute("data-price", product.price);
      productElement.setAttribute("data-image", product.image.thumbnail);

      productElement.innerHTML = `
        <div class="image__container">
            <img class="product__image" src="${product.image.desktop}" alt="${
        product.name
      }" />
          <div class="product__button-container">
            <button class="product__button" data-id="${index}">
                <i class="fi fi-rr-shopping-cart-add"></i>
                <span>Add To Cart</span>
            </button>
          </div>
        </div>    
        <div class="product__info">
            <p class="product__category">${product.category}</p>
            <h2 class="product__title">${product.name}</h2>
            <p class="product__price">${product.price.toFixed(2)}€</p>
        </div>
        `;

      productsContainer.appendChild(productElement);

      // If the product is already on the cart, restore controls
      const existing = cart.find((item) => item.id === index.toString());
      if (existing) {
        updateProductControls(index, existing.quantity);
      }
    });
  }

  // Cart render
  function renderCart() {
    cartList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartList.innerHTML = `
        <li class="cart__empty">
          <img src="./assets/images/illustration-empty-cart.svg" alt="Empty cart" class="cart__empty-image"/>
          <p>Your added items will appear here</p>
        </li>
      `;

      cartTotal.style.display = "none";
      confirmBtn.style.display = "none";
    } else {
      cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.classList.add("cart__item");
        li.innerHTML = `
                  <h4>${item.name}</h4>
                  <div class="cart__item-container">
                    <div class="cart__item-info">
                      <span class="item__quantity">${item.quantity}x</span>
                      <span class="item__price">@ ${parseFloat(
                        item.price
                      ).toFixed(2)}€</span>
                      <span class="item__quantity__total">${(
                        item.quantity * item.price
                      ).toFixed(2)}€</span>
                    </div>
                    <button class="cart__button--delete" data-id="${item.id}">
                      <i class="fi fi-rr-cross-circle"></i>
                    </button>
                  </div>
              `;
        cartList.appendChild(li);
        total += item.quantity * item.price;
      });

      cartTotal.innerHTML = `
        <div class="total--info">
          <p class="order--message">Order Total</p>
          <p class="cart__total-price">${total.toFixed(2)}€</p>
        </div>
        <div class="carbon--message">
          <img src="./assets/images/icon-carbon-neutral.svg">
          <p class="cart__note">This is a <strong>carbon-neutral</strong> delivery</p>
        </div>
      `;

      cartTotal.style.display = "flex";
      confirmBtn.style.display = "flex";
    }

    updateCartCount();
    saveCart();
  }

  function updateProductControls(id, quantity) {
    const product = document.querySelector(`.product[data-id="${id}"]`);
    if (!product) return;

    const container = product.querySelector(".product__button-container");

    if (quantity > 0) {
      product.classList.add("selected");

      container.innerHTML = `
      <div class="product__button action">
        <button class="product__button--decrease" data-id="${id}">
          <i class="fi fi-rr-minus-circle"></i>
        </button>
        <span class="product__quantity">${quantity}</span>
        <button class="product__button--increase" data-id="${id}">
           <i class="fi fi-rr-add"></i>
        </button>
      </div>
        `;
    } else {
      product.classList.remove("selected");

      container.innerHTML = `
        <button class="product__button" data-id="${id}">
          <i class="fi fi-rr-shopping-cart-add"></i>
          <span>Add To Cart</span>
        </button>
      `;
    }
  }

  // Función para agregar producto al carrito (sin duplicar)
  function addToCart(productData) {
    const existing = cart.find((item) => item.id === productData.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...productData, quantity: 1 });
    }
    updateProductControls(productData.id, existing ? existing.quantity : 1);
    renderCart();
  }

  function changeQuantity(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
    updateProductControls(id, item.quantity || 0);
    renderCart();
  }

  function handleCartActions(e) {
    if (e.target.closest(".cart__button--delete")) {
      const id = e.target.closest("button").dataset.id;
      cart = cart.filter((item) => item.id !== id);
      updateProductControls(id, 0);
      renderCart();
    }
  }

  function handleProductActions(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;

    if (btn.classList.contains("product__button")) {
      const productEl = btn.closest(".product");
      addToCart({
        id,
        name: productEl.dataset.name,
        price: parseFloat(productEl.dataset.price),
        image: productEl.dataset.image,
      });
    } else if (btn.classList.contains("product__button--increase")) {
      changeQuantity(id, 1);
    } else if (btn.classList.contains("product__button--decrease")) {
      changeQuantity(id, -1);
    }
  }

  // Función para vaciar el carrito
  function clearCart() {
    cart = [];
    localStorage.removeItem("cart");
    resetProductStates();
    renderCart();
  }

  function showOrderSummary() {
    let total = 0;
    const productHTML = cart
      .map(({ name, quantity, price, image }) => {
        const subtotal = quantity * price;
        total += subtotal;
        return `
        <div class="order-item-row">
          <div class="order-item-row-name">
            <img src="${image}">
            <div class="order-item-text">
              <span class="name">${name}</span>
              <div>
                <span>${quantity}x</span>
                <span>@${price.toFixed(2)}€</span>
               </div>
            </div>
          </div>
          <span class="subtotal">${subtotal.toFixed(2)}€</span>
        </div>
      `;
      })
      .join("");

    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "order-overlay";

    // Contenido del popup
    overlay.innerHTML = `
      <div class="order-popup">
        <i class="fi fi-rs-check-circle"></i>

        <div class="info-resume">
          <h2 class="order-title">Order Confirmed</h2>
          <p class="order-subtitle">We hope you enjoy your food!</p>
        </div>

        <div class="order-list">
          ${productHTML}

          <div class="order-total-row">
            <span>Order Total</span>
            <span>${total.toFixed(2)}€</span>
          </div>
        </div>
  
        <button class="order-reset-btn">Start New Order</button>
      </div>
    `;

    // Evento del botón
    overlay.querySelector(".order-reset-btn").addEventListener("click", () => {
      clearCart();
      overlay.remove();
    });

    // Agregar al DOM
    document.body.appendChild(overlay);
  }

  function resetProductStates() {
    const allProducts = document.querySelectorAll(".product");
    allProducts.forEach((product) => {
      const id = product.getAttribute("data-id");
      updateProductControls(id, 0);
    });
  }

  confirmBtn.addEventListener("click", showOrderSummary);

  productsContainer.addEventListener("click", handleProductActions);
  cartList.addEventListener("click", handleCartActions);

  renderProducts();
  renderCart();
});
