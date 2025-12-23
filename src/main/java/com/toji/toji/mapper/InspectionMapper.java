package com.toji.toji.mapper;

import com.toji.toji.dto.InspectionSearchDTO;
import com.toji.toji.service.InspectionFileVO;
import com.toji.toji.service.InspectionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InspectionMapper {
    // eGovFrame: VO 객체 사용
    void insertInspection(InspectionVO inspectionVO);
    void insertInspectionFile(InspectionFileVO fileVO);
    void insertInspectionFileMapping(@Param("ispcId") String ispcId, @Param("fileSeq") Long fileSeq, 
                                     @Param("userId") String userId);
    
    Long selectNextFileSeq();

    // 조회용 메서드 추가
    List<InspectionVO> selectInspectionList(InspectionSearchDTO searchDTO);
    long countInspectionList(InspectionSearchDTO searchDTO);

    InspectionVO selectInspection(@Param("ispcId") String ispcId);
    List<InspectionFileVO> selectInspectionFiles(@Param("ispcId") String ispcId);
    InspectionFileVO selectFileDetail(@Param("fileSeq") Long fileSeq);
}
