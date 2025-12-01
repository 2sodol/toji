package com.toji.toji.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.lang.Rational;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.GpsDirectory;
import com.toji.toji.domain.DroneImageVO;
import com.toji.toji.mapper.DroneImageMapper;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@Slf4j
@Service
public class DroneImageScheduler {

    @Resource
    private DroneImageMapper droneImageMapper;

    @Resource
    private VworldService vworldService;

    // 테스트용 하드코딩 URL 리스트
    private static final List<String> TARGET_URLS = new ArrayList<>();

    static {
        // 실제 운영 시에는 DB나 설정 파일에서 가져오도록 변경 필요
        TARGET_URLS.add(
                "https://raw.githubusercontent.com/drewnoakes/metadata-extractor-images/master/jpg/Apple%20iPhone%206.jpg"); // 테스트용
                                                                                                                             // 이미지
                                                                                                                             // (GPS
                                                                                                                             // 포함)
        // TARGET_URLS.add("http://external-server/camera_1.png");
    }

    // 파일 저장 루트 경로 (프로젝트 내 리소스 폴더)
    // Mac 환경을 고려하여 프로젝트 경로 기반으로 설정. 필요 시 절대 경로로 변경 가능.
    private static final String SAVE_ROOT_PATH = System.getProperty("user.dir")
            + "/src/main/webapp/resources/static/images/";

