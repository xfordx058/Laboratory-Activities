package com.ecommerce.repositories;

import com.ecommerce.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findByCustomerEmailIgnoreCaseOrderByOrderDateDesc(String customerEmail);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findAllByOrderByOrderDateDesc();
}
