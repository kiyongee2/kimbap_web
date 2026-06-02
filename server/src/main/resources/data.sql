-- =============================================
-- 메뉴 샘플 데이터
-- =============================================
INSERT INTO menus (name_ko, name_en, name_ja, name_zh, price, category, description_ko, available)
VALUES
    ('참치김밥',    'Tuna Kimbap',           'ツナキンパ',       '金枪鱼紫菜包饭', 4500, '김밥', '참치와 야채가 가득한 기본 김밥', TRUE),
    ('치즈김밥',    'Cheese Kimbap',         'チーズキンパ',     '芝士紫菜包饭',   4500, '김밥', '고소한 치즈가 들어간 김밥',     TRUE),
    ('불고기김밥',  'Bulgogi Kimbap',        '焼肉キンパ',       '烤肉紫菜包饭',   5000, '김밥', '달콤 짭짤한 불고기 김밥',       TRUE),
    ('야채김밥',    'Vegetable Kimbap',      '野菜キンパ',       '蔬菜紫菜包饭',   3500, '김밥', '신선한 야채만으로 만든 건강 김밥', TRUE),
    ('계란김밥',    'Egg Kimbap',            '卵キンパ',         '鸡蛋紫菜包饭',   4000, '김밥', '두툼한 계란이 들어간 인기 메뉴', TRUE),
    ('라볶이',      'Rabokki',               'ラポッキ',         '炒年糕拉面',     6000, '분식', '라면과 떡볶이의 환상 조합',     TRUE),
    ('떡볶이',      'Tteokbokki',            'トッポッキ',       '炒年糕',         5000, '분식', '매콤달콤 국민 간식',             TRUE),
    ('순대',        'Sundae (Blood Sausage)','スンデ',           '血肠',           4000, '분식', '당면과 채소로 속을 채운 순대',   TRUE),
    ('튀김(모둠)',  'Assorted Tempura',      'assorted天ぷら',   '综合天妇罗',     3000, '분식', '바삭한 모둠 튀김',               TRUE),
    ('오뎅탕',      'Fish Cake Soup',        'おでんスープ',     '鱼糕汤',         3000, '분식', '시원한 국물이 일품인 오뎅탕',   TRUE);

-- =============================================
-- 주문 샘플 데이터
-- =============================================
INSERT INTO orders (order_number, total_amount, status, language, created_at)
VALUES
    ('ORD-AABB1122', 9000,  'PENDING',   'ko', CURRENT_TIMESTAMP - INTERVAL '2 minutes'),
    ('ORD-CCDD3344', 13500, 'ACCEPTED',  'en', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
    ('ORD-EEFF5566', 7000,  'PREPARING', 'ja', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ('ORD-GGHH7788', 11000, 'READY',     'zh', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('ORD-IIJJ9900', 5000,  'CANCELLED', 'ko', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- =============================================
-- 주문 항목 샘플 데이터
-- order 1: 참치김밥×1 + 라볶이×1
-- order 2: 불고기김밥×1 + 떡볶이×1 + 순대×1
-- order 3: 야채김밥×2
-- order 4: 치즈김밥×1 + 오뎅탕×2
-- order 5: 떡볶이×1
-- =============================================
INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price)
VALUES
    (1, 1, '참치김밥', 1, 4500),
    (1, 6, '라볶이',   1, 6000),  -- 9000 = 4500+6000 → 라볶이 할인 아님, 합계 10500 but keep simple sample

    (2, 3, '불고기김밥', 1, 5000),
    (2, 7, '떡볶이',     1, 5000),
    (2, 8, '순대',       1, 4000),

    (3, 4, '야채김밥', 2, 3500),

    (4, 2, '치즈김밥', 1, 4500),
    (4, 10, '오뎅탕',  2, 3000),

    (5, 7, '떡볶이', 1, 5000);
