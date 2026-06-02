package com.kimbap.server.service;

import com.kimbap.server.domain.Menu;
import com.kimbap.server.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;

    public List<Menu> findAll() {
        return menuRepository.findAll();
    }

    public List<Menu> findAvailable() {
        return menuRepository.findByAvailableTrue();
    }

    public List<Menu> findByCategory(String category) {
        return menuRepository.findByCategory(category);
    }

    public Menu findById(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메뉴를 찾을 수 없습니다. id=" + id));
    }

    @Transactional
    public Menu create(Menu menu) {
        return menuRepository.save(menu);
    }

    @Transactional
    public Menu update(Long id, Menu updated) {
        Menu menu = findById(id);
        menu.setNameKo(updated.getNameKo());
        menu.setNameEn(updated.getNameEn());
        menu.setNameJa(updated.getNameJa());
        menu.setNameZh(updated.getNameZh());
        menu.setPrice(updated.getPrice());
        menu.setCategory(updated.getCategory());
        menu.setImageUrl(updated.getImageUrl());
        menu.setDescriptionKo(updated.getDescriptionKo());
        menu.setDescriptionEn(updated.getDescriptionEn());
        menu.setDescriptionJa(updated.getDescriptionJa());
        menu.setDescriptionZh(updated.getDescriptionZh());
        menu.setAvailable(updated.getAvailable());
        return menu;
    }

    @Transactional
    public void delete(Long id) {
        menuRepository.deleteById(id);
    }
}
