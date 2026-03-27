/* Task 1: The Script Foundation & Data Structure */
class Product {
  constructor(id, name, price, image, description, brand, storage) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.description = description;
    this.brand = brand;
    this.storage = storage;
  }
}

class CartItem {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }
}

class Order {
  constructor(id, date, status, items) {
    this.id = id;
    this.date = date;
    this.status = status;
    this.items = items;
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}

class User {
  constructor(name, orderHistory) {
    this.name = name;
    this.orderHistory = orderHistory;
  }
}

/* Task 1: Product test data (10 items) */
const products = [
  new Product(1, "iPhone 13", 59999, "images/ip002.jfif", "Great battery and camera setup.", "iphone", "4-128"),
  new Product(2, "iPhone 15", 69999, "images/ip156.jfif", "Fast processor and excellent display.", "iphone", "8-256"),
  new Product(3, "iPhone 17", 79000, "images/p1.jfif", "Latest model with advanced camera.", "iphone", "8-256"),
  new Product(4, "Galaxy A23 5G", 10000, "images/Galaxy A23 5g.jpg", "Budget-friendly and dependable.", "samsung", "4-128"),
  new Product(5, "Galaxy M53 5G", 15000, "images/Samsung M53 5G.webp", "Balanced device for daily use.", "samsung", "8-256"),
  new Product(6, "Galaxy Note5", 20000, "images/Galaxy Note5.jpg", "Classic productivity phone.", "samsung", "4-128"),
  new Product(7, "iPhone 16", 72000, "images/ip16.jfif", "Strong all-around flagship performance.", "iphone", "8-256"),
  new Product(8, "iPhone 17 Pro", 85000, "images/ip001.jfif", "Premium camera and OLED panel.", "iphone", "8-256"),
  new Product(9, "Tecno Spark 10", 8500, "images/p1.jfif", "Affordable smartphone for students.", "tecno", "4-128"),
  new Product(10, "Tecno Pova 5", 11999, "images/ip16.jfif", "Gaming-focused battery phone.", "tecno", "8-256")
];

const currentUser = new User("Magallanes, Kai Justin D.", [
  new Order(1001, "January 15, 2026", "Delivered", [
    new CartItem(products[3], 1)
  ]),
  new Order(1002, "January 22, 2026", "Delivered", [
    new CartItem(products[4], 2)
  ]),
  new Order(1003, "February 5, 2026", "Processing", [
    new CartItem(products[5], 1)
  ])
]);

/* Task 3: Cart state */
let cart = loadCart();

function loadCart() {
  const raw = localStorage.getItem("cart");
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed
      .map((item) => {
        const matchedProduct = products.find((product) => product.id === item.productId);
        if (!matchedProduct) return null;
        return new CartItem(matchedProduct, Number(item.quantity) || 1);
      })
      .filter((item) => item !== null);
  } catch (error) {
    console.error("Failed to parse cart data", error);
    return [];
  }
}

function saveCart() {
  const serialized = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity
  }));
  localStorage.setItem("cart", JSON.stringify(serialized));
}

/* Task 2: Helper for safe text injection using createTextNode */
function createTextElement(tagName, text) {
  const element = document.createElement(tagName);
  element.appendChild(document.createTextNode(text));
  return element;
}

/* Task 3: Add selected product into cart state */
function addProductToCart(productId) {
  const selectedProduct = products.find((product) => product.id === productId);
  if (!selectedProduct) return;

  const existingItem = cart.find((item) => item.product.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(new CartItem(selectedProduct, 1));
  }

  saveCart();
}

/* Task 2: Dynamic Product Rendering (products.html) */
function renderProducts() {
  const productContainer = document.querySelector(".product-grid");
  if (!productContainer) {
  return;
}

  productContainer.textContent = "";

  const checkedStorage = Array.from(document.querySelectorAll('input[name="storage"]:checked'))
    .map((input) => input.value);
  const selectedBrandInput = document.querySelector('input[name="brand"]:checked');
  const selectedBrand = selectedBrandInput ? selectedBrandInput.value : "";

  const filteredProducts = products.filter((product) => {
    const storageMatch = checkedStorage.length === 0 || checkedStorage.includes(product.storage);
    const brandMatch = !selectedBrand || product.brand === selectedBrand;
    return storageMatch && brandMatch;
  });

  filteredProducts.forEach((product) => {
    const article = document.createElement("article");
    article.classList.add("product-card");

    const imageWrap = document.createElement("div");
    imageWrap.classList.add("img-product");

    const image = document.createElement("img");
    image.setAttribute("src", product.image);
    image.setAttribute("alt", product.name);
    imageWrap.appendChild(image);

    const title = createTextElement("h3", product.name);
    const description = createTextElement("p", product.description);
    description.classList.add("info");

    const actionRow = document.createElement("div");
    const price = createTextElement("span", "₱" + product.price.toLocaleString("en-PH", { minimumFractionDigits: 2 }));
    price.classList.add("price");

    const detailsLink = document.createElement("a");
    detailsLink.setAttribute("href", `details.html?id=${product.id}`);
    detailsLink.appendChild(document.createTextNode("View Details"));

    const addButton = createTextElement("button", "Add to Cart");
    addButton.setAttribute("type", "button");
    addButton.classList.add("add-cart-btn");
    addButton.dataset.id = String(product.id);

    actionRow.appendChild(price);
    actionRow.appendChild(document.createTextNode(" "));
    actionRow.appendChild(detailsLink);
    actionRow.appendChild(document.createTextNode(" "));
    actionRow.appendChild(addButton);

    article.appendChild(imageWrap);
    article.appendChild(title);
    article.appendChild(description);
    article.appendChild(actionRow);

    productContainer.appendChild(article);
  });
}

