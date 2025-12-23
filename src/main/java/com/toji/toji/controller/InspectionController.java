package com.toji.toji.controller;

import com.toji.toji.dto.InspectionUploadRequest;
import com.toji.toji.service.InspectionFileVO;
import com.toji.toji.service.InspectionService;
import com.toji.toji.service.InspectionVO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Controller
@RequestMapping("/inspection")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    // --- 페이지 이동 ---

    /** 목록 페이지 */
    @GetMapping("/list")
    public String list() {
        return "inspection/list";
    }

    /** 목록 조회 (DataTables Ajax) */
    @GetMapping("/api/list")
    @ResponseBody
    public com.toji.toji.dto.DataTableResponse<InspectionVO> getList(
            @RequestParam("draw") int draw,
            @RequestParam("start") int start,
            @RequestParam("length") int length,
            @RequestParam(value = "search[value]", required = false) String searchKeyword,
            @RequestParam(value = "order[0][column]", defaultValue = "3") int orderColumn,
            @RequestParam(value = "order[0][dir]", defaultValue = "desc") String orderDir) {
        
        com.toji.toji.dto.InspectionSearchDTO searchDTO = new com.toji.toji.dto.InspectionSearchDTO();
        searchDTO.setDraw(draw);
        searchDTO.setStart(start);
        searchDTO.setLength(length);
        searchDTO.setSearchKeyword(searchKeyword);
        searchDTO.setOrderColumn(orderColumn);
        searchDTO.setOrderDir(orderDir);

        List<InspectionVO> list = inspectionService.selectInspectionList(searchDTO);
        long totalCount = inspectionService.countInspectionList(searchDTO);

        com.toji.toji.dto.DataTableResponse<InspectionVO> response = new com.toji.toji.dto.DataTableResponse<>();
        response.setDraw(draw);
        response.setRecordsTotal(totalCount);
        response.setRecordsFiltered(totalCount);
        response.setData(list);
        
        return response;
    }

    /** 상세 정보 조회 (JSON) */
    @GetMapping("/api/view")
    @ResponseBody
    public InspectionVO getDetail(@RequestParam("id") String ispcId) {
        return inspectionService.selectInspectionDetail(ispcId);
    }

    // --- 기능 처리 ---

    /** 엑셀 업로드 처리 (Base64) - 단건 */
    @PostMapping("/uploadAction")
    @ResponseBody
    public ResponseEntity<String> uploadAction(@RequestBody InspectionUploadRequest request) {
        // ... (기존 코드 유지)
        return ResponseEntity.ok("success"); // 임시 placeholder, 실제로는 아래 메서드 사용
    }

    /** 엑셀 업로드 처리 (Base64) - 다건 */
    @PostMapping("/uploadMultipleAction")
    @ResponseBody
    public ResponseEntity<String> uploadMultipleAction(@RequestBody List<InspectionUploadRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.badRequest().body("파일 데이터가 비어있습니다.");
        }

        StringBuilder errorMsg = new StringBuilder();
        int successCount = 0;

        for (InspectionUploadRequest request : requests) {
            try {
                if (request.getBase64File() != null && !request.getBase64File().isEmpty()) {
                    inspectionService.uploadInspectionExcel(request.getBase64File());
                    successCount++;
                }
            } catch (Exception e) {
                e.printStackTrace();
                errorMsg.append("[").append(request.getFileName()).append("] 실패: ").append(e.getMessage()).append("\n");
            }
        }

        if (errorMsg.length() > 0) {
            // 일부 실패 시 207 Multi-Status 또는 500 등 정책에 따라 반환
            // 여기서는 500으로 실패 내역 전달
            return ResponseEntity.internalServerError()
                    .body("총 " + requests.size() + "건 중 " + successCount + "건 성공.\n\n오류 내역:\n" + errorMsg.toString());
        }

        return ResponseEntity.ok("success");
    }

    /** 이미지 스트림 반환 */
    @GetMapping("/image/{fileSeq}")
    public ResponseEntity<Resource> displayImage(@PathVariable Long fileSeq) {
        InspectionFileVO fileVO = inspectionService.getFileDetail(fileSeq);
        if (fileVO == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        String pathStr = fileVO.getAttflPath();
        Resource resource = new FileSystemResource(pathStr);

        if (!resource.exists()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        HttpHeaders header = new HttpHeaders();
        Path path = Paths.get(pathStr);
        try {
            header.add("Content-Type", Files.probeContentType(path));
        } catch (IOException e) {
            e.printStackTrace();
        }

        return new ResponseEntity<>(resource, header, HttpStatus.OK);
    }
}
