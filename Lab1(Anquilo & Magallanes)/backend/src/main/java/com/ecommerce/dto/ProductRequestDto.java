package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductRequestDto(
        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @NotNull(message = "Price is required")
        @Positive(message = "Price must be positive")
        Double price,

        @NotNull(message = "Stock is required")
        @PositiveOrZero(message = "Stock must be zero or greater")
        Integer stock,

        @Size(max = 255, message = "Image URL must not exceed 255 characters")
        String imageUrl,

        @Positive(message = "Category ID must be positive")
        Long categoryId
) {
}
