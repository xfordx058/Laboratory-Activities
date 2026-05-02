// ============================================
// BASE API URL - Spring Boot backend
// ============================================
const API_BASE_URL = 'http://localhost:8080/api';
const BACKEND_BASE_URL = 'http://localhost:8080';

let csrfToken = null;
let csrfHeaderName = 'X-XSRF-TOKEN';

function isAuthPage() {
    const path = window.location.pathname.toLowerCase();
    return path.includes('login') || path.includes('signup');
}

function showStatus(message, isError = false) {
    const status = document.getElementById('auth-status') || document.getElementById('page-status');
    if (status) {
        status.textContent = message;
        status.style.color = isError ? '#c0392b' : '#2d7d46';
    }
}

async function loadCsrfToken() {
    const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`Unable to load CSRF token (${response.status})`);
    }

    const data = await response.json();
    csrfToken = data.token;
    csrfHeaderName = data.headerName || csrfHeaderName;
    return csrfToken;
}

async function apiFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = {
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    if (method !== 'GET' && method !== 'HEAD') {
        if (!csrfToken) {
            await loadCsrfToken();
        }
        headers[csrfHeaderName] = csrfToken;
    }

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers
    });

    if (response.status === 401) {
        if (!isAuthPage()) {
            window.location.href = 'login.html';
        }
        throw new Error('Please log in to continue.');
    }

    if (response.status === 403) {
        showStatus('Access denied. Your account does not have permission for this action.', true);
        throw new Error('Access denied.');
    }

    return response;
}

// ============================================
// SESSION MANAGEMENT - Local cart session ID
// ============================================

function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

function getCartId() {
    return localStorage.getItem('cartId');
}

function setCartId(cartId) {
    localStorage.setItem('cartId', cartId);
}

