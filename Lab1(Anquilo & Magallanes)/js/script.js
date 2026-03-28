/**
 * iPhone Shop - Laboratory 6: DOM Scripting Implementation
 * 
 * This file implements all Lab 6 requirements:
 * - Task 1: Product Class and data structure
 * - Task 2: Dynamic DOM rendering with createElement
 * - Task 3: Event delegation and cart management
 * - Task 4: Form validation with preventDefault
 * - Task 5: User account with dynamic content
 * - Task 6: CSS animations triggered by JS
 */


// TASK 1: Data Structure - Product Class


/**
 * Product Class
 * ES6 class syntax defining iPhone product structure
 * Replaces hardcoded HTML with dynamic data objects
 */
class Product {
    /**
     * Creates a new Product instance
     * @param {number} id - Unique product identifier
     * @param {string} name - Product name (e.g., "iPhone 17 Pro Max")
     * @param {number} price - Current selling price in PHP
     * @param {string} image - Path to product image file
     * @param {string} series - iPhone series (17, 16, 15, 13)
     * @param {string} storage - Storage capacity (128, 256, 512)
     * @param {Object} specs - Technical specifications object
     * @param {string} description - Short product description
     * @param {number|null} originalPrice - Original price for discounts
     */
    constructor(id, name, price, image, series, storage, specs, description, originalPrice = null) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.series = series;
        this.storage = storage;
        this.specs = specs;
        this.description = description;
        this.originalPrice = originalPrice; // null = not on sale
    }
}

// Array of 10+ Product instances - replaces static HTML product cards
const products = [
    new Product(1, "iPhone 17 Pro Max", 74999, "images/p1.jfif", "17", "256", {
        display: "6.9-inch OLED, 2868x1320",
        processor: "A19 Pro chip",
        camera: "Triple 48MP system",
        battery: "Up to 30 hours",
        weight: "227 grams"
    }, "Latest flagship with titanium design", 84999),
    
    new Product(2, "iPhone 17 Pro", 64999, "images/ip001.jfif", "17", "128", {
        display: "6.3-inch OLED, 2622x1206",
        processor: "A19 Pro chip",
        camera: "Triple 48MP system",
        battery: "Up to 27 hours",
        weight: "199 grams"
    }, "Pro features in a compact size", 74999),
    
    new Product(3, "iPhone 16 Pro Max", 59999, "images/ip16.jfif", "16", "256", {
        display: "6.7-inch OLED, 2796x1290",
        processor: "A18 Pro chip",
        camera: "Triple 48MP system",
        battery: "Up to 29 hours",
        weight: "227 grams"
    }, "Previous generation flagship", 69999),
    
    new Product(4, "iPhone 16", 49999, "images/ip156.jfif", "16", "128", {
        display: "6.1-inch OLED, 2556x1179",
        processor: "A18 chip",
        camera: "Dual 48MP system",
        battery: "Up to 22 hours",
        weight: "170 grams"
    }, "Perfect balance of features"),
    
    new Product(5, "iPhone 15 Pro Max", 54999, "images/ip15.jfif", "15", "256", {
        display: "6.7-inch OLED, 2796x1290",
        processor: "A17 Pro chip",
        camera: "Triple 48MP system",
        battery: "Up to 29 hours",
        weight: "221 grams"
    }, "Titanium design, powerful chip", 64999),
    
    new Product(6, "iPhone 15", 42999, "images/ip002.jfif", "15", "128", {
        display: "6.1-inch OLED, 2556x1179",
        processor: "A16 Bionic chip",
        camera: "Dual 48MP system",
        battery: "Up to 20 hours",
        weight: "171 grams"
    }, "Dynamic Island, USB-C"),
    
    new Product(7, "iPhone 13 Pro", 39999, "images/ip13.jfif", "13", "128", {
        display: "6.1-inch OLED, 2532x1170",
        processor: "A15 Bionic chip",
        camera: "Triple 12MP system",
        battery: "Up to 22 hours",
        weight: "203 grams"
    }, "Still powerful and reliable", 49999),
    
    new Product(8, "iPhone 13", 29999, "images/ip002.jfif", "13", "128", {
        display: "6.1-inch OLED, 2532x1170",
        processor: "A15 Bionic chip",
        camera: "Dual 12MP system",
        battery: "Up to 19 hours",
        weight: "174 grams"
    }, "Great value iPhone", 39999),
    
    new Product(9, "iPhone 17 Plus", 57999, "images/ip17+.jfif", "17", "128", {
        display: "6.7-inch OLED, 2796x1290",
        processor: "A19 chip",
        camera: "Dual 48MP system",
        battery: "Up to 26 hours",
        weight: "201 grams"
    }, "Big screen, standard features"),
    
    new Product(10, "iPhone SE 2024", 24999, "images/ipose4_1.avif", "16", "64", {
        display: "4.7-inch LCD, 1334x750",
        processor: "A16 Bionic chip",
        camera: "Single 12MP",
        battery: "Up to 15 hours",
        weight: "144 grams"
    }, "Compact and affordable")
];


