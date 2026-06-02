package com.kimbap.server.controller;

import com.kimbap.server.domain.Order;
import com.kimbap.server.domain.OrderStatus;
import com.kimbap.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getAll(@RequestParam(required = false) String status,
                              @RequestParam(required = false, defaultValue = "false") boolean today) {
        if (today) {
            return orderService.findToday();
        }
        if (status != null && !status.isBlank()) {
            return orderService.findByStatus(OrderStatus.valueOf(status.toUpperCase()));
        }
        return orderService.findAll();
    }

    @GetMapping("/count/today")
    public Map<String, Long> countToday() {
        return Map.of("count", orderService.countToday());
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(order));
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status").toUpperCase());
        return orderService.updateStatus(id, status);
    }
}
