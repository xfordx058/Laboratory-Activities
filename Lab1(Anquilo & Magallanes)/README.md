# E-Commerce Full-Stack Application
## Full-Stack E-Commerce with Spring Boot, JWT Authentication & REST API

**Labs 1-10** demonstrates a full-stack e-commerce application with database integration, JWT authentication, and REST API design.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [Entity Relationships](#entity-relationships)
4. [API Endpoints](#api-endpoints)
5. [Frontend Architecture](#frontend-architecture)
6. [CORS Configuration](#cors-configuration)
7. [Setup & Installation](#setup--installation)
8. [Running the Application](#running-the-application)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

This is a **full-stack e-commerce application** built with:

- **Backend**: Spring Boot 3.2.0 + Spring Data JPA + MySQL
- **Frontend**: HTML5 + CSS3 + ES6 JavaScript (Fetch API)
- **Database**: MySQL with persistent data storage
- **Architecture**: MVC (Model-View-Controller) with Repository Pattern

### Key Features

✅ Database-backed product catalog (no hardcoded arrays)  
✅ Category-based product filtering with JPQL queries  
✅ Dynamic frontend rendering using Fetch API  
✅ Full CRUD operations with error handling  
✅ Responsive design (Lab 3 media queries)  
✅ Global exception handling with @ControllerAdvice  
✅ CORS configuration for cross-origin requests  
✅ Session management with LocalStorage  

### Constraint: Full-Stack Integration

> **All data must be persisted to the database.** The frontend successfully communicates with the new database-backed backend via REST API calls. No more hardcoded arrays.

---

## 🗄️ Database Schema

### Database Connection

**Database**: `ecommerce_db` (MySQL)  
**Host**: `localhost:3306`  
**Configuration** (via `application.properties`):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

### Table Structure

#### 1. **categories** Table
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);
```

**Sample Data**:
```
| id | name            |
|----|-----------------|
| 1  | iPhone 17       |
| 2  | iPhone 16       |
| 3  | iPhone 15       |
| 4  | iPhone 13       |
```

#### 2. **products** Table
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    price DOUBLE NOT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(255),
    category_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

**Sample Data**:
```
| id | name                      | price  | stock | category_id | image_url         |
|----|---------------------------|--------|-------|-------------|-------------------|
| 1  | iPhone 17 Pro Max 256GB   | 1199.99| 50    | 1           | ip17+.avif        |
| 2  | iPhone 17 128GB           | 899.99 | 75    | 1           | ip17.jfif         |
| 3  | iPhone 16 Pro 512GB       | 1099.99| 30    | 2           | ip16.jfif         |
| 4  | iPhone 15 Standard        | 799.99 | 100   | 3           | ip15.jfif         |
```

#### 3. **orders** Table
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DOUBLE NOT NULL
);
```

#### 4. **order_items** Table
```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### 5. **carts** Table
```sql
CREATE TABLE carts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. **cart_items** Table
```sql
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    product_id BIGINT,
    quantity INT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 🔗 Entity Relationships

### ERD (Entity Relationship Diagram)

```
Category (1) ──────────┐
                        │ OneToMany
                        ├──────────── Product (Many)
                        │
                   @ManyToOne
                   @JoinColumn
                  (category_id FK)

Order (1) ──────────────┐
                         │ OneToMany
                         ├──────────── OrderItem (Many)
                         │
                    @OneToMany
                    @JsonIgnore

OrderItem (Many) ──┐
                    │ ManyToOne
                    ├──────────── Product (1)
```

### Relationship Explanations

#### 1. **Category ↔ Product** (One-to-Many)

**Relationship**: One category has many products.

**Category Entity** (Parent/Inverse Side):
```java
@OneToMany(
    mappedBy = "category",
    cascade = CascadeType.ALL,
    orphanRemoval = true,
    fetch = FetchType.LAZY
)
private List<Product> products = new ArrayList<>();
```

- **`mappedBy`**: Refers to the field name in `Product.java` (not DB column)
- **`CascadeType.ALL`**: Save/delete operations propagate to products
- **`orphanRemoval`**: Removing a product from the list deletes it from DB
- **`FetchType.LAZY`**: Products are loaded only when accessed

**Product Entity** (Child/Owning Side):
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "category_id")
private Category category;
```

- **`@JoinColumn`**: Creates the foreign key column in the `products` table
- **`FetchType.LAZY`**: Category is loaded only when accessed

#### 2. **Order ↔ OrderItem** (One-to-Many)

**Relationship**: One order has many order items.

**Order Entity**:
```java
@OneToMany(
    mappedBy = "order",
    cascade = CascadeType.ALL,
    orphanRemoval = true,
    fetch = FetchType.LAZY
)
@JsonIgnore
private List<OrderItem> orderItems = new ArrayList<>();
```

**OrderItem Entity**:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "order_id")
private Order order;
```

#### 3. **Cart ↔ CartItem** (One-to-Many)

**Relationship**: One cart has many cart items (for shopping cart functionality).

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api` and configured with CORS at `/api/**`.

### Base URL
```
http://localhost:8080/api
```

### Product Endpoints

#### 1. Get All Products
```http
GET /products
```

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "name": "iPhone 17 Pro Max",
        "price": 1199.99,
        "stock": 50,
        "imageUrl": "ip17+.avif",
        "description": "Latest flagship model",
        "category": { "id": 1, "name": "iPhone 17" }
    },
    {
        "id": 2,
        "name": "iPhone 16 Pro",
        "price": 999.99,
        "stock": 75,
        "imageUrl": "ip16.jfif",
        "description": "Previous generation",
        "category": { "id": 2, "name": "iPhone 16" }
    }
]
```

#### 2. Get Product by ID
```http
GET /products/{id}
```

**Example**: `GET /products/1`

**Response**: `200 OK`
```json
{
    "id": 1,
    "name": "iPhone 17 Pro Max",
    "price": 1199.99,
    "stock": 50,
    "imageUrl": "ip17+.avif",
    "category": { "id": 1, "name": "iPhone 17" }
}
```

**Error Response**: `404 NOT_FOUND`
```json
{
    "error": "Product not found",
    "statusCode": 404,
    "timestamp": "2024-04-28T10:30:00"
}
```

#### 3. Get Products by Category
```http
GET /products/category/{categoryName}
```

**Example**: `GET /products/category/iPhone%2017`

**Response**: `200 OK`
```json
[
    { "id": 1, "name": "iPhone 17 Pro Max", "price": 1199.99, ... },
    { "id": 2, "name": "iPhone 17 Standard", "price": 899.99, ... }
]
```

#### 4. Create Product
```http
POST /products
Content-Type: application/json
```

**Request Body**:
```json
{
    "name": "iPhone 17 Plus",
    "description": "New plus model",
    "price": 999.99,
    "stock": 100,
    "imageUrl": "ip17plus.jfif",
    "category": { "id": 1 }
}
```

**Response**: `201 CREATED`
```json
{
    "id": 5,
    "name": "iPhone 17 Plus",
    "price": 999.99,
    "stock": 100,
    "category": { "id": 1, "name": "iPhone 17" }
}
```

#### 5. Update Product
```http
PUT /products/{id}
Content-Type: application/json
```

**Example**: `PUT /products/1`

**Request Body**:
```json
{
    "name": "iPhone 17 Pro Max (Updated)",
    "price": 1249.99,
    "stock": 40
}
```

**Response**: `200 OK`

#### 6. Delete Product
```http
DELETE /products/{id}
```

**Example**: `DELETE /products/1`

**Response**: `204 NO_CONTENT`

---

## 🎨 Frontend Architecture

### File Structure
```
├── index.html              # Homepage
├── products.html           # Product listing page
├── Cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── details.html            # Product details
├── thankyou.html           # Order confirmation
├── css(lab2)/
│   └── style.css           # Global styling with media queries
├── js/
│   └── script.js           # Fetch API + Cart logic
└── images/
    └── (product images)
```

### Fetch API Implementation

#### Utility Function: `fetchProducts()`

**Location**: `js/script.js`

```javascript
/**
 * Fetch all products from the database.
 * Uses async/await for cleaner asynchronous code.
 * Includes error handling for network failures and HTTP errors.
 */
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        // Manual check for HTTP errors
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Products endpoint not found (404)');
            } else if (response.status === 500) {
                throw new Error('Server error (500). Please try again later.');
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('✓ Products loaded from DB:', products);
        
        if (products.length === 0) {
            console.warn('⚠️ No products found in database. Empty state detected.');
            renderEmptyState();
        } else {
            renderProductGrid(products);
        }
        
        return products;
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
        renderErrorState(error.message);
    }
}
```

#### Dynamic HTML Rendering

```javascript
/**
 * Render product grid dynamically into the <main> container.
 * Injects HTML for each product without hardcoded arrays.
 */
