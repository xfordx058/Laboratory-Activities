package com.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Category entity for grouping products.
 * One category has many products.
 * This is the PARENT side (inverse side, no FK column).
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String name;
    
    /**
     * One category has many products.
     * mappedBy = "category" refers to the FIELD NAME in Product.java (not column name).
     * CascadeType.ALL: save/delete operations propagate to products.
     * orphanRemoval: removing a product from this list deletes it from DB.
     */
    @OneToMany(
        mappedBy = "category",  // MUST match the field name in Product.java
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<Product> products = new ArrayList<>();
}