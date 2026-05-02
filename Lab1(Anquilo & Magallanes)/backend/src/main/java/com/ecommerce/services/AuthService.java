package com.ecommerce.services;

import com.ecommerce.dto.RegisterUserDto;
import com.ecommerce.model.AppUser;
import com.ecommerce.model.Role;
import com.ecommerce.repositories.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AppUser register(RegisterUserDto request) {
        if (appUserRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (appUserRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(toRole(request.role())));
        return appUserRepository.save(user);
    }

    private Role toRole(String role) {
        if ("USER".equalsIgnoreCase(role)) {
            return Role.CUSTOMER;
        }
        return Role.valueOf(role.toUpperCase());
    }
}
