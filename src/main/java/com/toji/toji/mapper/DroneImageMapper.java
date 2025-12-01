package com.toji.toji.mapper;

import com.toji.toji.domain.DroneImageVO;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DroneImageMapper {

    /**
     * 드론 이미지 정보 등록
     * 
     * @param vo
     * @return
     */
    int insertDroneImage(DroneImageVO vo);

    /**
     * 날짜별 드론 이미지 수집 현황 조회 (모달 콤보박스용)
     * 
     * @return List<Map<String, Object>> (WORK_DATE, PHOTO_CNT)
     */
    List<Map<String, Object>> selectDroneImageDateList();

    /**
     * 특정 날짜의 드론 이미지 리스트 조회
     * 
     * @param searchDate 조회할 날짜 (YYYY-MM-DD)
     * @return
     */
    List<DroneImageVO> selectDroneImageList(@Param("searchDate") String searchDate);
}