/* Task 3: Rendering the Cart (cart.html) with reduce total */
function renderCart() {
  const cartList = document.querySelector("#cart-list");
  const subtotalElement = document.querySelector("#subtotal-price");
  const emptyMessage = document.querySelector("#empty-cart-message");

  if (!cartList || !subtotalElement || !emptyMessage) return;

  cartList.textContent = "";

  cart.forEach((item) => {
    const listItem = document.createElement("li");

    const image = document.createElement("img");
    image.setAttribute("src", item.product.image);
    image.setAttribute("alt", item.product.name);

    const title = createTextElement("h3", item.product.name);
    const linePrice = createTextElement("span", "₱" + (item.product.price * item.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 }));

    const quantityInput = document.createElement("input");
    quantityInput.setAttribute("type", "number");
    quantityInput.setAttribute("min", "0");
    quantityInput.setAttribute("value", String(item.quantity));
    quantityInput.dataset.id = String(item.product.id);
    quantityInput.classList.add("cart-quantity");

    listItem.appendChild(image);
    listItem.appendChild(title);
    listItem.appendChild(linePrice);
    listItem.appendChild(quantityInput);
    cartList.appendChild(listItem);
  });

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  subtotalElement.textContent = "Subtotal: ₱" + totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 });
  emptyMessage.style.display = cart.length === 0 ? "block" : "none";
}

/* Task 4: Form Validation & Submission (checkout.html) */
function validateCheckoutForm() {
  const checkoutForm = document.querySelector("#checkout-form");
  if (!checkoutForm) return;

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const inputs = checkoutForm.querySelectorAll("input[type='text']");
    const feedback = document.querySelector("#checkout-feedback");
    const paymentChecked = checkoutForm.querySelector("input[name='payment']:checked");
    const invalidFields = [];

    inputs.forEach((input) => {
      const value = input.value.trim();
      if (value === "") {
        input.classList.add("error");
        invalidFields.push(input.name);
      } else {
        input.classList.remove("error");
      }
    });

    if (!paymentChecked) {
      invalidFields.push("payment");
    }

    if (invalidFields.length > 0) {
      if (feedback) {
        feedback.textContent = "Please complete all required fields and choose a payment method.";
      }
      return;
    }

    if (feedback) {
      feedback.textContent = "";
    }
    console.log("Checkout successful. Redirecting to account page...");
    window.location.href = "account.html";
  });
}

/* Task 5: User Account & Order History (account.html) */
function renderOrderHistory() {
  const greeting = document.querySelector(".account-greeting");
  const orderList = document.querySelector("#order-history-list");
  if (!greeting || !orderList) return;

  greeting.textContent = "Welcome! " + currentUser.name;
  orderList.textContent = "";

  currentUser.orderHistory.forEach((order) => {
    const listItem = document.createElement("li");
    const details = document.createElement("details");
    details.dataset.orderId = String(order.id);

    const summary = document.createElement("summary");
    const summaryText = "Order #" + order.id + " - ₱" + order.getTotal().toLocaleString("en-PH", { minimumFractionDigits: 2 }) + " (" + order.date + ")";
    summary.appendChild(document.createTextNode(summaryText));

    const contentWrap = document.createElement("div");
    contentWrap.classList.add("order-content");

    details.appendChild(summary);
    details.appendChild(contentWrap);
    listItem.appendChild(details);
    orderList.appendChild(listItem);
  });
}

/* Task 5: Expand order details on summary click */
function injectOrderDetails(detailsElement) {
  const orderId = Number(detailsElement.dataset.orderId);
  const order = currentUser.orderHistory.find((entry) => entry.id === orderId);
  if (!order) return;

  const contentWrap = detailsElement.querySelector(".order-content");
  if (!contentWrap || contentWrap.childElementCount > 0) return;

  const dateInfo = createTextElement("p", "Date: " + order.date);
  const statusInfo = createTextElement("p", "Status: " + order.status);
  const itemCount = createTextElement("p", "Items: " + order.items.length);
  const totalInfo = createTextElement("p", "Total: $" + order.getTotal().toFixed(2));

  contentWrap.appendChild(dateInfo);
  contentWrap.appendChild(statusInfo);
  contentWrap.appendChild(itemCount);
  contentWrap.appendChild(totalInfo);
}

/* Task 3 + Task 5: Event Delegation via bubbling */
document.body.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("add-cart-btn")) {
    const productId = Number(target.dataset.id);
    addProductToCart(productId);

    /* Task 6: Interactive feedback using class toggle + timeout */
    const productCard = target.closest(".product-card");
    if (productCard) {
      productCard.classList.add("fade-in");
      setTimeout(() => {
        productCard.classList.remove("fade-in");
      }, 400);
    }

    renderCart();
  }

  if (target.tagName.toLowerCase() === "summary") {
    const detailsElement = target.closest("details");
    if (detailsElement) {
      injectOrderDetails(detailsElement);
    }
  }
});

document.body.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  if (target.name === "storage" || target.name === "brand") {
    renderProducts();
  }

  if (target.classList.contains("cart-quantity")) {
    const productId = Number(target.dataset.id);
    const quantity = Number(target.value);

    if (quantity <= 0) {
      cart = cart.filter((item) => item.product.id !== productId);
    } else {
      cart.forEach((item) => {
        if (item.product.id === productId) {
          item.quantity = quantity;
        }
      });
    }

    saveCart();
    renderCart();
  }
});

/* Task 1-6: Initialize page features based on available DOM nodes */
renderProducts();
renderCart();
renderOrderHistory();
validateCheckoutForm();