// Global State Management


/**
 * Cart array - holds selected items with quantities
 * Structure: [{ ...product, quantity: number }, ...]
 */
let cart = [];

/**
 * Mock user data for account page demonstration
 * In the future, this would come from backend API
 */
const currentUser = {
    name: "Kai Magallanes",
    email: "kai.magallanes@email.com",
    orderHistory: [
        {
            orderId: "IPH-784321",
            date: "2026-03-15",
            status: "delivered",
            total: 64999,
            items: [{ name: "iPhone 17 Pro", quantity: 1, price: 64999 }]
        },
        {
            orderId: "IPH-784092",
            date: "2025-02-20",
            status: "delivered",
            total: 49999,
            items: [{ name: "iPhone 16", quantity: 1, price: 49999 }]
        }
    ]
};


// Utility Functions


/**
 * Formats price with Philippine Peso symbol and thousand separators
 * @param {number} price - Price value
 * @returns {string} Formatted price string (e.g., "₱74,999")
 */
function formatPrice(price) {
    return '₱' + price.toLocaleString();
}

/**
 * Updates cart count badge in navigation bar
 * Uses reduce() to sum all item quantities
 */
function updateCartCount() {
    // querySelector selects first matching element
    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) {
        // reduce() accumulates total quantity across all cart items
        // sum starts at 0, adds item.quantity for each item
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        // textContent sets text (safer than innerHTML, prevents XSS)
        cartCountElement.textContent = totalCount;
    }
}

/**
 * Persists cart to browser's localStorage
 * Allows cart to survive page refreshes
 */
function saveCart() {
    // localStorage only stores strings, so we JSON.stringify the array
    localStorage.setItem('iphone_shop_cart', JSON.stringify(cart));
}

/**
 * Loads cart from localStorage on page load
 * Parses JSON string back to array
 */
function loadCart() {
    const savedCart = localStorage.getItem('iphone_shop_cart');
    if (savedCart) {
        // JSON.parse converts string back to JavaScript array
        cart = JSON.parse(savedCart);
        updateCartCount(); // Update UI immediately
    }
}


// TASK 2: Dynamic Product Rendering


/**
 * Creates a product card DOM element using native DOM API
 * Demonstrates: createElement, setAttribute, textContent, appendChild
 * 
 * @param {Product} product - Product instance to render
 * @param {boolean} isDiscounted - Whether to show original price strikethrough
 * @returns {HTMLElement} Complete product card article element
 */
