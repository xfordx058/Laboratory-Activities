package com.ecommerce.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDto(
        Long id,
        String customerName,
        String customerEmail,
        LocalDateTime orderDate,
        Double totalAmount,
        List<OrderItemResponseDto> items
) {
}
