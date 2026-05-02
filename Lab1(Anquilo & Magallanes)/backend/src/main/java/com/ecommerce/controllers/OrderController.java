package com.ecommerce.controllers;

import com.ecommerce.dto.OrderRequestDto;
import com.ecommerce.model.Order;
import com.ecommerce.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequestDto request) {
        return new ResponseEntity<>(orderService.createOrder(request), HttpStatus.CREATED);
    }
}
