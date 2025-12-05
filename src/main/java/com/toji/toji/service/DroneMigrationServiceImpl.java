package com.toji.toji.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.GpsDirectory;
import com.drew.lang.GeoLocation;
import com.drew.lang.Rational;
import com.toji.toji.domain.DroneRawPhotoVO;
import com.toji.toji.mapper.DroneRawPhotoMapper;

import jakarta.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

// [추가된 Import]
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.net.InetSocketAddress;
import java.net.Proxy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

/**
 * 드론 원본 사진(Raw Image) 이관 및 관리 자동화 서비스 구현체
 * 
 * <p>
 * 외부 서버 API를 통해 드론 촬영 원본 이미지 리스트를 조회하고,
 * NAS로 다운로드한 뒤, 이미지의 EXIF(GPS) 정보를 추출하여 DB에 적재하는 역할을 수행합니다.
 * </p>
 */
@Service
public class DroneMigrationServiceImpl implements DroneMigrationService {

    // 서비스 설정 상수
    // private static final String NAS_ROOT_PATH = "/nas/drone/raw/";
    // [수정 후] 로컬 Mac 테스트용 경로 (바탕화면 등에 폴더 미리 생성 추천)
    // private static final String NAS_ROOT_PATH =
    // "/CDIGIT_CCTV01/attach/extension/illegalLands/orginal"; // mac
    private static final String NAS_ROOT_PATH = "/CDIGIT_CCTV01/attach/extension/illegalLands/orginal";
    private static final String EXTERNAL_API_URL = "http://external-api.com/drone/photos";

    @Autowired
    private DroneRawPhotoMapper droneRawPhotoMapper;

    @Autowired
    private ServletContext servletContext;

    /**
     * 마이그레이션 실행 메인 로직
     * 
     * 1. 외부 API로부터 이미지 URL 리스트 조회
     * 2. 각 URL에 대해 이미지 다운로드 (NAS 저장)
     * 3. 다운로드된 파일에서 EXIF(GPS, 촬영일자) 정보 추출
     * 4. 추출된 정보를 DB(T_DRONE_RAW_PHOTO)에 저장
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void executeMigration() throws Exception {
        // 1. 이미지 URL 리스트 조회 (현재는 더미 데이터)
        List<String> imageUrls = fetchImageUrls();

        for (String imageUrl : imageUrls) {
            // 2. 이미지 다운로드 (여기서 에러 나면 롤백)
            File downloadedFile = downloadImage(imageUrl);

            // 3. EXIF 정보 추출
            DroneRawPhotoVO vo = extractExif(downloadedFile);
            String realFlightId = downloadedFile.getParentFile().getName();
            vo.setFlightId(realFlightId);

            // 4. DB 적재 (여기서 에러 나도 롤백)
            droneRawPhotoMapper.insertRawPhoto(vo);
        }
    }

    /**
     * 외부 API를 호출하여 다운로드할 이미지 URL 리스트를 가져옵니다.
     * 
     * @return 이미지 URL 리스트
     */
    private List<String> fetchImageUrls() {
        List<String> urls = new ArrayList<>();

        // 1. 날짜 계산
        LocalDate yesterday = LocalDate.now().minusDays(1);

        LocalDateTime startDateTime = yesterday.atStartOfDay();
        long startTimestamp = startDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        LocalDateTime endDateTime = LocalDateTime.of(yesterday, LocalTime.MAX);
        long endTimestamp = endDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        // 2. URL 생성
        String requestUrl = String.format("%s?start_timestamp=%d&end_timestamp=%d",
                EXTERNAL_API_URL, startTimestamp, endTimestamp);

        System.out.println(">> 외부 API 요청 시작: " + requestUrl);

        try {
            // [설정] 타임아웃 및 프록시 설정을 위한 Factory 생성
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10000); // 연결 타임아웃 10초
            factory.setReadTimeout(10000); // 읽기 타임아웃 10초

            // [중요] 내부망 환경일 경우 프록시 설정이 필요할 수 있습니다.
            // 필요시 아래 주석을 해제하고 프록시 IP와 포트를 입력하세요.
            // Proxy proxy = new Proxy(Proxy.Type.HTTP, new
            // InetSocketAddress("YOUR_PROXY_IP", 8080));
            // factory.setProxy(proxy);

            RestTemplate restTemplate = new RestTemplate(factory);

            HttpHeaders headers = new HttpHeaders();
            // [추가] 서버에서 봇(Java) 요청을 차단하는 것을 막기 위해 브라우저인 척 User-Agent 설정
            headers.add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            headers.add("Accept", "application/json, text/plain, */*");
            // headers.set("Authorization", "Bearer YOUR_TOKEN"); // 인증 필요시

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 3. 요청 전송
            ResponseEntity<String[]> response = restTemplate.exchange(
                    requestUrl,
                    HttpMethod.GET,
                    entity,
                    String[].class);

            String[] responseArray = response.getBody();
            if (responseArray != null) {
                urls = Arrays.asList(responseArray);
                System.out.println(">> 조회 성공: 총 " + urls.size() + "건");
                return urls; // 성공 시 바로 리턴
            } else {
                System.out.println(">> 조회 결과 없음 (NULL)");
            }

        } catch (ResourceAccessException e) {
            System.err.println(">> [네트워크 에러] 외부 API 접근 실패 (I/O Error).");
            System.err.println(">> 원인: 방화벽 차단, 프록시 미설정, 또는 연결 타임아웃");
            System.err.println(">> 상세 메시지: " + e.getMessage());
            // e.printStackTrace();
        } catch (Exception e) {
            System.err.println(">> 외부 API 호출 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }

        // 4. 실패 시 로컬 파일 스캔 (백업 로직)
        System.out.println(">> 외부 API 호출 실패 또는 결과 없음. 로컬 테스트 경로를 스캔합니다.");

        // String localImagePath =
        // "/Users/wooseok/Desktop/toji/src/main/webapp/resources/static/images"; //MAC
        String localImagePath = "C:\\toji\\src\\main\\webapp\\resources\\static\\images"; // Windows
        File dir = new File(localImagePath);

        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir
                    .listFiles((d, name) -> name.toLowerCase().endsWith(".png") || name.toLowerCase().endsWith(".jpg"));
            if (files != null) {
                for (File file : files) {
                    // file:/// 프로토콜을 붙여서 URL 형태로 추가
                    urls.add(file.toURI().toString());
                }
                System.out.println(">> 로컬 이미지 스캔 성공: 총 " + urls.size() + "건");
            }
        } else {
            System.err.println(">> 로컬 이미지 디렉토리를 찾을 수 없습니다: " + localImagePath);
        }

        return urls;
    }

