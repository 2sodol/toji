package com.toji.toji.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

import com.toji.toji.dto.InspectionSearchDTO;

public interface InspectionService {
    
    void uploadInspectionExcel(String base64Excel) throws IOException;

    List<InspectionVO> selectInspectionList(InspectionSearchDTO searchDTO);
    long countInspectionList(InspectionSearchDTO searchDTO);

    InspectionVO selectInspectionDetail(String ispcId);
    InspectionFileVO getFileDetail(Long fileSeq);
}
