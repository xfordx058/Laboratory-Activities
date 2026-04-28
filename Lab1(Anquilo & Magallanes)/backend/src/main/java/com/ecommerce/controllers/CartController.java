package com.ecommerce.controllers;

import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for Cart endpoints.
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5500")  // Allow frontend
public class CartController {
    
    private final CartService cartService;
    
    /**
     * Get or create cart for a session
     */
    @PostMapping("/session/{sessionId}")
    public ResponseEntity<Cart> getOrCreateCart(@PathVariable String sessionId) {
        Cart cart = cartService.getOrCreateCart(sessionId);
        return ResponseEntity.ok(cart);
    }
    
    /**
     * Get cart by session ID
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Cart> getCart(@PathVariable String sessionId) {
        Cart cart = cartService.getCartBySessionId(sessionId);
        return ResponseEntity.ok(cart);
    }
    
    /**
     * Add product to cart
     * POST /api/cart/{cartId}/add
     * Body: { "productId": 1, "quantity": 1 }
     */
    @PostMapping("/{cartId}/add")
    public ResponseEntity<Map<String, Object>> addToCart(
            @PathVariable Long cartId,
            @RequestBody Map<String, Object> request) {
        
        Long productId = ((Number) request.get("productId")).longValue();
        Integer quantity = ((Number) request.get("quantity")).intValue();
        
        CartItem cartItem = cartService.addToCart(cartId, productId, quantity);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product added to cart");
        response.put("cartItem", cartItem);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all cart items
     */
    @GetMapping("/{cartId}/items")
    public ResponseEntity<List<CartItem>> getCartItems(@PathVariable Long cartId) {
        List<CartItem> items = cartService.getCartItems(cartId);
        return ResponseEntity.ok(items);
    }
    
    /**
     * Update quantity of a cart item
     * PUT /api/cart/{cartId}/items/{cartItemId}
     * Body: { "quantity": 2 }
     */
    @PutMapping("/{cartId}/items/{cartItemId}")
    public ResponseEntity<Map<String, Object>> updateQuantity(
            @PathVariable Long cartId,
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Object> request) {
        
        Integer newQuantity = ((Number) request.get("quantity")).intValue();
        
        CartItem cartItem = cartService.updateQuantity(cartId, cartItemId, newQuantity);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quantity updated");
        response.put("cartItem", cartItem);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove item from cart
     */
    @DeleteMapping("/{cartId}/items/{cartItemId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(
            @PathVariable Long cartId,
            @PathVariable Long cartItemId) {
        
        cartService.removeFromCart(cartId, cartItemId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Item removed from cart");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Clear entire cart
     */
    @DeleteMapping("/{cartId}/clear")
    public ResponseEntity<Map<String, Object>> clearCart(@PathVariable Long cartId) {
        cartService.clearCart(cartId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cart cleared");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get cart total
     */
    @GetMapping("/{cartId}/total")
    public ResponseEntity<Map<String, Object>> getCartTotal(@PathVariable Long cartId) {
        Double total = cartService.getCartTotal(cartId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("total", total);
        
        return ResponseEntity.ok(response);
    }
}