function renderProductGrid(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="images/${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="category">Category: ${product.category.name}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="stock">Stock: ${product.stock}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

/**
 * Handle empty state when no products are available.
 */
function renderEmptyState() {
    const container = document.getElementById('product-container');
    container.innerHTML = `
        <div class="empty-state">
            <p>No products available at the moment.</p>
            <p>Please check back later!</p>
        </div>
    `;
}

/**
 * Handle error state with user-friendly messaging.
 */
function renderErrorState(errorMessage) {
    const container = document.getElementById('product-container');
    container.innerHTML = `
        <div class="error-state">
            <p>⚠️ Failed to load products</p>
            <p>${errorMessage}</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
}
```

#### Page Load Hook

```javascript
/**
 * Initialize cart and fetch products when page loads.
 */
document.addEventListener('DOMContentLoaded', async () => {
    await initializeCart();
    await fetchProducts();
});
```

#### Error Handling in Add to Cart

```javascript
/**
 * Add product to cart with full error handling.
 * Demonstrates POST request with try/catch.
 */
async function addToCart(productId) {
    const cartId = getCartId();
    
    if (!cartId) {
        alert('Cart not initialized. Please refresh the page.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Product not found. It may have been deleted.');
            } else if (response.status === 400) {
                throw new Error('Invalid request. Please check the product details.');
            }
            throw new Error(`Failed to add to cart (HTTP ${response.status})`);
        }
        
        const updatedCart = await response.json();
        console.log('✓ Item added to cart:', updatedCart);
        updateCartUI();
        
    } catch (error) {
        console.error('❌ Error adding to cart:', error.message);
        alert(`Error: ${error.message}`);
    }
}
```

---

## 🌐 CORS Configuration

### Global CORS Setup

**File**: `src/main/java/com/ecommerce/config/WebConfig.java`

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5500", "http://127.0.0.1:5500")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Content-Type", "Accept")
            .allowCredentials(true)
            .maxAge(3600);  // Cache preflight for 1 hour
    }
}
```

### Allowed Origins
- `http://localhost:5500` (Live Reload extension)
- `http://127.0.0.1:5500` (Alternative localhost)

