package com.toji.toji.mapper;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.Attachment;
import com.toji.toji.domain.BasicInfo;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RegionMapper {

  int insertBasicInfo(BasicInfo basicInfo);

  int insertActionHistory(ActionHistory actionHistory);

  int insertAttachment(Attachment attachment);

  List<BasicInfo> findAllWithPaging(int offset, int limit);

  /**
   * 최적화된 페이징 조회: N+1 문제 해결
   * hasData와 imagePath를 한 번의 쿼리로 조회
   */
  List<Map<String, Object>> findAllWithPagingOptimized(int offset, int limit);

  int countAll();

  int updateBasicInfo(BasicInfo basicInfo);

  List<ActionHistory> findActionHistoriesByBasicInfoId(Long basicInfoId);

  int deleteActionHistoriesByBasicInfoId(Long basicInfoId);

  void deleteAttachmentsByBasicInfoId(Long basicInfoId);

  // 조회 모달용 메소드들

  /**
   * 특정 토지의 상세정보 등록일 리스트 조회 (날짜 + 담당자명)
   */
  List<Map<String, Object>> findDetailDatesByLndsUnqNo(String lndsUnqNo);

  /**
   * 특정 토지의 사진 등록일 리스트 조회 (날짜 + SEQ + 담당자명)
   */
  List<Map<String, Object>> findPhotoDatesByLndsUnqNo(String lndsUnqNo);

  /**
   * 특정 SEQ의 상세정보 조회
   */
  BasicInfo findDetailBySeq(@Param("ilglPrvuInfoSeq") Long ilglPrvuInfoSeq);

  /**
   * 특정 SEQ의 사진 리스트 조회
   */
  List<Attachment> findPhotosBySeq(@Param("ilglPrvuInfoSeq") Long ilglPrvuInfoSeq);

  /**
   * 특정 토지번호로 데이터 존재 여부 확인 (카운트)
   */
  int hasDataByLndsUnqNo(@Param("lndsUnqNo") String lndsUnqNo);

  /**
   * 특정 SEQ의 첫 번째 이미지 경로 조회 (BasicInfo seq로 Attachment FK 사용)
   * Attachment 도메인을 직접 반환
   */
  Attachment findFirstImagePathByIlglPrvuInfoSeq(@Param("ilglPrvuInfoSeq") Long ilglPrvuInfoSeq);

  /**
   * 기본 정보 논리적 삭제 (USE_YN = 'N')
   */
  int deleteBasicInfo(BasicInfo basicInfo);

  /**
   * 첨부파일 삭제 (물리적 삭제는 서비스에서 처리하고 여기선 DB 레코드 삭제)
   */
  int deleteAttachment(Long ilglAttflSeq);
}
