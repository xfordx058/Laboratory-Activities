package com.ecommerce.services;

import com.ecommerce.dto.OrderRequestDto;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final CartService cartService;
    private final OrderRepository orderRepository;

    public Order createOrder(OrderRequestDto request) {
        Cart cart = cartService.getCart(request.cartId());
        if (cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setTotalAmount(cart.getTotalAmount());

        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            order.getOrderItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(cart.getId());
        return savedOrder;
    }
}