    /**
     * 개별 이미지 URL을 분석하여 NAS의 적절한 Flight ID 폴더에 저장합니다.
     * * [저장 로직]
     * 1. URL: .../flight/1762143142238/images/camera_131402.png
     * 2. Flight ID 추출: 1762143142238
     * 3. 최종 경로: /nas/drone/raw/{1762143142238}/camera_131402.png
     * * @param imageUrl 개별 이미지 다운로드 주소
     * 
     * @return 저장된 File 객체
     */
    private File downloadImage(String imageUrl) throws Exception {
        // 1. URL 파싱하여 Flight ID(Timestamp) 추출
        // 예: https://.../flight/1762143142238/images/camera_131402.png
        String flightId = "unknown_flight";
        String fileName = "unknown.png";

        try {
            String[] parts = imageUrl.split("/");
            for (int i = 0; i < parts.length; i++) {
                // "flight" 키워드 다음 부분이 Timestamp라고 가정
                if ("flight".equalsIgnoreCase(parts[i]) && i + 1 < parts.length) {
                    flightId = parts[i + 1];
                }
            }
            // 파일명은 URL의 맨 마지막 부분
            fileName = parts[parts.length - 1];
        } catch (Exception e) {
            System.err.println(">> URL 파싱 실패: " + imageUrl);
            // 파싱 실패 시 기본 폴더에 저장하거나 에러 처리
        }

        // 2. 저장할 디렉토리 경로 구성 (NAS_ROOT + Flight_ID)
        // String today = new SimpleDateFormat("yyyyMMdd").format(new Date());

        // ServletContext를 사용하여 실제 경로 가져오기 (RegionServiceImpl 참조)
        String realRootPath = servletContext.getRealPath(NAS_ROOT_PATH);
        Path rootPath = Paths.get(realRootPath);

        // 최종 폴더 경로: .../orginal/1762143142238/
        Path saveDirPath = rootPath.resolve(flightId);

        if (!Files.exists(saveDirPath)) {
            Files.createDirectories(saveDirPath); // 해당 Flight ID 폴더가 없으면 생성
        }

        // 3. 파일 저장
        Path filePath = saveDirPath.resolve(fileName);
        File file = filePath.toFile();

        // 이미 파일이 존재하면 덮어쓸지, 건너뛸지 결정 (여기선 덮어쓰기 로직)
        try (InputStream in = new URL(imageUrl).openStream();
                FileOutputStream out = new FileOutputStream(file)) {

            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }

        // 로그: 어떤 ID 폴더에 저장되었는지 확인
        System.out.println(">> 저장 완료 (" + flightId + "): " + fileName);
        return file;
    }

