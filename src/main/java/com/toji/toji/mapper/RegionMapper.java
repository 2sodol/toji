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

  BasicInfo findById(Long id);

  List<BasicInfo> findAll();

  List<BasicInfo> findAllWithPaging(int offset, int limit);

  int countAll();

  int updateBasicInfo(BasicInfo basicInfo);

  int deleteBasicInfo(Long id);

  List<ActionHistory> findActionHistoriesByBasicInfoId(Long basicInfoId);

  int deleteActionHistoriesByBasicInfoId(Long basicInfoId);

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
}

