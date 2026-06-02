package com.kimbap.server.controller;

import com.kimbap.server.domain.Menu;
import com.kimbap.server.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public List<Menu> getAll(@RequestParam(required = false) String category,
                             @RequestParam(required = false) Boolean available) {
        if (available != null && available) {
            return menuService.findAvailable();
        }
        if (category != null && !category.isBlank()) {
            return menuService.findByCategory(category);
        }
        return menuService.findAll();
    }

    @GetMapping("/{id}")
    public Menu getById(@PathVariable Long id) {
        return menuService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Menu> create(@RequestBody Menu menu) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.create(menu));
    }

    @PutMapping("/{id}")
    public Menu update(@PathVariable Long id, @RequestBody Menu menu) {
        return menuService.update(id, menu);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