function createProductCard(product, isDiscounted = false) {
    // createElement creates new HTML element in memory (not yet in DOM)
    const article = document.createElement('article');
    article.className = 'product-card'; // className sets CSS classes
    article.setAttribute('data-id', product.id); // setAttribute for custom data attributes
    
    // Image container
    const imgDiv = document.createElement('div');
    imgDiv.className = 'img-product';
    
    const img = document.createElement('img');
    img.src = product.image; // Direct property access for standard attributes
    img.alt = product.name;
    imgDiv.appendChild(img); // appendChild adds child to parent
    article.appendChild(imgDiv);
    
    // Product name heading
    const heading = document.createElement('h3');
    heading.textContent = product.name; // textContent sets text (escapes HTML)
    article.appendChild(heading);
    
    // Description paragraph
    const desc = document.createElement('p');
    desc.className = 'info';
    desc.textContent = product.description;
    article.appendChild(desc);
    
    // Price container
    const priceDiv = document.createElement('div');
    priceDiv.className = 'price-row';
    
    const priceSpan = document.createElement('span');
    priceSpan.className = 'price';
    priceSpan.textContent = formatPrice(product.price);
    
    // If discounted, add strikethrough original price
    if (isDiscounted && product.originalPrice) {
        const originalPrice = document.createElement('sup');
        const del = document.createElement('del');
        del.textContent = formatPrice(product.originalPrice);
        originalPrice.appendChild(del);
        priceSpan.appendChild(originalPrice);
    }
    
    priceDiv.appendChild(priceSpan);
    
    // Add to Cart button with data attributes for event delegation
    const button = document.createElement('button');
    button.className = 'add-cart-btn';
    button.setAttribute('data-id', product.id); // Store ID for click handler
    button.setAttribute('data-action', 'add-to-cart'); // Identify action type
    button.textContent = 'Add to Cart';
    priceDiv.appendChild(button);
    
    article.appendChild(priceDiv);
    
    return article; // Return complete element tree
}

/**
 * Renders products to a container using forEach iteration
 * 
 * @param {string} containerId - ID of target container element
 * @param {function|null} filterFn - Optional filter function (e.g., p => p.series === '17')
 */
function renderProducts(containerId, filterFn = null) {
    // querySelector finds element by CSS selector (#id)
    const container = document.querySelector(`#${containerId}`);
    if (!container) return; // Guard clause if element not found
    
    // Remove all existing children using while loop
    // firstChild returns first child node, removeChild removes it
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Filter products if filter function provided, else use all
    const productsToRender = filterFn ? products.filter(filterFn) : products;
    
    // forEach iterates array, calling function for each element
    productsToRender.forEach((product, index) => {
        const card = createProductCard(product);
        // Stagger animation delays for visual cascade effect
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card); // Add to DOM
    });
}

/**
 * Renders featured and discounted sections on homepage
 */
function renderFeaturedProducts() {
    // Featured: Latest iPhone 17 series only
    renderProducts('featured-container', p => p.series === '17');
    
    // Discounted: Products with originalPrice set
    const discountedContainer = document.querySelector('#discounted-container');
    if (discountedContainer) {
        // Clear existing
        while (discountedContainer.firstChild) {
            discountedContainer.removeChild(discountedContainer.firstChild);
        }
        
        // filter() creates new array with items where originalPrice exists
        const discounted = products.filter(p => p.originalPrice);
        
        discounted.forEach((product, index) => {
            const card = createProductCard(product, true); // true = show discount
            card.style.animationDelay = `${index * 0.1}s`;
            discountedContainer.appendChild(card);
        });
    }
}


// TASK 3: Event Handling & Cart System


/**
 * Adds product to cart or increments existing quantity
 * Uses find() to check for existing items
 * 
 * @param {number} productId - ID of product to add
 * @param {number} quantity - Quantity to add (default 1)
 */
function addToCart(productId, quantity = 1) {
    // find() returns first matching element or undefined
    const product = products.find(p => p.id === productId);
    if (!product) return; // Exit if product not found
    
    // Check if already in cart using find()
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // If exists, increment quantity
        existingItem.quantity += quantity;
    } else {
        // If new, add to cart with spread operator (...) to copy all properties
        // plus new quantity property
        cart.push({ ...product, quantity: quantity });
    }
    
    // Persist and update UI
    saveCart();
    updateCartCount();
    
    // Visual feedback animations
    animateCard(productId);
    
    // Button text feedback
    const button = document.querySelector(`button[data-id="${productId}"]`);
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Added ✓';
        button.style.background = '#27ae60'; // Green success color
        
        // setTimeout delays execution (ms)
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1000);
    }
}

/**
 * Removes item from cart using filter()
 * filter() creates new array excluding matching items
 * 
 * @param {number} productId - ID to remove
 */
