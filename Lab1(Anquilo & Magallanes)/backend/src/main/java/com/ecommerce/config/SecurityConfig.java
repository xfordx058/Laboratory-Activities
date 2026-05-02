package com.ecommerce.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import java.time.LocalDateTime;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper objectMapper) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers("/api/auth/register")
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers("/api/cart/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers("/api/orders/**", "/api/auth/me").authenticated()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/login")
                        .successHandler((request, response, authentication) -> writeJson(
                                response,
                                objectMapper,
                                HttpServletResponse.SC_OK,
                                "Login successful"
                        ))
                        .failureHandler((request, response, exception) -> writeJson(
                                response,
                                objectMapper,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                "Invalid username or password"
                        ))
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler((request, response, authentication) -> writeJson(
                                response,
                                objectMapper,
                                HttpServletResponse.SC_OK,
                                "Logout successful"
                        ))
                        .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                        .invalidateHttpSession(true)
                        .permitAll()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> writeJson(
                                response,
                                objectMapper,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                "Authentication required"
                        ))
                        .accessDeniedHandler((request, response, accessDeniedException) -> writeJson(
                                response,
                                objectMapper,
                                HttpServletResponse.SC_FORBIDDEN,
                                "Access denied"
                        ))
                )
                .build();
    }

    private void writeJson(HttpServletResponse response, ObjectMapper objectMapper, int status, String message)
            throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", status,
                "message", message
        ));
    }
}
