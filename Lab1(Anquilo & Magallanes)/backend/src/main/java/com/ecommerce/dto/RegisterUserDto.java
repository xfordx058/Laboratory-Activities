package com.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterUserDto(
        @NotBlank(message = "Username is required")
        @Size(min = 8, max = 20, message = "Username must be between 8 and 20 characters")
        String username,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        String password,

        @NotBlank(message = "Role is required")
        @Pattern(regexp = "USER|CUSTOMER|SELLER|ADMIN", message = "Role must be USER, CUSTOMER, SELLER, or ADMIN")
        String role
) {
}
