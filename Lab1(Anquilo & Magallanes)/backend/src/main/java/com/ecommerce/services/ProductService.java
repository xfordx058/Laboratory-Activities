package com.ecommerce.services;

import com.ecommerce.dto.ProductRequestDto;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repositories.CategoryRepository;
import com.ecommerce.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Product operations.
 * Uses ProductRepository for database persistence.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }
    
    public Product createProduct(ProductRequestDto request) {
        Product product = new Product();
        applyRequest(product, request);
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, ProductRequestDto productDetails) {
        Product product = getProductById(id);
        applyRequest(product, productDetails);
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
    
    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(String categoryName) {
        return productRepository.findByCategoryName(categoryName);
    }
    
    @Transactional(readOnly = true)
    public List<Product> getProductsByPriceRange(Double min, Double max) {
        return productRepository.findByPriceRange(min, max);
    }

    private void applyRequest(Product product, ProductRequestDto request) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setImageUrl(request.imageUrl());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + request.categoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
    }
}
