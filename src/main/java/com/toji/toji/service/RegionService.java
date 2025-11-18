package com.toji.toji.service;

import com.toji.toji.dto.RegionRegisterRequest;

/**
 * 지역 기본 정보와 이력을 등록하는 서비스 인터페이스.
 */
public interface RegionService {

  /**
   * 지역 등록 요청을 받아 기본 정보 및 관련 이력을 저장한다.
   *
   * @param request 등록 요청 DTO
   * @return 생성된 기본 정보의 식별자
   */
  Long registerRegion(RegionRegisterRequest request);
}
