// ============================================
// BASE API URL — your Spring Boot backend
// ============================================
const API_BASE_URL = 'http://localhost:8080/api';

// ============================================
// SESSION MANAGEMENT — Generate or retrieve session ID
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

// ============================================
// CART INITIALIZATION — Create cart on first load
// ============================================

async function initializeCart() {
    const sessionId = getSessionId();
    let cartId = getCartId();
    
    if (!cartId) {
        // Create a new cart in the database
        try {
            const response = await fetch(`${API_BASE_URL}/cart/session/${sessionId}`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const cart = await response.json();
                setCartId(cart.id);
                console.log('Cart initialized with ID:', cart.id);
            }
        } catch (error) {
            console.error('Failed to initialize cart:', error);
        }
    }
}

// ============================================
// CART FUNCTIONS — uses backend API
// ============================================

// Get cart from backend
async function getCart() {
    const cartId = getCartId();
    if (!cartId) return [];
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch cart:', error);
    }
    
    return [];
}

// Add product to cart (backend)
async function addToCart(productId, productName, productPrice, productImage) {
    const cartId = getCartId();
    
    if (!cartId) {
        alert('Cart not initialized. Please refresh the page.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Added to cart:', result);
            updateCartCount();
            alert(`${productName} added to cart!`);
        } else {
            alert('Failed to add product to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error: ' + error.message);
    }
}

// Remove item from cart (backend)
async function removeFromCart(cartItemId) {
    const cartId = getCartId();
    
    if (!cartId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${cartItemId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            renderCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

// Update item quantity (backend)
async function updateQuantity(cartItemId, newQuantity) {
    const cartId = getCartId();
    
    if (!cartId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${cartItemId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });
        
        if (response.ok) {
            renderCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Calculate total price
async function getCartTotal() {
    const cartId = getCartId();
    
    if (!cartId) return 0;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/total`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.total || 0;
        }
    } catch (error) {
        console.error('Error getting cart total:', error);
    }
    
    return 0;
}

// Update cart count badge in header
async function updateCartCount() {
    const cartItems = await getCart();
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
    }
}

// ============================================
// RENDER CART PAGE — call this on Cart.html
// ============================================
async function renderCart() {
    const cartList = document.getElementById('cart-list');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');
    
    if (!cartList) return; // Not on cart page
    
    const cart = await getCart();
    
    // Empty cart message
    if (cart.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'block';
        updateCartSummary(0);
        return;
    }
    
    // Show cart content, hide empty message
    if (cartContent) cartContent.style.display = 'block';
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    // Render cart items as list items
    cartList.innerHTML = cart.map(item => `
        <li class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.product.imageUrl || 'images/placeholder.jpg'}" alt="${item.product.name}">
            </div>
            <div class="item-info">
                <h3>${item.product.name}</h3>
                <p class="price">₱${item.unitPrice.toFixed(2)}</p>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <p class="item-total">₱${(item.unitPrice * item.quantity).toFixed(2)}</p>
            <button onclick="removeFromCart(${item.id})" class="btn-remove">Remove</button>
        </li>
    `).join('');
    
    // Update summary
    const total = await getCartTotal();
    updateCartSummary(total);
}

// Update cart summary section
async function updateCartSummary(total) {
    const subtotalEl = document.getElementById('subtotal-price');
    
    if (subtotalEl) {
        subtotalEl.textContent = `Subtotal: ₱${total.toFixed(2)}`;
    }
}

// ============================================
// FETCH FUNCTIONS — same as before
// ============================================

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const products = await response.json();
        console.log('Products loaded:', products);
        return products;
        
    } catch (error) {
        console.error('Failed to fetch products:', error.message);
        return [];
    }
}

// ============================================
// RENDER PRODUCTS — updated addToCart call
// ============================================

function renderProducts(products) {
    const container = document.getElementById('product-list') 
                   || document.querySelector('.product-grid')
                   || document.querySelector('main');
    
    if (!container) {
        console.error('No product container found');
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="empty">No products available.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.imageUrl || 'images/placeholder.jpg'}" 
                 alt="${product.name}"
                 onerror="this.src='images/placeholder.jpg'">
            <h3>${product.name}</h3>
            <p class="price">₱${product.price ? product.price.toFixed(2) : '0.00'}</p>
            <p class="stock">Stock: ${product.stock || 0}</p>
            <p class="description">${product.description || ''}</p>
            <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl || 'images/placeholder.jpg'}')" class="btn-cart">
                Add to Cart
            </button>
            <button onclick="viewDetails(${product.id})" class="btn-details">Details</button>
        </div>
    `).join('');
}

function viewDetails(productId) {
    window.location.href = `details.html?id=${productId}`;
}

// ============================================
// PAGE INITIALIZATION — runs when any page loads
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded:', window.location.pathname);
    
    // Initialize cart (create if not exists)
    await initializeCart();
    
    // Always update cart count in header
    updateCartCount();
    
    // Check which page we're on and run appropriate function
    const path = window.location.pathname;
    
    if (path.includes('index') || path.includes('products') || path === '/' || path === '/index.html') {
        // Home/Products page — load products
        const products = await fetchProducts();
        renderProducts(products);
        
    } else if (path.includes('Cart') || path.includes('cart')) {
        // Cart page — render cart items
        await renderCart();
        
        // Setup clear cart button
        const clearBtn = document.getElementById('clear-cart');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to clear your cart?')) {
                    const cartId = getCartId();
                    if (cartId) {
                        try {
                            const response = await fetch(`${API_BASE_URL}/cart/${cartId}/clear`, {
                                method: 'DELETE',
                                headers: { 'Accept': 'application/json' }
                            });
                            
                            if (response.ok) {
                                updateCartCount();
                                await renderCart();
                            }
                        } catch (error) {
                            console.error('Error clearing cart:', error);
                        }
                    }
                }
            });
        }
        
    } else if (path.includes('details')) {
        // Details page — load single product
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            loadProductDetails(productId);
        }
    }
});

// Load product details (for details.html)
async function loadProductDetails(productId) {
    const product = await fetchProductById(productId);
    const container = document.getElementById('product-details');
    
    if (!container || !product) return;
    
    container.innerHTML = `
        <div class="product-detail">
            <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}">
            <h1>${product.name}</h1>
            <p class="price">₱${product.price.toFixed(2)}</p>
            <p class="stock">${product.stock} in stock</p>
            <p class="description">${product.description || 'No description'}</p>
            <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl || 'images/placeholder.jpg'}')" class="btn-cart">
                Add to Cart
            </button>
        </div>
    `;
}

async function fetchProductById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Not found');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}