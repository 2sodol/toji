package com.toji.toji.mapper;

import com.toji.toji.domain.DroneRawPhotoVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

/**
 * 드론 원본 사진(Raw Image) 데이터 처리를 위한 MyBatis Mapper 인터페이스
 * 
 * <p>
 * T_DRONE_RAW_PHOTO 테이블에 대한 CRUD 작업을 수행합니다.
 * 실제 SQL 쿼리는 resources/mappers/DroneRawPhoto_SQL.xml 파일에 정의되어 있습니다.
 * </p>
 */
@Mapper
public interface DroneRawPhotoMapper {

    /**
     * 드론 원본 사진 정보를 DB에 저장(등록)합니다.
     * 
     * @param vo 저장할 드론 사진 정보 객체 (DroneRawPhotoVO)
     */
    void insertRawPhoto(DroneRawPhotoVO vo);

    /**
     * 특정 날짜에 촬영된 드론 원본 사진 목록을 조회합니다.
     * 
     * @param date 조회할 날짜 문자열 (형식: YYYYMMDD)
     * @return 해당 날짜의 드론 사진 정보 리스트
     */
    List<DroneRawPhotoVO> selectRawPhotosByDate(String date);
}
