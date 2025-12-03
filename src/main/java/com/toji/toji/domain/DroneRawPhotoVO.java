package com.toji.toji.domain;

import lombok.Data;
import java.util.Date;

/**
 * 드론 원본 사진(Raw Image) 정보를 담는 Value Object (VO)
 * 
 * <p>
 * T_DRONE_RAW_PHOTO 테이블과 매핑되며,
 * 드론 촬영 이미지의 메타데이터(파일 경로, 촬영 일시, GPS 좌표 등)를 관리합니다.
 * </p>
 */
@Data
public class DroneRawPhotoVO {

    /** 사진 고유 식별자 (PK) */
    private Long photoSeq;

    /** 비행 ID (외부 시스템 연계용 그룹 ID) */
    private String flightId;

    /** 촬영 일시 */
    private Date shootDt;

    /** 파일 저장 절대 경로 (NAS 경로) */
    private String filePath;

    /** 파일명 */
    private String fileNm;

    /** GPS 위도 (Latitude) */
    private Double gpsLat;

    /** GPS 경도 (Longitude) */
    private Double gpsLon;
}
