package com.toji.toji.controller;

import com.toji.toji.domain.DroneRawPhotoVO;
import com.toji.toji.service.DroneRawPhotoService;
import jakarta.servlet.ServletContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/drone")
public class DroneRawPhotoController {

    @Autowired
    private DroneRawPhotoService droneRawPhotoService;

    @Autowired
    private ServletContext servletContext;

    // DroneMigrationServiceImpl과 동일한 경로 사용
    // private static final String NAS_ROOT_PATH =
    // "/CDIGIT_CCTV01/attach/extension/illegalLands/orginal";

    /**
     * 촬영 날짜 목록 조회
     */
    @GetMapping("/dates")
    public ResponseEntity<List<String>> getDates() {
        List<String> dates = droneRawPhotoService.getAvailableDates();
        return ResponseEntity.ok(dates);
    }

    /**
     * 특정 날짜의 사진 목록 조회
     */
    @GetMapping("/photos")
    public ResponseEntity<List<DroneRawPhotoVO>> getPhotos(@RequestParam("date") String date) {
        List<DroneRawPhotoVO> photos = droneRawPhotoService.getPhotosByDate(date);
        return ResponseEntity.ok(photos);
    }

    /**
     * 사진 다운로드
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadPhoto(@PathVariable("id") Long photoSeq)
            throws UnsupportedEncodingException {
        DroneRawPhotoVO photo = droneRawPhotoService.getPhotoById(photoSeq);

        if (photo == null) {
            return ResponseEntity.notFound().build();
        }

        // DB에 저장된 상대 경로 (예: /20251205/1762143142238/camera_131402.png)
        // DroneMigrationServiceImpl에서 저장할 때 맨 앞에 /를 붙였음.
        String relativePath = photo.getFilePath();

        // 웹 루트 경로 가져오기
        String rootPath = servletContext.getRealPath("/");

        // 전체 경로 구성
        File file = new File(rootPath, relativePath);

        if (!file.exists()) {
            // 로컬 테스트 환경 등에서 파일이 없을 수 있음
            System.err.println("파일을 찾을 수 없습니다: " + file.getAbsolutePath());
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String filename = photo.getFileNm();
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8.toString()).replaceAll("\\+",
                "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFilename + "\"")
                .body(resource);
    }

    /**
     * 사진 미리보기 (썸네일)
     */
    @GetMapping("/thumbnail/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Resource> viewPhoto(@PathVariable("id") Long photoSeq) {
        DroneRawPhotoVO photo = droneRawPhotoService.getPhotoById(photoSeq);

        if (photo == null) {
            return ResponseEntity.notFound().build();
        }

        String relativePath = photo.getFilePath();
        String rootPath = servletContext.getRealPath("/");
        File file = new File(rootPath, relativePath);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        MediaType mediaType = MediaType.IMAGE_JPEG;
        String filename = photo.getFileNm().toLowerCase();
        if (filename.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (filename.endsWith(".gif")) {
            mediaType = MediaType.IMAGE_GIF;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }
}
