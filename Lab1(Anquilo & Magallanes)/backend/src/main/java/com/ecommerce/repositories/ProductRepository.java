package com.ecommerce.repositories;

import com.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Product entity.
 * Extends JpaRepository for CRUD operations.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * Find products by category name using Spring Data method naming.
     */
    List<Product> findByCategoryName(String categoryName);
    
    /**
     * Custom JPQL query for price range search.
     */
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :min AND :max")
    List<Product> findByPriceRange(@Param("min") Double min, @Param("max") Double max);
    
    /**
     * Find products with stock above threshold.
     */
    List<Product> findByStockGreaterThan(Integer minStock);
}