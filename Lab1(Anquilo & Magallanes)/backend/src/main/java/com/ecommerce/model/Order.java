package com.anquilo.magallanes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Order entity representing a customer purchase.
 * One Order has many OrderItems.
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String customerName;
    
    private String customerEmail;
    
    private LocalDateTime orderDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private Double totalAmount;
    
    /**
     * One order has many order items.
     * This is the parent side; OrderItem holds the foreign key.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
}