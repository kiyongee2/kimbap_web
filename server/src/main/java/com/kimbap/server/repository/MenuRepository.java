package com.kimbap.server.repository;

import com.kimbap.server.domain.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByCategory(String category);

    List<Menu> findByAvailableTrue();
}