function removeFromCart(productId) {
    // filter keeps items where condition is true
    // So we keep items where id does NOT match (removes matching)
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart(); // Re-render cart display
}

/**
 * Updates item quantity or removes if 0
 * 
 * @param {number} productId - Item to update
 * @param {number} newQuantity - New quantity value
 */
function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity); // Convert string to integer
    
    if (quantity <= 0) {
        // Remove using filter (Lab 6 requirement demonstration)
        cart = cart.filter(item => item.id !== productId);
    } else {
        // Find item and update quantity directly
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
        }
    }
    
    saveCart();
    updateCartCount();
    renderCart(); // Update display with new totals
}

/**
 * Renders cart items to the cart page
 * Demonstrates: forEach, createElement, reduce for totals
 */
function renderCart() {
    const cartList = document.querySelector('#cart-list');
    const emptyMessage = document.querySelector('#empty-cart-message');
    const cartContent = document.querySelector('#cart-content');
    const subtotalElement = document.querySelector('#subtotal-price');
    
    if (!cartList) return;
    
    // Handle empty cart state
    if (cart.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    // Show cart, hide empty message
    if (emptyMessage) emptyMessage.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
    
    // Clear existing items
    while (cartList.firstChild) {
        cartList.removeChild(cartList.firstChild);
    }
    
    // Render each cart item using forEach
    cart.forEach(item => {
        const li = document.createElement('li');
        
        // Product thumbnail
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        li.appendChild(img);
        
        // Product info div
        const infoDiv = document.createElement('div');
        infoDiv.style.flex = '1';
        
        const name = document.createElement('h3');
        name.textContent = item.name;
        infoDiv.appendChild(name);
        
        const storage = document.createElement('p');
        storage.textContent = `${item.storage}GB • ${item.series} Series`;
        storage.style.color = '#666';
        storage.style.fontSize = '0.9rem';
        infoDiv.appendChild(storage);
        
        li.appendChild(infoDiv);
        
        // Price display
        const price = document.createElement('span');
        price.textContent = formatPrice(item.price);
        price.style.fontWeight = 'bold';
        li.appendChild(price);
        
        // Quantity input with change listener
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = item.quantity;
        quantityInput.style.width = '60px';
        
        // addEventListener attaches function to element events
        quantityInput.addEventListener('change', (e) => {
            updateQuantity(item.id, e.target.value);
        });
        li.appendChild(quantityInput);
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.style.background = '#e74c3c';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '4px';
        removeBtn.style.padding = '4px 12px';
        removeBtn.style.cursor = 'pointer';
        
        // Inline event handler for remove
        removeBtn.addEventListener('click', () => removeFromCart(item.id));
        li.appendChild(removeBtn);
        
        cartList.appendChild(li);
    });
    
    // Calculate subtotal using reduce()
    // reduce takes: (accumulator, currentItem) => newAccumulator
    // Starts at 0, adds price * quantity for each item
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (subtotalElement) {
        subtotalElement.textContent = `Subtotal: ${formatPrice(subtotal)}`;
    }
}

/**
 * TASK 3: Event Delegation Implementation
 * 
 * Instead of adding listeners to every button (expensive),
 * we add ONE listener to document.body and check event.target
 * This is more efficient for dynamically created elements
 */
function setupEventDelegation() {
    // Single click listener on body catches all bubbled clicks
    document.body.addEventListener('click', (event) => {
        // closest() finds nearest ancestor (or self) matching selector
        // This handles clicks on button or its children
        const button = event.target.closest('[data-action="add-to-cart"]');
        
        if (button) {
            // preventDefault stops default button behavior (form submit, etc.)
            event.preventDefault();
            
            // getAttribute retrieves data-id value as string, parseInt to number
            const productId = parseInt(button.getAttribute('data-id'));
            
            // Check for quantity input (on details page)
            const quantityInput = document.querySelector('#qnty');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            addToCart(productId, quantity);
        }
    });
}


// TASK 4: Form Validation & Submission


/**
 * Sets up checkout form validation
 * Uses: preventDefault, querySelector, classList.add, textContent
 */
function setupCheckoutValidation() {
    const form = document.querySelector('#checkout-form');
    if (!form) return; // Exit if not on checkout page
    
    // Submit event fires when form is submitted
    form.addEventListener('submit', (event) => {
        // CRITICAL: preventDefault() stops page reload
        // Allows JS validation before submission
        event.preventDefault();
        
        let isValid = true; // Track overall validation state
        
        // Field definitions with validation rules
        const fields = [
            { id: 'full-name', name: 'Full Name', required: true, minLength: 2 },
            { id: 'email', name: 'Email', required: true, type: 'email' },
            { id: 'phone', name: 'Phone', required: true, pattern: /^[\d\s\-\+\(\)]+$/ },
            { id: 'address', name: 'Address', required: true, minLength: 5 },
            { id: 'city', name: 'City', required: true, minLength: 2 },
            { id: 'zip', name: 'ZIP Code', required: true, pattern: /^\d{4}$/ }
        ];
        
        // Check payment method (affects card validation)
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        const isCardPayment = paymentMethod && paymentMethod.value === 'card';
        
        // Validate each field using forEach
        fields.forEach(field => {
            const input = document.querySelector(`#${field.id}`);
            const errorSpan = input ? input.nextElementSibling : null;
            
            if (!input) return; // Skip if element not found
            
            let fieldValid = true;
            let errorMessage = '';
            
            // Validation logic chain
            if (field.required && input.value.trim() === '') {
                fieldValid = false;
                errorMessage = `${field.name} is required`;
            } else if (field.minLength && input.value.trim().length < field.minLength) {
                fieldValid = false;
                errorMessage = `${field.name} must be at least ${field.minLength} characters`;
            } else if (field.type === 'email' && !input.value.includes('@')) {
                fieldValid = false;
                errorMessage = 'Please enter a valid email';
            } else if (field.pattern && !field.pattern.test(input.value.trim())) {
                fieldValid = false;
                errorMessage = `Please enter a valid ${field.name}`;
            }
            
            // Apply or remove error styling using classList
            if (!fieldValid) {
                isValid = false;
                // classList.add adds CSS class (for red border styling)
                input.classList.add('error');
                if (errorSpan) {
                    // textContent sets error message text
                    errorSpan.textContent = errorMessage;
                    errorSpan.style.display = 'block';
                }
            } else {
                // classList.remove removes CSS class
                input.classList.remove('error');
                if (errorSpan) {
                    errorSpan.textContent = '';
                    errorSpan.style.display = 'none';
                }
            }
        });
        
        // Conditional card field validation
        if (isCardPayment) {
            const cardFields = [
                { id: 'card-number', pattern: /^[\d\s]{13,19}$/, message: 'Enter valid card number' },
                { id: 'expiry', pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Use MM/YY format' },
                { id: 'cvv', pattern: /^\d{3}$/, message: '3 digits required' }
            ];
            
            cardFields.forEach(field => {
                const input = document.querySelector(`#${field.id}`);
                const errorSpan = input ? input.nextElementSibling : null;
                
                if (input && !field.pattern.test(input.value.trim())) {
                    isValid = false;
                    input.classList.add('error');
                    if (errorSpan) {
                        errorSpan.textContent = field.message;
                        errorSpan.style.display = 'block';
                    }
                }
            });
        }
        
        // If all valid, complete purchase
        if (isValid) {
            // Simulate order processing
            cart = [];
            saveCart();
            updateCartCount();
            // Redirect to thank you page
            window.location.href = 'thankyou.html';
        }
    });
    
    // Payment method toggle - show/hide card fields
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardFields = document.querySelector('#card-fields');
    
    paymentRadios.forEach(radio => {
        // change event fires when radio selection changes
        radio.addEventListener('change', () => {
            if (cardFields) {
                // Toggle visibility based on selection
                cardFields.style.display = radio.value === 'card' ? 'block' : 'none';
            }
        });
    });
}

/**
 * Renders order summary on checkout page
 */
function renderCheckoutSummary() {
    const container = document.querySelector('#order-items');
    const totalElement = document.querySelector('#order-total');
    
    if (!container) return;
    
    // Clear container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Render each item
    cart.forEach(item => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '10px';
        div.style.paddingBottom = '10px';
        div.style.borderBottom = '1px solid #ddd';
        
        const name = document.createElement('span');
        name.textContent = `${item.name} x${item.quantity}`;
        
        const price = document.createElement('span');
        price.textContent = formatPrice(item.price * item.quantity);
        
        div.appendChild(name);
        div.appendChild(price);
        container.appendChild(div);
    });
    
    // Calculate total with reduce
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }
}


