package com.ecommerce.dto;

public record OrderItemResponseDto(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        Integer quantity,
        Double unitPrice,
        Double lineTotal
) {
}
