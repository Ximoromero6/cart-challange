document.addEventListener("DOMContentLoaded", function () {
  const cartList = document.querySelector(".cart__list");
  const cartTotal = document.querySelector(".cart__total span");
  const cartCount = document.querySelector(".cart__count");

  const productButtons = document.querySelectorAll(".product__button");

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

  async function renderProducts() {
    const productsContainer = document.querySelector(".shop__products");

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

      productElement.innerHTML = `
        <div class="image__container">
            <img class="product__image" src="${product.image.desktop}" alt="${product.name}" />
            <button class="product__button">
                <i class="fi fi-rr-shopping-cart-add"></i>
                <label>Add To Cart</label>
            </button>
        </div>    
        <div class="product__info">
            <p class="product__category">${product.category}</p>
            <h2 class="product__title">${product.name}</h2>
            <p class="product__price">€${product.price.toFixed(2)}</p>
        </div>
        `;

      productsContainer.appendChild(productElement);
    });
  }

  // Products load
  renderProducts();

  // Cart render
  function renderCart() {
    cartList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.classList.add("cart__item");
      li.innerHTML = `
                ${item.name} - €${item.price} 
                <span class="cart__quantity">x${item.quantity}</span>
                <div class="cart__controls">
                    <button class="cart__button cart__button--increase" data-index="${index}">+</button>
                    <button class="cart__button cart__button--decrease" data-index="${index}">-</button>
                </div>
            `;
      cartList.appendChild(li);
      total += parseFloat(item.price) * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Función para agregar producto al carrito (sin duplicar)
  function addToCart(event) {
    const product = event.target.closest(".product");
    const productId = product.getAttribute("data-id");
    const productName = product.getAttribute("data-name");
    const productPrice = product.getAttribute("data-price");

    let existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1,
      });
    }

    renderCart();
  }

  // Función para modificar cantidad
  function updateQuantity(event) {
    const index = event.target.getAttribute("data-index");
    if (event.target.classList.contains("cart__button--increase")) {
      cart[index].quantity++;
    } else if (event.target.classList.contains("cart__button--decrease")) {
      cart[index].quantity--;
      if (cart[index].quantity === 0) cart.splice(index, 1);
    }
    renderCart();
  }

  // Función para vaciar el carrito
  function clearCart() {
    cart = [];
    renderCart();
  }

  productButtons.forEach((button) =>
    button.addEventListener("click", addToCart)
  );
  cartList.addEventListener("click", updateQuantity);
  /*   clearCartBtn.addEventListener("click", clearCart);
   */
  renderCart();
});