// TASK 5: User Account & Order History


/**
 * Renders account page with dynamic user data
 * Uses textContent for safe text insertion
 * Uses details/summary for expandable orders
 */
function renderAccountPage() {
    // Update greeting with user name
    const greeting = document.querySelector('#user-greeting');
    if (greeting) {
        // textContent prevents HTML injection (security)
        greeting.textContent = `Welcome, ${currentUser.name}!`;
    }
    
    // Update order count statistic
    const totalOrdersElement = document.querySelector('#total-orders');
    if (totalOrdersElement) {
        totalOrdersElement.textContent = currentUser.orderHistory.length;
    }
    
    // Render order history
    const container = document.querySelector('#orders-container');
    if (!container) return;
    
    // Clear existing
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Create details/summary for each order
    currentUser.orderHistory.forEach(order => {
        // details element creates collapsible content
        const details = document.createElement('details');
        details.className = 'order-card';
        
        // summary is the always-visible header
        const summary = document.createElement('summary');
        
        // Header layout with flexbox
        const headerInfo = document.createElement('div');
        headerInfo.style.display = 'flex';
        headerInfo.style.justifyContent = 'space-between';
        headerInfo.style.alignItems = 'center';
        headerInfo.style.width = '100%';
        
        const orderMeta = document.createElement('span');
        orderMeta.innerHTML = `<strong>${order.orderId}</strong> • ${order.date}`;
        
        // Status badge with conditional styling
        const status = document.createElement('span');
        status.style.padding = '4px 12px';
        status.style.borderRadius = '12px';
        status.style.fontSize = '0.8rem';
        status.style.fontWeight = 'bold';
        
        if (order.status === 'delivered') {
            status.style.background = '#d4edda';
            status.style.color = '#155724';
            status.textContent = 'Delivered';
        } else {
            status.style.background = '#fff3cd';
            status.style.color = '#856404';
            status.textContent = 'Processing';
        }
        
        const total = document.createElement('span');
        total.style.fontWeight = 'bold';
        total.textContent = formatPrice(order.total);
        
        headerInfo.appendChild(orderMeta);
        headerInfo.appendChild(status);
        headerInfo.appendChild(total);
        summary.appendChild(headerInfo);
        details.appendChild(summary);
        
        // Expandable content area
        const orderDetails = document.createElement('div');
        orderDetails.style.padding = '15px';
        orderDetails.style.background = '#f8f9fa';
        
        // List items in order
        order.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.padding = '8px 0';
            itemDiv.style.borderBottom = '1px solid #dee2e6';
            
            const itemName = document.createElement('span');
            itemName.textContent = `${item.name} x${item.quantity}`;
            
            const itemPrice = document.createElement('span');
            itemPrice.textContent = formatPrice(item.price * item.quantity);
            
            itemDiv.appendChild(itemName);
            itemDiv.appendChild(itemPrice);
            orderDetails.appendChild(itemDiv);
        });
        
        // Order total
        const orderTotal = document.createElement('div');
        orderTotal.style.textAlign = 'right';
        orderTotal.style.marginTop = '10px';
        orderTotal.style.fontWeight = 'bold';
        orderTotal.textContent = `Total: ${formatPrice(order.total)}`;
        orderDetails.appendChild(orderTotal);
        
        details.appendChild(orderDetails);
        container.appendChild(details);
        
        // Event listener for expand/collapse
        summary.addEventListener('click', () => {
            console.log(`Viewing order ${order.orderId}`);
        });
    });
}