    /**
     * 10분마다 실행되는 드론 이미지 수집 스케줄러
     * Cron: 0 0/10 * * * *
     */
    @Scheduled(cron = "0 0/10 * * * *")
    @EventListener(ApplicationReadyEvent.class)
    public void collectDroneImages() {
        log.info(">>> Drone Image Collection Started: {}", new Date());

        // for (String urlStr : TARGET_URLS) {
        // try {
        // // 1. 날짜별 디렉토리 생성 (YYYY/MM/DD)
        // Date now = new Date();
        // SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
        // String datePath = sdf.format(now);
        // String saveDirPath = SAVE_ROOT_PATH + datePath;

        // File saveDir = new File(saveDirPath);
        // if (!saveDir.exists()) {
        // saveDir.mkdirs();
        // }

        // // 2. 파일 다운로드
        // String fileName = getFileNameFromUrl(urlStr);
        // // 중복 방지를 위해 시간값 추가
        // String savedFileName = System.currentTimeMillis() + "_" + fileName;
        // File savedFile = downloadFile(urlStr, saveDirPath, savedFileName);

        // if (savedFile == null) {
        // log.error("Failed to download file from: {}", urlStr);
        // continue;
        // }

        // log.info("File downloaded: {}", savedFile.getAbsolutePath());

        // // 3. GPS 추출
        // Double[] gps = extractGps(savedFile);
        // Double latitude = gps[0];
        // Double longitude = gps[1];

        // // 4. 주소 변환 및 그룹핑
        // String addrFull = null;
        // String addrGroup = null;

        // if (latitude != null && longitude != null) {
        // try {
        // // VworldService 호출하여 Map 반환
        // Map<String, String> addressMap = vworldService.latLonToAddress(latitude,
        // longitude);
        // addrFull = addressMap.get("full");
        // addrGroup = addressMap.get("group");
        // } catch (Exception e) {
        // log.error("Address conversion failed: {}", e.getMessage());
        // }
        // } else {
        // log.warn("No GPS data found for file: {}", savedFileName);
        // }

        // // 5. DB 저장
        // DroneImageVO vo = new DroneImageVO();
        // vo.setRemoteUrl(urlStr);
        // vo.setFileName(savedFileName);
        // vo.setStorePath(savedFile.getAbsolutePath());
        // vo.setFileSize(savedFile.length());
        // vo.setLatitude(latitude);
        // vo.setLongitude(longitude);
        // vo.setAddrFull(addrFull);
        // vo.setAddrGroup(addrGroup);

        // // 촬영 일시는 메타데이터에서 가져오는 것이 좋으나, 없으면 현재 시간으로 설정
        // // (여기서는 간단히 현재 시간 사용, 필요 시 Metadata에서 Date 추출 로직 추가 가능)
        // vo.setCollectTime(now);

        // droneImageMapper.insertDroneImage(vo);
        // log.info("DB Inserted: {}", savedFileName);

        // } catch (Exception e) {
        // log.error("Error processing URL {}: {}", urlStr, e.getMessage());
        // // 다음 파일 처리를 위해 continue (for문이므로 자동 진행)
        // }
        // }

        // Local File Testing Logic
        try {
            File sourceDir = new File(SAVE_ROOT_PATH);
            if (!sourceDir.exists()) {
                log.warn("Source directory does not exist: {}", SAVE_ROOT_PATH);
                return;
            }

            File[] files = sourceDir.listFiles((dir, name) -> {
                String lower = name.toLowerCase();
                return (lower.endsWith(".jpg") || lower.endsWith(".png")) && new File(dir, name).isFile();
            });

            if (files == null || files.length == 0) {
                log.warn("No image files found in: {}", SAVE_ROOT_PATH);
                return;
            }

            // Take up to 5 files
            int limit = Math.min(files.length, 5);
            for (int i = 0; i < limit; i++) {
                File sourceFile = files[i];
                String fileName = sourceFile.getName();

                try {
                    // 1. Create date directory
                    Date now = new Date();
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                    String datePath = sdf.format(now);
                    String saveDirPath = SAVE_ROOT_PATH + datePath;

                    File saveDir = new File(saveDirPath);
                    if (!saveDir.exists()) {
                        saveDir.mkdirs();
                    }

                    // 2. Copy file (simulate download)
                    String savedFileName = System.currentTimeMillis() + "_" + fileName;
                    File savedFile = new File(saveDir, savedFileName);

                    Files.copy(sourceFile.toPath(), savedFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

                    log.info("File copied: {} -> {}", sourceFile.getAbsolutePath(), savedFile.getAbsolutePath());

                    // 3. GPS Extraction
                    Double[] gps = extractGps(savedFile);
                    Double latitude = gps[0];
                    Double longitude = gps[1];

                    // 4. Address Conversion
                    String addrFull = null;
                    String addrGroup = null;

                    if (latitude != null && longitude != null) {
                        try {
                            Map<String, String> addressMap = vworldService.latLonToAddress(latitude, longitude);
                            addrFull = addressMap.get("full");
                            addrGroup = addressMap.get("group");
                        } catch (Exception e) {
                            log.error("Address conversion failed: {}", e.getMessage());
                        }
                    } else {
                        log.warn("No GPS data found for file: {}", savedFileName);
                    }

                    // 5. DB Save
                    DroneImageVO vo = new DroneImageVO();
                    vo.setRemoteUrl("local:" + fileName);
                    vo.setFileName(savedFileName);
                    vo.setStorePath(savedFile.getAbsolutePath());
                    vo.setFileSize(savedFile.length());
                    vo.setLatitude(latitude);
                    vo.setLongitude(longitude);
                    vo.setAddrFull(addrFull);
                    vo.setAddrGroup(addrGroup);
                    vo.setCollectTime(now);

                    droneImageMapper.insertDroneImage(vo);
                    log.info("DB Inserted: {}", savedFileName);

                } catch (Exception e) {
                    log.error("Error processing file {}: {}", fileName, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error during local file processing", e);
        }

        log.info(">>> Drone Image Collection Finished");
    }

    /**
     * URL에서 파일 다운로드
     */
    private File downloadFile(String urlStr, String saveDirPath, String fileName) throws Exception {
        URL url = new URL(urlStr);
        File file = new File(saveDirPath, fileName);

        try (InputStream in = url.openStream();
                FileOutputStream out = new FileOutputStream(file)) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
        return file;
    }

    /**
     * 파일명 추출
     */
    private String getFileNameFromUrl(String url) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    /**
     * GPS 정보 추출 (metadata-extractor 사용)
     * 
     * @return Double[] {latitude, longitude} or {null, null}
     */
    private Double[] extractGps(File file) {
        Double latitude = null;
        Double longitude = null;

        try {
            Metadata metadata = ImageMetadataReader.readMetadata(file);
            GpsDirectory gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory.class);

            if (gpsDirectory != null) {
                // Try to read the location
                if (gpsDirectory.getGeoLocation() != null) {
                    latitude = gpsDirectory.getGeoLocation().getLatitude();
                    longitude = gpsDirectory.getGeoLocation().getLongitude();
                }
                // Fallback: Read rational values directly if GeoLocation is null but tags exist
                else {
                    Rational[] latRationals = gpsDirectory.getRationalArray(GpsDirectory.TAG_LATITUDE);
                    Rational[] lonRationals = gpsDirectory.getRationalArray(GpsDirectory.TAG_LONGITUDE);
                    String latRef = gpsDirectory.getString(GpsDirectory.TAG_LATITUDE_REF);
                    String lonRef = gpsDirectory.getString(GpsDirectory.TAG_LONGITUDE_REF);

                    if (latRationals != null && lonRationals != null) {
                        latitude = convertRationalToDouble(latRationals, latRef);
                        longitude = convertRationalToDouble(lonRationals, lonRef);
                    }
                }
            }
        } catch (Exception e) {
            log.error("GPS extraction failed: {}", e.getMessage());
        }

        return new Double[] { latitude, longitude };
    }

    /**
     * Rational 배열을 도(Degree) 단위 Double로 변환
     */
    private double convertRationalToDouble(Rational[] rationals, String ref) {
        double degrees = rationals[0].doubleValue();
        double minutes = rationals[1].doubleValue();
        double seconds = rationals[2].doubleValue();

        double result = degrees + (minutes / 60.0) + (seconds / 3600.0);

        if ("S".equalsIgnoreCase(ref) || "W".equalsIgnoreCase(ref)) {
            result = -result;
        }
        return result;
    }
}
