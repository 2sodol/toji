package com.toji.toji.dto;

import lombok.Data;

@Data
public class InspectionSearchDTO {
    // DataTables 기본 파라미터
    private int draw;
    private int start;
    private int length;
    
    // 검색 조건 (필요 시 추가)
    private String searchKeyword;
    
    // 정렬 (간소화: 0=순번, 1=노선, 2=시설물, 3=점검일시, 4=등록일시)
    private int orderColumn;
    private String orderDir;
}