// TASK 6: Animations


/**
 * Triggers bounce animation on product card
 * Uses classList to add/remove animation class
 * 
 * @param {number} productId - Product to animate
 */
function animateCard(productId) {
    // Select card by data-id attribute
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (card) {
        // classList.add adds CSS animation class
        card.classList.add('bounce-me');
        
        // setTimeout removes class after animation completes
        // This allows animation to be re-triggered later
        setTimeout(() => {
            card.classList.remove('bounce-me');
        }, 500); // 500ms matches CSS animation duration
    }
}


// Product Details Page


/**
 * Renders dynamic product details page
 * Gets product ID from URL query parameter
 */
function renderProductDetails() {
    // URLSearchParams parses query string (?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;
    
    // Find product in array
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Render product info section
    const container = document.querySelector('#product-details');
    if (container) {
        // Using template literal for HTML structure
      
        container.innerHTML = `
            <h1>${product.name}</h1>
            <div class="img-product">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <p class="price">${formatPrice(product.price)}</p>
            <p>${product.description}</p>
        `;
    }
    
    // Render specifications table dynamically
    const specsTable = document.querySelector('#specs-table');
    if (specsTable && product.specs) {
        const specs = product.specs;
        specsTable.innerHTML = `
            <tr><th>Display</th><td>${specs.display}</td></tr>
            <tr><th>Processor</th><td>${specs.processor}</td></tr>
            <tr><th>Camera</th><td>${specs.camera}</td></tr>
            <tr><th>Battery</th><td>${specs.battery}</td></tr>
            <tr><th>Storage</th><td>${product.storage}GB</td></tr>
            <tr><th>Weight</th><td>${specs.weight}</td></tr>
        `;
    }
    
    // Update add button with correct product ID
    const addButton = document.querySelector('button[data-action="add-to-cart"]');
    if (addButton) {
        addButton.setAttribute('data-id', product.id);
    }
}


