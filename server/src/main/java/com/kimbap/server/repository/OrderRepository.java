package com.kimbap.server.repository;

import com.kimbap.server.domain.Order;
import com.kimbap.server.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCreatedAtBetween(Instant from, Instant to);

    long countByCreatedAtBetween(Instant from, Instant to);
}
