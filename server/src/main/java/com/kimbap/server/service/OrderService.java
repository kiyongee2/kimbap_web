package com.kimbap.server.service;

import com.kimbap.server.domain.Order;
import com.kimbap.server.domain.OrderItem;
import com.kimbap.server.domain.OrderStatus;
import com.kimbap.server.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다. id=" + id));
    }

    /** 오늘 주문 수 (KST 기준) */
    public long countToday() {
        ZoneId kst = ZoneId.of("Asia/Seoul");
        Instant startOfDay = LocalDate.now(kst).atStartOfDay(kst).toInstant();
        Instant endOfDay   = LocalDate.now(kst).plusDays(1).atStartOfDay(kst).toInstant();
        return orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
    }

    /** 오늘 주문 목록 (KST 기준) */
    public List<Order> findToday() {
        ZoneId kst = ZoneId.of("Asia/Seoul");
        Instant startOfDay = LocalDate.now(kst).atStartOfDay(kst).toInstant();
        Instant endOfDay   = LocalDate.now(kst).plusDays(1).atStartOfDay(kst).toInstant();
        return orderRepository.findByCreatedAtBetween(startOfDay, endOfDay);
    }

    @Transactional
    public Order create(Order order) {
        order.setOrderNumber(generateOrderNumber());
        for (OrderItem item : order.getItems()) {
            item.setOrder(order);
        }
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = findById(id);
        order.setStatus(status);
        return order;
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
