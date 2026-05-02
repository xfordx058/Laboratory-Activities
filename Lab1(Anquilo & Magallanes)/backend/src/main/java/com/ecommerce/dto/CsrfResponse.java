package com.ecommerce.dto;

public record CsrfResponse(
        String headerName,
        String parameterName,
        String token
) {
}
