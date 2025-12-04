package com.toji.toji.service;

import com.toji.toji.domain.DroneRawPhotoVO;
import java.util.List;

/**
 * 드론 원본 사진 조회 서비스 인터페이스
 */
public interface DroneRawPhotoService {

    /**
     * 촬영된 날짜 목록 조회
     */
    List<String> getAvailableDates();

    /**
     * 특정 날짜의 사진 목록 조회
     */
    List<DroneRawPhotoVO> getPhotosByDate(String date);

    /**
     * 사진 ID로 상세 정보 조회
     */
    DroneRawPhotoVO getPhotoById(Long photoSeq);
}
