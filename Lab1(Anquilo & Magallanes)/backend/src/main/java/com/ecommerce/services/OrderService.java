package com.ecommerce.services;

import com.ecommerce.dto.OrderItemResponseDto;
import com.ecommerce.dto.OrderRequestDto;
import com.ecommerce.dto.OrderResponseDto;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersForCustomer(String customerEmail) {
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByOrderDateDesc(customerEmail).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private OrderResponseDto toResponse(Order order) {
        List<OrderItemResponseDto> items = order.getOrderItems().stream()
                .map(this::toItemResponse)
                .toList();

        return new OrderResponseDto(
                order.getId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getOrderDate(),
                order.getTotalAmount(),
                items
        );
    }

    private OrderItemResponseDto toItemResponse(OrderItem item) {
        return new OrderItemResponseDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getUnitPrice() * item.getQuantity()
        );
    }
}