### Allowed Methods
- **GET**: Retrieve products
- **POST**: Create products / Add to cart
- **PUT**: Update products
- **DELETE**: Remove products
- **OPTIONS**: Preflight requests

### Browser Console Verification

When requests succeed, you should see in the browser console:

```
✓ Products loaded from DB: Array(4) [ {...}, {...}, {...}, {...} ]
```

If CORS errors occur, you'll see:

```
❌ Error: Access to XMLHttpRequest at 'http://localhost:8080/api/products'
    from origin 'http://localhost:5500' has been blocked by CORS policy
```

**Solution**: Verify the origin is added to `allowedOrigins` in `WebConfig.java`.

---

## 🚀 Setup & Installation

### Prerequisites

- **Java**: JDK 17 or higher
- **Maven**: 3.8.1 or higher
- **MySQL**: 8.0 or higher
- **Node.js** (optional, for Live Server): 16+

### Step 1: Clone and Navigate

```bash
cd "Laboratory-Activities\Lab1(Anquilo & Magallanes)"
```

### Step 2: Database Setup

1. **Start MySQL**:
   ```bash
   mysql -u root -p
   ```

2. **Create Database** (optional, auto-created by Hibernate):
   ```sql
   CREATE DATABASE ecommerce_db;
   USE ecommerce_db;
   ```