// Filter Functionality


/**
 * Sets up product filtering by series and storage
 * Uses change event on form inputs
 */
function setupFilters() {
    const filterForm = document.querySelector('#filter-form');
    if (!filterForm) return;
    
    // change event fires when any input changes
    filterForm.addEventListener('change', () => {
        // FormData collects all form values
        const formData = new FormData(filterForm);
        const selectedSeries = formData.getAll('series'); // All checked checkboxes
        const selectedStorage = formData.get('storage');   // Selected radio
        
        // Render with filter function
        renderProducts('product-container', product => {
            // Check if product matches selected filters
            const seriesMatch = selectedSeries.length === 0 || selectedSeries.includes(product.series);
            const storageMatch = selectedStorage === 'all' || product.storage === selectedStorage;
            return seriesMatch && storageMatch;
        });
    });
}


// Application Initialization


/**
 * DOMContentLoaded fires when HTML is fully parsed
 * All DOM manipulation happens inside this event
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load persisted cart data
    loadCart();
    
    // Setup event delegation for cart buttons (Task 3)
    setupEventDelegation();
    
    // Setup form validation (Task 4)
    setupCheckoutValidation();
    
    // Setup product filtering
    setupFilters();
    
    // Determine current page and render appropriate content
    const currentPage = window.location.pathname;
    
    // Homepage: featured and discounted products
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
        renderFeaturedProducts();
    }
    
    // Products page: all products with filters
    if (currentPage.includes('products.html')) {
        renderProducts('product-container');
    }
    
    // Cart page: shopping cart
    if (currentPage.includes('Cart.html')) {
        renderCart();
        
        // Setup clear cart button
        const clearBtn = document.querySelector('#clear-cart');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear your cart?')) {
                    cart = [];
                    saveCart();
                    updateCartCount();
                    renderCart();
                }
            });
        }
    }
    
    // Checkout page: order summary
    if (currentPage.includes('checkout.html')) {
        renderCheckoutSummary();
    }
    
    // Account page: user info and orders
    if (currentPage.includes('account.html')) {
        renderAccountPage();
    }
    
    // Details page: single product view
    if (currentPage.includes('details.html')) {
        renderProductDetails();
    }
    
    console.log('iPhone Shop initialized. Cart items:', cart.length);
});