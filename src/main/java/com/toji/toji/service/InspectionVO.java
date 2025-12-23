package com.toji.toji.service;

import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 무정차 시설물 점검 정보를 담는 VO 클래스
 * 전자정부표준프레임워크 표준에 따라 VO 접미사 사용 및 service 패키지 위치
 */
@Data
public class InspectionVO {
    private String ispcId;          // 점검ID
    private String hdqrCd;          // 본부코드
    private String mtnofCd;         // 지사코드
    private String routeDrnm;       // 노선방향명
    private String routeDstnc;      // 노선이정
    private Date ispcDttm;          // 점검일시
    private String fcltsNm;         // 시설물명
    private String delYn;           // 삭제여부
    private String fsttmRgsrId;     // 최초등록자ID
    private Date fsttmRgstDttm;     // 최초등록일시
    private String lsttmModfrId;    // 최종수정자ID
    private Date lsttmAltrDttm;     // 최종수정일시
    
    // 1:N 관계의 사진 파일 리스트
    private List<InspectionFileVO> files;
}

