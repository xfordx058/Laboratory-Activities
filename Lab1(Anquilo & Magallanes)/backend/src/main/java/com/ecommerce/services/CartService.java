package com.ecommerce.services;

import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.repositories.CartItemRepository;
import com.ecommerce.repositories.CartRepository;
import com.ecommerce.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    /**
     * Get or create a cart by session ID
     */
    public Cart getOrCreateCart(String sessionId) {
        return cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setSessionId(sessionId);
                    return cartRepository.save(newCart);
                });
    }
    
    /**
     * Get cart by ID
     */
    public Cart getCart(Long cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }
    
    /**
     * Get cart by session ID
     */
    public Cart getCartBySessionId(String sessionId) {
        return cartRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Cart not found for session: " + sessionId));
    }
    
    /**
     * Add product to cart or update quantity if already exists
     */
    public CartItem addToCart(Long cartId, Long productId, Integer quantity) {
        Cart cart = getCart(cartId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if product already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cartId, productId);
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update quantity if already in cart
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setUnitPrice(product.getPrice());
        }
        
        return cartItemRepository.save(cartItem);
    }
    
    /**
     * Remove item from cart
     */
    public void removeFromCart(Long cartId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getCart().getId().equals(cartId)) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    /**
     * Update cart item quantity
     */
    public CartItem updateQuantity(Long cartId, Long cartItemId, Integer newQuantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getCart().getId().equals(cartId)) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }
        
        if (newQuantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        
        cartItem.setQuantity(newQuantity);
        return cartItemRepository.save(cartItem);
    }
    
    /**
     * Clear all items from cart
     */
    public void clearCart(Long cartId) {
        Cart cart = getCart(cartId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
    
    /**
     * Get all items in cart
     */
    public List<CartItem> getCartItems(Long cartId) {
        Cart cart = getCart(cartId);
        return cart.getCartItems();
    }
    
    /**
     * Get cart total
     */
    public Double getCartTotal(Long cartId) {
        Cart cart = getCart(cartId);
        return cart.getTotalAmount();
    }
}