    /**
     * 이미지 파일의 메타데이터(EXIF)를 분석하여 GPS 정보와 촬영 일시를 추출합니다.
     * 
     * @param file 분석할 이미지 파일
     * @return 추출된 정보를 담은 DroneRawPhotoVO 객체
     * @throws Exception 메타데이터 읽기 실패 시
     */
    private DroneRawPhotoVO extractExif(File file) throws Exception {
        DroneRawPhotoVO vo = new DroneRawPhotoVO();

        // 절대 경로에서 웹 루트 경로를 제거하여 상대 경로 추출
        String absolutePath = file.getAbsolutePath();
        String rootPath = servletContext.getRealPath("/");
        String relativePath = absolutePath;

        if (rootPath != null && absolutePath.startsWith(rootPath)) {
            relativePath = absolutePath.substring(rootPath.length());
        }

        if (!relativePath.startsWith(File.separator)) {
            relativePath = File.separator + relativePath;
        }

        vo.setFilePath(relativePath);
        vo.setFileNm(file.getName());
        vo.setShootDt(new Date(0)); // 기본값: 1970-01-01 (Flight ID 파싱 실패 시 식별 불가 표시)

        try {
            Metadata metadata = ImageMetadataReader.readMetadata(file);

            // 1. 촬영 날짜 추출 (Flight ID가 Timestamp임) - GPS 유무와 상관없이 실행
            try {
                String flightId = file.getParentFile().getName();
                long timestamp = Long.parseLong(flightId);
                vo.setShootDt(new Date(timestamp));
                System.out.println("   -> [성공] Flight ID 기반 날짜 설정: " + vo.getShootDt());
            } catch (NumberFormatException e) {
                System.err.println(
                        "   -> [실패] Flight ID 파싱 실패 (" + file.getParentFile().getName() + "): " + e.getMessage());
            }

            GpsDirectory gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory.class);

            if (gpsDirectory != null) {
                Double lat = null;
                Double lon = null;

                // 1. 편의 메소드로 시도 (GeoLocation)
                GeoLocation geoLocation = gpsDirectory.getGeoLocation();
                if (geoLocation != null) {
                    lat = geoLocation.getLatitude();
                    lon = geoLocation.getLongitude();
                }
                // 2. [핵심] 실패 시 Raw Tag 직접 읽기 (성공한 코드의 로직 이식)
                else {
                    try {
                        Rational[] latRationals = gpsDirectory.getRationalArray(GpsDirectory.TAG_LATITUDE);
                        Rational[] lonRationals = gpsDirectory.getRationalArray(GpsDirectory.TAG_LONGITUDE);
                        String latRef = gpsDirectory.getString(GpsDirectory.TAG_LATITUDE_REF);
                        String lonRef = gpsDirectory.getString(GpsDirectory.TAG_LONGITUDE_REF);

                        if (latRationals != null && lonRationals != null) {
                            lat = convertRationalToDouble(latRationals, latRef);
                            lon = convertRationalToDouble(lonRationals, lonRef);
                        }
                    } catch (Exception ex) {
                        System.err.println("Raw GPS 데이터 파싱 실패: " + ex.getMessage());
                    }
                }

                // 3. 추출된 값 저장
                if (lat != null && lon != null) {
                    vo.setGpsLat(lat);
                    vo.setGpsLon(lon);
                    System.out.println("   -> [성공] GPS 추출 완료: " + lat + ", " + lon);
                } else {
                    System.err.println("   -> [실패] GPS 태그가 없거나 파싱 불가");
                }
            }
        } catch (Exception e) {
            System.err.println(">> [Meta] EXIF 추출 중 에러 발생: " + e.getMessage());
        }

        return vo;
    }

    /**
     * Rational(분수) 배열을 도(Degree) 단위 Double로 변환하는 도우미 메소드
     * (예: 37도 30분 30초 -> 37.5083...)
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