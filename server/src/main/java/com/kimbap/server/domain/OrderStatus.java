package com.kimbap.server.domain;

public enum OrderStatus {
    PENDING,    // 접수 대기
    ACCEPTED,   // 접수 완료
    PREPARING,  // 조리 중
    READY,      // 완료
    CANCELLED   // 취소
}
