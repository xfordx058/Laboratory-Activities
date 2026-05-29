package com.ecommerce.dto;

import java.util.Set;

public record AuthUserResponse(
        Long id,
        String username,
        String email,
        Set<String> roles
) {
}