3. **Insert Sample Data**:
   ```sql
   INSERT INTO categories (name) VALUES
   ('iPhone 17'), ('iPhone 16'), ('iPhone 15'), ('iPhone 13');
   
   INSERT INTO products (name, price, stock, image_url, category_id, description) VALUES
   ('iPhone 17 Pro Max 256GB', 1199.99, 50, 'ip17+.avif', 1, 'Latest flagship model'),
   ('iPhone 17 Standard 128GB', 899.99, 75, 'ip17.jfif', 1, 'Entry-level iPhone 17'),
   ('iPhone 16 Pro 512GB', 1099.99, 30, 'ip16.jfif', 2, 'Previous generation pro'),
   ('iPhone 15 Standard', 799.99, 100, 'ip15.jfif', 3, 'Affordable iPhone 15');
   ```

### Step 3: Backend Configuration

**File**: `backend/src/main/resources/application.properties`

Update credentials if needed:
```properties
spring.datasource.username=root
spring.datasource.password=<your_mysql_password>
```

### Step 4: Build Backend

```bash
cd backend
mvn clean install
```

---

## 🏃 Running the Application

### Terminal 1: Start Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

Expected output:
```
Started EcommerceApplication in 3.245 seconds (JVM running for 3.562s)
```

Backend will be available at: `http://localhost:8080`

### Terminal 2: Start Frontend (Live Server)

**Option A: Using Live Server extension in VS Code**
1. Right-click on `index.html`
2. Select "Open with Live Server"
3. Frontend will open at `http://localhost:5500`

**Option B: Using Python**
```bash
# Python 3.x
python -m http.server 5500
```

**Option C: Using Node.js**
```bash
npx live-server --port=5500
```

---

## 🧪 Testing

### 1. Postman API Testing

#### Test Case: Get All Products

```http
GET http://localhost:8080/api/products
```

**Steps**:
1. Open Postman
2. Create a new GET request
3. Enter the URL: `http://localhost:8080/api/products`
4. Click "Send"

**Expected Response**:
- Status: `200 OK`
- Body: Array of products with DB data

**Verification**: Check that products are from the database (data persists after server restart)

#### Test Case: Filter by Category

```http
GET http://localhost:8080/api/products/category/iPhone%2017
```

**Expected Response**:
- Status: `200 OK`
- Body: Only products in "iPhone 17" category

#### Test Case: Create Product

```http
POST http://localhost:8080/api/products
Content-Type: application/json

{
    "name": "iPhone 17 Plus",
    "description": "New plus variant",
    "price": 999.99,
    "stock": 50,
    "imageUrl": "ip17plus.jfif",
    "category": { "id": 1 }
}
```

**Expected Response**:
- Status: `201 CREATED`
- Body: New product with generated ID

#### Test Case: Server Restart Persistence

1. Stop Spring Boot (Ctrl+C)
2. Run `mvn spring-boot:run` again
3. Query products with GET `/api/products`

**Expected Result**: ✅ All products still exist (data is persistent)

### 2. Browser Console Testing

#### Open Console

1. Open `http://localhost:5500` in browser
2. Press `F12` to open Developer Tools
3. Go to "Console" tab

#### Expected Console Output

```
✓ Products loaded from DB: Array(4) [
    { id: 1, name: "iPhone 17 Pro Max", price: 1199.99, ... },
    { id: 2, name: "iPhone 17 Standard", price: 899.99, ... },
    { id: 3, name: "iPhone 16 Pro", price: 1099.99, ... },
    { id: 4, name: "iPhone 15 Standard", price: 799.99, ... }
]
```

#### Check for CORS Errors

Look for messages like:
```
❌ Error: Access to XMLHttpRequest at 'http://localhost:8080/api/products'
    from origin 'http://localhost:5500' has been blocked by CORS policy
```

If CORS errors appear:
1. Verify origin in `WebConfig.java`
2. Restart Spring Boot
3. Hard refresh browser (Ctrl+Shift+R)

#### Network Tab

1. Open Developer Tools → "Network" tab
2. Filter by "Fetch/XHR"
3. Reload page

**Expected Requests**:
- `GET /api/products` → Status: `200`
- Response shows full product JSON

### 3. Responsive Design Testing

**Mobile View (Lab 3 Media Queries)**:

1. Open Developer Tools → Device Toolbar (Ctrl+Shift+M)
2. Select "iPhone 12 Pro" or similar
3. Reload page

