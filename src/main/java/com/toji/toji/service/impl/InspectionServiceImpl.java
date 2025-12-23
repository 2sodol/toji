package com.toji.toji.service.impl;

import com.toji.toji.mapper.InspectionMapper;
import com.toji.toji.dto.InspectionSearchDTO;
import com.toji.toji.service.InspectionFileVO;
import com.toji.toji.service.InspectionService;
import com.toji.toji.service.InspectionVO;
import jakarta.servlet.ServletContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 무정차 시설물 점검 서비스 구현체
 * eGovFrame: EgovAbstractServiceImpl 상속은 라이브러리 부재로 생략하나 구조는 준수함
 */
@Slf4j
@Service("inspectionService")
@RequiredArgsConstructor
public class InspectionServiceImpl implements InspectionService {

    private final InspectionMapper inspectionMapper;
    private final ServletContext servletContext;

    // 파일 저장 경로 (웹 루트 기준 상대 경로)
    // RegionServiceImpl과 동일한 방식 적용
    private static final String UPLOAD_PATH = "/CDIGIT_CCTV01/attach/extension/inspection";

    @Override
    @Transactional
    public void uploadInspectionExcel(String base64Excel) throws IOException {
        // Base64 디코딩
        // "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,"
        // 접두어 제거 필요할 수 있음
        if (base64Excel.contains(",")) {
            base64Excel = base64Excel.split(",")[1];
        }
        byte[] decodedBytes = Base64.getDecoder().decode(base64Excel);

        // 1. 엑셀 파일 로드 (ByteArrayInputStream 사용)
        Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(decodedBytes));
        Sheet sheet = workbook.getSheetAt(0); // 첫 번째 시트

        // 2. 텍스트 데이터 파싱 (1파일 = 1시설물)
        // 엑셀 양식:
        // B1(Row:0, Col:1) : 위치 (노선명 + 이정)
        // B2(Row:1, Col:1) : 시간 (점검일시)
        // B3(Row:2, Col:1) : 시설물명

        String locationInfo = getCellValue(sheet, 0, 1); // B1
        String timeInfoStr = getCellValue(sheet, 1, 1); // B2
        String fcltsNm = getCellValue(sheet, 2, 1); // B3

        // 날짜 파싱
        Date ispcDttm = new Date(); // 기본값
        try {
            // 셀이 날짜 서식인 경우 getCellValue에서 문자열로 변환됨 (예: "2025-03-21 10:35")
            // 만약 엑셀이 텍스트 포맷이라면 직접 파싱
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            // 엑셀에서 날짜가 "2025-03-21 10:35" 형태로 들어온다고 가정
            // POI DateUtil로 읽힌 경우 기본 toString()은 포맷이 다를 수 있어 체크 필요
            // 여기서는 안전하게 문자열 파싱 시도 후 실패시 현재시간 사용
            if (timeInfoStr != null && !timeInfoStr.isEmpty()) {
                // 한글이나 공백 등 노이즈 제거 후 파싱 시도 로직이 필요할 수 있음
                // 간단한 파싱 시도 (포맷이 정확하다고 가정)
                // 실제로는 다양한 포맷 대응이 필요할 수 있음
                ispcDttm = sdf.parse(timeInfoStr);
            }
        } catch (Exception e) {
            log.warn("날짜 파싱 실패 (입력값: {}), 현재 시간으로 대체합니다.", timeInfoStr);
            // 엑셀의 날짜 셀(Numeric)을 읽을 때 getCellValue가 형식을 보존해주지 못할 수 있음
            // 필요 시 로직 보강
        }

        // 3. InspectionVO 객체 생성
        String ispcId = UUID.randomUUID().toString().replace("-", "");
        InspectionVO inspectionVO = new InspectionVO();
        inspectionVO.setIspcId(ispcId);

        // 하드코딩 영역
        inspectionVO.setHdqrCd("1000");
        inspectionVO.setMtnofCd("1100");

        // B1의 위치 정보를 노선명/이정 컬럼에 저장
        // 예: "대구외곽순환선 29.8k (시점)" -> routeDrnm="대구외곽순환선", routeDstnc="29.8"
        String routeDrnm = "";
        String routeDstnc = "";

