package com.toji.toji.service;

import lombok.Data;
import java.util.Date;

/**
 * 점검 사진 파일 정보를 담는 VO 클래스
 */
@Data
public class InspectionFileVO {
    private String ispcId;          // 점검ID (매핑용)
    private Long fileSeq;           // 파일일련번호
    private String attflNm;         // 첨부파일명 (저장된 이름)
    private Long attflMg;           // 첨부파일크기
    private String attflPath;       // 첨부파일경로
    private String ortxFlnm;        // 원본파일명
    private String fcltsPtgrDttm;   // 시설물촬영일시
    private String fsttmRgsrId;     // 최초등록자ID
    private Date fsttmRgstDttm;     // 최초등록일시
    private String lsttmModfrId;    // 최종수정자ID
    private Date lsttmAltrDttm;     // 최종수정일시
}