**Expected**:
- Product grid adapts to mobile layout
- Navigation remains responsive
- Images scale properly
- Dynamic content loads correctly on small screens

---

## 🗂️ Version Control Workflow

### Branch Strategy (Git)

#### 1. Feature Branch: Database Integration

```bash
# Create feature branch
git checkout -b feat:db-integration

# Make changes to:
# - application.properties (DB config)
# - Entity classes (@Entity, @Table, relationships)
# - Repositories (JpaRepository)
# - Services (refactor ArrayList → Repository)
# - Controllers (error handling)

# Commit changes
git add .
git commit -m "feat: Add database integration with JPA entities and relationships"

# Example commits:
git commit -m "feat: Add database configuration in application.properties"
git commit -m "feat: Create JPA entities (Product, Category, Order, OrderItem)"
git commit -m "feat: Implement repository layer with custom queries"
git commit -m "feat: Refactor services to use repositories instead of ArrayList"
git commit -m "feat: Add global exception handling with @ControllerAdvice"
```

#### 2. Feature Branch: Frontend Fetch API

```bash
git checkout -b feat:fetch-api

# Update js/script.js with:
# - fetchProducts() async function
# - Error handling (try/catch)
# - Dynamic HTML rendering
# - Empty state handling

git add js/script.js
git commit -m "feat: Integrate Fetch API for dynamic product loading"
```

#### 3. Fix Branch: CORS Configuration

```bash
git checkout -b iss1:cors-resolution

# Update WebConfig.java with CORS configuration

git add backend/src/main/java/com/ecommerce/config/WebConfig.java
git commit -m "iss1: Resolve CORS errors by configuring global CORS mappings"
```

#### 4. Documentation Branch

```bash
git checkout -b docs:readme-update

# Create/update README.md

git add README.md
git commit -m "docs: Add comprehensive Lab 8 documentation"
```

#### 5. Merge to Main

```bash
# Switch to main branch
git checkout main

# Merge feature branches
git merge feat:db-integration
git merge feat:fetch-api
git merge iss1:cors-resolution
git merge docs:readme-update

# Push to remote
git push origin main

# DO NOT delete feature branches (as per requirements)
```

---

## 📊 Database Schema Verification

### Check Tables in MySQL

```sql
-- View all tables
SHOW TABLES;

-- View products table structure
DESCRIBE products;

-- View sample data
SELECT * FROM products;
SELECT * FROM categories;
SELECT * FROM orders;
SELECT * FROM order_items;
```

### Expected Output

**products table**:
```
| Field       | Type         | Null | Key | Default |
|-------------|--------------|------|-----|---------|
| id          | bigint       | NO   | PRI | NULL    |
| category_id | bigint       | YES  | MUL | NULL    |
| description | varchar(1000)| YES  |     | NULL    |
| image_url   | varchar(255) | YES  |     | NULL    |
| name        | varchar(255) | NO   |     | NULL    |
| price       | double       | NO   |     | NULL    |
| stock       | int          | NO   |     | NULL    |
```

---

## 🛠️ Technologies & Dependencies

### Backend Stack

| Technology       | Version  | Purpose                           |
|------------------|----------|-----------------------------------|
| Spring Boot      | 3.2.0    | Backend framework                 |
| Spring Data JPA  | 3.2.0    | Database abstraction layer        |
| MySQL Connector  | 8.x      | MySQL database driver             |
| Lombok           | 1.18.x   | Reduce boilerplate code           |
| Java             | 17+      | Programming language              |

### Frontend Stack

| Technology | Version | Purpose                              |
|-----------|---------|--------------------------------------|
| HTML5     | Latest  | Markup & structure                   |
| CSS3      | Latest  | Styling & responsive design          |
| JavaScript| ES6+    | Fetch API, DOM manipulation          |
| Fetch API | Native  | Asynchronous HTTP requests           |

### Database

| Component | Version | Purpose              |
|-----------|---------|----------------------|
| MySQL     | 8.0+    | Relational database  |

---

## 📝 Javadoc & Code Comments

### Entity Javadoc Example

