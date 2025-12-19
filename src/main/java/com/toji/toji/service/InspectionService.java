package com.toji.toji.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface InspectionService {
    
    void uploadInspectionExcel(String base64Excel) throws IOException;

    List<InspectionVO> selectInspectionList();
    InspectionVO selectInspectionDetail(String ispcId);
    InspectionFileVO getFileDetail(Long fileSeq);
}
