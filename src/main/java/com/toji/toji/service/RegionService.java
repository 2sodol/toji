package com.toji.toji.service;

import com.toji.toji.domain.Attachment;
import com.toji.toji.dto.RegionRegisterRequest;
import java.util.Map;

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

  /**
   * 페이징 처리된 불법점용 리스트를 조회한다.
   *
   * @param page 페이지 번호 (1부터 시작)
   * @param size 페이지 크기
   * @return 페이징 정보와 리스트를 포함한 맵
   */
  Map<String, Object> findAllWithPaging(int page, int size, String keyword);

  /**
   * 특정 토지의 등록일 리스트를 타입별로 조회한다.
   *
   * @param lndsUnqNo 토지고유번호
   * @param type      조회 타입 (detail: 상세정보, photo: 사진)
   * @return 등록일 리스트를 포함한 맵
   */
  Map<String, Object> findDatesByLndsUnqNoAndType(String lndsUnqNo, String type);

  /**
   * 특정 SEQ의 상세정보를 조회한다.
   *
   * @param ilglPrvuInfoSeq 불법점용정보 SEQ
   * @return 상세정보를 포함한 맵
   */
  Map<String, Object> findDetailBySeq(Long ilglPrvuInfoSeq);

  /**
   * 특정 SEQ의 사진 리스트를 조회한다.
   *
   * @param ilglPrvuInfoSeq 불법점용정보 SEQ
   * @return 사진 리스트를 포함한 맵
   */
  Map<String, Object> findPhotosBySeq(Long ilglPrvuInfoSeq);

  /**
   * 지역 정보를 수정한다.
   *
   * @param ilglPrvuInfoSeq 수정할 불법점용정보 SEQ
   * @param request         수정 요청 DTO
   * @return 수정 결과
   */
  Long updateRegion(Long ilglPrvuInfoSeq, RegionRegisterRequest request);

  /**
   * 지역 정보를 삭제한다. (논리적 삭제)
   *
   * @param ilglPrvuInfoSeq 삭제할 불법점용정보 SEQ
   */
  void deleteRegion(Long ilglPrvuInfoSeq);

  /**
   * 첨부파일 상세 정보를 조회한다.
   *
   * @param ilglAttflSeq 첨부파일 SEQ
   * @return 첨부파일 정보
   */
  Attachment findAttachmentBySeq(Long ilglAttflSeq);
}