async function initializeCart() {
    const sessionId = getSessionId();
    let cartId = getCartId();

    if (!cartId) {
        try {
            const response = await apiFetch(`${API_BASE_URL}/cart/session/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const cart = await response.json();
                setCartId(cart.id);
            }
        } catch (error) {
            console.error('Failed to initialize cart:', error.message);
        }
    }
}

async function getCart() {
    const cartId = getCartId();
    if (!cartId) return [];

    try {
        const response = await apiFetch(`${API_BASE_URL}/cart/${cartId}/items`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch cart:', error.message);
    }

    return [];
}

async function addToCart(productId, productName) {
    const cartId = getCartId();

    if (!cartId) {
        alert('Cart not initialized. Please refresh the page.');
        return;
    }

    try {
        const response = await apiFetch(`${API_BASE_URL}/cart/${cartId}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (response.ok) {
            updateCartCount();
            alert(`${productName} added to cart!`);
            return;
        }

        await showApiError(response, 'Failed to add product to cart');
    } catch (error) {
        alert(error.message);
    }
}

async function removeFromCart(cartItemId) {
    const cartId = getCartId();
    if (!cartId) return;

    try {
        const response = await apiFetch(`${API_BASE_URL}/cart/${cartId}/items/${cartItemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            renderCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error removing from cart:', error.message);
    }
}

async function updateQuantity(cartItemId, newQuantity) {
    const cartId = getCartId();
    if (!cartId) return;

    try {
        const response = await apiFetch(`${API_BASE_URL}/cart/${cartId}/items/${cartItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            renderCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error updating quantity:', error.message);
    }
}

async function getCartTotal() {
    const cartId = getCartId();
    if (!cartId) return 0;

    try {
        const response = await apiFetch(`${API_BASE_URL}/cart/${cartId}/total`);
        if (response.ok) {
            const result = await response.json();
            return result.total || 0;
        }
    } catch (error) {
        console.error('Error getting cart total:', error.message);
    }

    return 0;
}

async function updateCartCount() {
    const cartItems = await getCart();
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');

    if (badge) {
        badge.textContent = count;
    }
}

async function renderCart() {
    const cartList = document.getElementById('cart-list');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');

    if (!cartList) return;

    const cart = await getCart();

    if (cart.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'block';
        updateCartSummary(0);
        return;
    }

    if (cartContent) cartContent.style.display = 'block';
    if (emptyMessage) emptyMessage.style.display = 'none';

    cartList.innerHTML = cart.map(item => `
        <li class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${getProductImage(item.product)}" alt="${item.product.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="item-info">
                <h3>${item.product.name}</h3>
                <p class="cart-item-meta">Unit price</p>
                <p class="price">${formatPrice(item.unitPrice)}</p>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">
                <span>Item total</span>
                <strong>${formatPrice(item.unitPrice * item.quantity)}</strong>
            </div>
            <button onclick="removeFromCart(${item.id})" class="btn-remove">Remove</button>
        </li>
    `).join('');

    const total = await getCartTotal();
    updateCartSummary(total);
}

function updateCartSummary(total) {
    const subtotalEl = document.getElementById('subtotal-price');
    if (subtotalEl) {
        subtotalEl.textContent = `Subtotal: ${formatPrice(total)}`;
    }
}

async function fetchProducts() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch products:', error.message);
        return [];
    }
}

function renderProductCards(products, container) {
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<p class="empty">No products available.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card ${isDiscountedProduct(product) ? 'discounted-card' : ''}" data-id="${product.id}">
            ${isDiscountedProduct(product) ? '<span class="sale-badge">Sale</span>' : ''}
            <img src="${getProductImage(product)}"
                 alt="${product.name}"
                 onerror="this.src='images/placeholder.jpg'">
            <h3>${product.name}</h3>
            ${renderPrice(product)}
            <p class="stock">Stock: ${product.stock || 0}</p>
            <p class="description">${product.description || ''}</p>
            <div class="product-actions">
                <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}')" class="btn-cart">
                    Add to Cart
                </button>
                <button onclick="viewDetails(${product.id})" class="btn-details">Details</button>
            </div>
        </div>
    `).join('');
}

function renderProducts(products) {
    const container = document.getElementById('product-list')
        || document.getElementById('product-container')
        || document.querySelector('.product-grid')
        || document.querySelector('main');

    renderProductCards(products, container);
}

function isDiscountedProduct(product) {
    const categoryName = product.category?.name?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    return categoryName.includes('discount') || description.includes('discount');
}

function formatPrice(value) {
    return `PHP ${Number(value || 0).toFixed(2)}`;
}

function getProductImage(product) {
    const imageUrl = product.imageUrl || 'images/placeholder.jpg';
    return imageUrl.includes('/') ? imageUrl : `images/${imageUrl}`;
}

function getOriginalPrice(product) {
    return Math.ceil((Number(product.price || 0) * 1.2) / 10) * 10;
}

function renderPrice(product) {
    if (!isDiscountedProduct(product)) {
        return `<p class="price current-price">${formatPrice(product.price)}</p>`;
    }

    return `
        <div class="price-stack">
            <del class="original-price">${formatPrice(getOriginalPrice(product))}</del>
            <p class="price discounted-price">${formatPrice(product.price)}</p>
        </div>
    `;
}

function getProductSpecs(product) {
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.name || 'Smartphone';
    const seriesMatch = product.name?.match(/\b(13|14|15|16|17|S23|A23|M53|Note5)\b/i);

    return [
        ['Model', product.name || 'Mobile Device'],
        ['Series', seriesMatch ? seriesMatch[0].toUpperCase() : category],
        ['Category', category],
        ['Storage', name.includes('512') ? '512GB' : name.includes('256') ? '256GB' : '128GB'],
        ['Connectivity', name.includes('5g') || name.includes('s23') || name.includes('m53') || name.includes('a23') ? '5G ready' : '4G LTE'],
        ['Warranty', '1 year service warranty'],
        ['Stock', `${product.stock || 0} units available`]
    ];
}

function renderSpecs(product) {
    const table = document.getElementById('specs-table');
    if (!table) return;

    table.innerHTML = getProductSpecs(product).map(([label, value]) => `
        <tr>
            <th>${label}</th>
            <td>${value}</td>
        </tr>
    `).join('');
}

function renderReviews(product) {
    const reviews = document.getElementById('product-reviews');
    if (!reviews) return;

    const productName = product.name || 'this product';
    const reviewData = [
        [`${productName} arrived in excellent condition and matched the listed specifications.`, 'Verified Customer'],
        ['Good value for the price, with smooth performance for daily use.', 'Mobile Shopper'],
        ['Checkout was easy and the product details helped me choose confidently.', 'Repeat Buyer']
    ];

    reviews.innerHTML = reviewData.map(([quote, author]) => `
        <blockquote>
            <p>${quote}</p>
            <footer>- <cite>${author}</cite></footer>
        </blockquote>
    `).join('');
}

function renderHomeProducts(products) {
    const featuredContainer = document.getElementById('featured-container');
    const discountedContainer = document.getElementById('discounted-container');

    if (!featuredContainer && !discountedContainer) {
        renderProducts(products);
        return;
    }

    const discountedProducts = products.filter(isDiscountedProduct);
    const featuredProducts = products.filter(product => !isDiscountedProduct(product));

    renderProductCards(featuredProducts.slice(0, 8), featuredContainer);
    renderProductCards(discountedProducts.slice(0, 8), discountedContainer);
}

function productSearchText(product) {
    return [
        product.name,
        product.description,
        product.category?.name
    ].filter(Boolean).join(' ').toLowerCase();
}

function matchesSeries(product, selectedSeries) {
    if (selectedSeries.length === 0) return true;

    const text = productSearchText(product);
    return selectedSeries.some(series => text.includes(series));
}

function matchesStorage(product, selectedStorage) {
    if (!selectedStorage || selectedStorage === 'all') return true;

    const text = productSearchText(product);
    return text.includes(`${selectedStorage}gb`) || text.includes(`${selectedStorage} gb`);
}

function applyProductFilters(products) {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return products;

    const selectedSeries = Array.from(filterForm.querySelectorAll('input[name="series"]:checked'))
        .map(input => input.value);
    const selectedStorage = filterForm.querySelector('input[name="storage"]:checked')?.value || 'all';

    return products.filter(product =>
        matchesSeries(product, selectedSeries) && matchesStorage(product, selectedStorage)
    );
}

function setupProductFilters(products) {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) {
        renderProducts(products);
        return;
    }

    const renderFilteredProducts = () => {
        renderProducts(applyProductFilters(products));
    };

    filterForm.addEventListener('change', renderFilteredProducts);
    renderFilteredProducts();
}

function viewDetails(productId) {
    window.location.href = `details.html?id=${productId}`;
}

async function loadProductDetails(productId) {
    const product = await fetchProductById(productId);
    const container = document.getElementById('product-details');

    if (!container || !product) return;

    container.innerHTML = `
        <div class="product-detail ${isDiscountedProduct(product) ? 'discounted-detail' : ''}">
            <div class="product-detail-media">
                ${isDiscountedProduct(product) ? '<span class="sale-badge">Sale</span>' : ''}
                <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="product-detail-info">
                <p class="detail-category">${product.category?.name || 'Smartphone'}</p>
                <h1>${product.name}</h1>
                ${renderPrice(product)}
                <p class="stock">${product.stock} in stock</p>
                <p class="description">${product.description || 'No description'}</p>
                <div class="product-actions detail-actions">
                    <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}')" class="btn-cart">
                        Add to Cart
                    </button>
                    <button onclick="window.location.href='products.html'" class="btn-details">Browse Products</button>
                </div>
            </div>
        </div>
    `;

    renderSpecs(product);
    renderReviews(product);
}

async function fetchProductById(id) {
    try {
        const response = await apiFetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        return await response.json();
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function getCurrentUser() {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`);
    if (!response.ok) return null;
    return await response.json();
}

