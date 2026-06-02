package com.kimbap.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "menus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nameKo;

    private String nameEn;
    private String nameJa;
    private String nameZh;

    @Column(nullable = false)
    private Integer price;

    private String category;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String descriptionKo;

    private String descriptionEn;
    private String descriptionJa;
    private String descriptionZh;

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;
}