        if (locationInfo != null && !locationInfo.isEmpty()) {
            String[] parts = locationInfo.split(" ");
            if (parts.length >= 1) {
                routeDrnm = parts[0];
            }
            if (parts.length >= 2) {
                // "29.8k" -> "29.8" (숫자와 점만 남기고 제거)
                routeDstnc = parts[1].replaceAll("[^0-9.]", "");
            }
        } else {
            routeDrnm = "위치정보 없음";
        }

        inspectionVO.setRouteDrnm(routeDrnm);
        inspectionVO.setRouteDstnc(routeDstnc);
        inspectionVO.setFcltsNm(fcltsNm != null ? fcltsNm : "시설물명 없음");
        inspectionVO.setIspcDttm(ispcDttm);
        inspectionVO.setFsttmRgsrId("ADMIN");
        inspectionVO.setLsttmModfrId("ADMIN");

        // DB 저장 (마스터)
        inspectionMapper.insertInspection(inspectionVO);

        // 4. 이미지 추출 및 저장 (시트 내 모든 이미지)
        List<? extends PictureData> pictures = workbook.getAllPictures();

        // 파일 업로드 경로 생성 (RegionServiceImpl 방식)
        Path savePath = Paths.get(servletContext.getRealPath(UPLOAD_PATH));
        try {
            if (!Files.exists(savePath)) {
                Files.createDirectories(savePath);
                log.info("파일 업로드 경로 생성: {}", savePath.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("파일 업로드 경로 생성 실패: {}", savePath.toAbsolutePath(), e);
            throw new RuntimeException("파일 저장 경로를 생성할 수 없습니다.", e);
        }

        for (PictureData picture : pictures) {
            String ext = picture.suggestFileExtension();
            byte[] data = picture.getData();

            String savedFileName = UUID.randomUUID().toString() + "." + ext;
            Path filePath = savePath.resolve(savedFileName);

            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                fos.write(data);
            }

            Long fileSeq = inspectionMapper.selectNextFileSeq();

            InspectionFileVO fileVO = new InspectionFileVO();
            fileVO.setFileSeq(fileSeq);
            fileVO.setAttflNm(savedFileName);
            fileVO.setAttflMg((long) data.length);
            // DB에는 실제 저장된 절대 경로 또는 웹 경로 중 선택하여 저장
            // RegionServiceImpl은 절대경로가 아닌 UPLOAD_PATH 상수를 저장하고 있음 (웹 접근용)
            // 여기서는 실제 파일 로딩을 위해 절대 경로를 저장하거나, 웹 접근을 위해 상대경로를 저장해야 함
            // InspectionController에서 FileSystemResource로 읽으므로 절대 경로 저장 유지
            fileVO.setAttflPath(filePath.toString());
            fileVO.setOrtxFlnm("excel_extracted." + ext);
            fileVO.setFsttmRgsrId("ADMIN");
            fileVO.setLsttmModfrId("ADMIN");

            inspectionMapper.insertInspectionFile(fileVO);
            inspectionMapper.insertInspectionFileMapping(ispcId, fileSeq, "ADMIN");
        }
    }

    private String getCellValue(Sheet sheet, int rowNum, int colNum) {
        Row row = sheet.getRow(rowNum);
        if (row == null)
            return "";
        Cell cell = row.getCell(colNum);
        if (cell == null)
            return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    // 날짜 형식인 경우 포맷팅하여 반환
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                    return sdf.format(cell.getDateCellValue());
                }
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return "";
        }
    }

    @Override
    public List<InspectionVO> selectInspectionList(InspectionSearchDTO searchDTO) {
        return inspectionMapper.selectInspectionList(searchDTO);
    }

    @Override
    public long countInspectionList(InspectionSearchDTO searchDTO) {
        return inspectionMapper.countInspectionList(searchDTO);
    }

    @Override
    public InspectionVO selectInspectionDetail(String ispcId) {
        InspectionVO vo = inspectionMapper.selectInspection(ispcId);
        if (vo != null) {
            vo.setFiles(inspectionMapper.selectInspectionFiles(ispcId));
        }
        return vo;
    }

    @Override
    public InspectionFileVO getFileDetail(Long fileSeq) {
        return inspectionMapper.selectFileDetail(fileSeq);
    }
}