async function protectPage() {
    try {
        return await getCurrentUser();
    } catch (error) {
        window.location.href = 'login.html';
        return null;
    }
}

function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);
        await loadCsrfToken();
        formData.append('_csrf', csrfToken);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    [csrfHeaderName]: csrfToken
                },
                body: new URLSearchParams(formData)
            });

            if (response.ok) {
                showStatus('Login successful.');
                window.location.href = 'account.html';
                return;
            }

            showStatus('Invalid username or password.', true);
        } catch (error) {
            showStatus(error.message, true);
        }
    });
}

function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            showStatus('Passwords do not match.', true);
            return;
        }

        try {
            const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password,
                    role: formData.get('role') || 'CUSTOMER'
                })
            });

            if (response.ok) {
                showStatus('Registration successful. You can now log in.');
                form.reset();
                return;
            }

            await showApiError(response, 'Registration failed');
        } catch (error) {
            showStatus(error.message, true);
        }
    });
}

async function setupAccountPage() {
    if (!window.location.pathname.toLowerCase().includes('account')) return;

    const user = await protectPage();
    if (!user) return;

    const greeting = document.getElementById('user-greeting');
    if (greeting) {
        greeting.textContent = `Welcome back, ${user.username}!`;
    }

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await loadCsrfToken();
            const response = await fetch(`${BACKEND_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: { [csrfHeaderName]: csrfToken }
            });

            if (response.ok) {
                window.location.href = 'login.html';
            }
        });
    }
}

async function setupCheckoutPage() {
    if (!window.location.pathname.toLowerCase().includes('checkout')) return;

    const user = await protectPage();
    if (!user) return;

    const emailInput = document.getElementById('email');
    if (emailInput && !emailInput.value) {
        emailInput.value = user.email;
    }

    const cartItems = await getCart();
    renderOrderSummary(cartItems);

    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const cartId = getCartId();
        const formData = new FormData(form);

        try {
            const response = await apiFetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.get('fullName'),
                    customerEmail: formData.get('email'),
                    cartId: Number(cartId)
                })
            });

            if (response.ok) {
                localStorage.removeItem('cartId');
                window.location.href = 'thankyou.html';
                return;
            }

            await showApiError(response, 'Checkout failed');
        } catch (error) {
            showStatus(error.message, true);
        }
    });
}

function renderOrderSummary(cartItems) {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    if (!orderItems || !orderTotal) return;

    const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    orderItems.innerHTML = cartItems.length === 0
        ? '<p class="empty">No items in cart.</p>'
        : cartItems.map(item => `
            <div class="summary-item">
                <img src="${getProductImage(item.product)}" alt="${item.product.name}" onerror="this.src='images/placeholder.jpg'">
                <div>
                    <h3>${item.product.name}</h3>
                    <p>Qty ${item.quantity} x ${formatPrice(item.unitPrice)}</p>
                </div>
                <strong>${formatPrice(item.unitPrice * item.quantity)}</strong>
            </div>
        `).join('');
    orderTotal.textContent = formatPrice(total);
}

async function showApiError(response, fallbackMessage) {
    let message = fallbackMessage;
    try {
        const data = await response.json();
        if (data.errors && Array.isArray(data.errors)) {
            message = data.errors.join('\n');
        } else if (data.message) {
            message = data.message;
        }
    } catch (error) {
        message = `${fallbackMessage} (${response.status})`;
    }
    showStatus(message, true);
    alert(message);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadCsrfToken();
    } catch (error) {
        console.error(error.message);
    }

    setupLoginForm();
    setupRegisterForm();

    const path = window.location.pathname.toLowerCase();

    if (!path.includes('login') && !path.includes('signup')) {
        await initializeCart();
        updateCartCount();
    }

    if (path.includes('index') || path === '/' || path.endsWith('/index.html')) {
        const products = await fetchProducts();
        renderHomeProducts(products);
    } else if (path.includes('products')) {
        const products = await fetchProducts();
        setupProductFilters(products);
    } else if (path.includes('cart')) {
        await renderCart();
        const clearBtn = document.getElementById('clear-cart');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to clear your cart?')) return;

                const cartId = getCartId();
                if (cartId) {
                    const response = await apiFetch(`${API_BASE_URL}/cart/${cartId}/clear`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        updateCartCount();
                        await renderCart();
                    }
                }
            });
        }
    } else if (path.includes('details')) {
        const productId = new URLSearchParams(window.location.search).get('id');
        if (productId) {
            loadProductDetails(productId);
        }
    }

    await setupAccountPage();
    await setupCheckoutPage();
});
