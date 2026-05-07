package com.ecommerce.controllers;

import com.ecommerce.dto.AuthUserResponse;
import com.ecommerce.dto.RegisterUserDto;
import com.ecommerce.model.AppUser;
import com.ecommerce.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthUserResponse> register(@Valid @RequestBody RegisterUserDto request) {
        AppUser user = authService.register(request);
        return new ResponseEntity<>(toResponse(user), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal AppUser user) {
        return toResponse(user);
    }

    private AuthUserResponse toResponse(AppUser user) {
        return new AuthUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}