```java
/**
 * Product entity representing an iPhone product.
 * 
 * Relationships:
 * - ManyToOne with Category: Each product belongs to one category
 * 
 * @author Anquilo & Magallanes
 * @version 1.0
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Auto-generated primary key
    
    /**
     * Product name (unique identifier for display).
     * Not null constraint enforced at database level.
     */
    @Column(nullable = false)
    private String name;
}
```

### JavaScript Comments Example

```javascript
/**
 * Fetch products from the Spring Boot backend.
 * Demonstrates async/await pattern with comprehensive error handling.
 * 
 * @returns {Promise<Array>} Array of products from database
 * @throws {Error} Network errors or HTTP errors (404, 500, etc.)
 * 
 * Error Handling Strategy:
 * 1. Check response.ok (HTTP status 200-299)
 * 2. Handle specific status codes (404 = Not Found, 500 = Server Error)
 * 3. Log errors to console for debugging
 * 4. Render error state UI
 * 5. Never fail silently
 */
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            // Manual error handling: don't rely only on exception
            if (response.status === 404) {
                throw new Error('Products endpoint not found');
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const products = await response.json();
        console.log('✓ Success:', products);
        return products;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        // User sees error state
    }
}
```

---

## 🚨 Error Handling

### Backend: Global Exception Handler

**File**: `src/main/java/com/ecommerce/exceptions/GlobalExceptionHandler.java`

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * Handle EntityNotFoundException (404 Not Found).
     * Called when a product is not found by ID.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            "Not Found",
            404,
            ex.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    /**
     * Handle DataIntegrityViolationException (400 Bad Request).
     * Called for constraint violations (e.g., duplicate product name).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        ErrorResponse error = new ErrorResponse(
            "Bad Request",
            400,
            "Invalid data: " + ex.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
```

### Frontend: Fetch Error Handling

**Pattern**: Try → Catch → Log → Display

```javascript
try {
    // Attempt to fetch
    const response = await fetch(url);
    
    // Manual OK check
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    // Parse and use data
    const data = await response.json();
    return data;
    
} catch (error) {
    // Log for debugging
    console.error('Error:', error.message);
    
    // Display to user
    alert(`Failed: ${error.message}`);
}
```

---

## 📋 Checklist: Lab 8 Requirements

- [x] Database configured in `application.properties`
- [x] Entities created with JPA annotations (@Entity, @Table, @Id, @GeneratedValue)
- [x] Relationships implemented (OneToMany, ManyToOne)
- [x] CascadeType.ALL and FetchType.LAZY used appropriately
- [x] Repositories extend JpaRepository with custom queries
- [x] Custom JPQL queries implemented (price range, category filter)
- [x] Services refactored to use repositories (no ArrayList)
- [x] Controllers updated with database queries
- [x] Global exception handling (@ControllerAdvice) for 404 and 400 errors
- [x] Fetch API integrated in frontend (async/await)
- [x] Error handling in frontend (try/catch, response.ok check)
- [x] Dynamic HTML rendering without hardcoded arrays
- [x] Empty state and error state UI
- [x] CORS configuration (WebConfig, @CrossOrigin)
- [x] Browser console verification (success/error logs)
- [x] Responsive design (Lab 3 media queries)
- [x] Postman testing verified (data persists after restart)
- [x] README documentation complete
- [x] Code contains Javadoc comments
- [x] JavaScript functions contain try/catch comments
- [x] Git workflow followed (branches, commits, merge to main)
- [x] Feature branches NOT deleted

---

## 📚 References

- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Hibernate Relationships](https://www.baeldung.com/hibernate-one-to-many)
- [MDN Fetch API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/)
- [Spring CORS Support](https://spring.io/guides/gs/rest-service-cors/)

---

## 👥 Team

**Authors**: Anquilo & Magallanes  
**Lab**: Lab 8 - Database Integration with Spring Data JPA & Fetch API  
**Date**: April 2026

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors in browser | Verify origin in `WebConfig.java` allowedOrigins |
| Products not loading | Check Spring Boot is running on port 8080 |
| Database not found | Ensure MySQL is running; check `application.properties` |
| Fetch 404 errors | Verify backend endpoints exist; check URL in `API_BASE_URL` |
| Empty product list | Insert sample data into `products` table |
| Media queries not working | Check CSS file path in HTML; verify responsive classes |

---

**Happy coding! 🎉**
