package com.toji.toji.dto;

import lombok.Data;

@Data
public class InspectionUploadRequest {
    private String base64File;  // 엑셀 파일의 Base64 인코딩 문자열
    private String fileName;    // 파일명 (선택)
}

