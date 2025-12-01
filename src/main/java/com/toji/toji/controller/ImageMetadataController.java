package com.toji.toji.controller;

import com.drew.imaging.ImageMetadataReader;
import com.drew.lang.GeoLocation;
import com.drew.lang.Rational; // ★ 필수 Import (이게 핵심입니다)
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.GpsDirectory;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ImageMetadataController {

    @GetMapping("/image-metadata")
    public String getImageMetadata(Model model) {
        // 경로 확인
        String imageDirPath = "c:/toji/src/main/webapp/resources/static/images";
        File imageDir = new File(imageDirPath);

        List<Map<String, Object>> imageMetadataList = new ArrayList<>();

        if (imageDir.exists() && imageDir.isDirectory()) {
            // 이미지 파일 필터링
            File[] files = imageDir.listFiles(
                    (dir, name) -> name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".png"));

            if (files != null) {
                int count = 0;
                for (File file : files) {
                    if (count >= 5)
                        break; // 5개만 테스트

                    Map<String, Object> metadataMap = new HashMap<>();
                    metadataMap.put("fileName", file.getName());
                    List<String> xmpLog = new ArrayList<>();

                    System.out.println("===== Metadata 분석 시작: " + file.getName() + " =====");

                    try {
                        Metadata metadata = ImageMetadataReader.readMetadata(file);
                        GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);

                        if (gpsDir != null) {
                            // 1. [자동] GeoLocation 시도 (일반적인 경우)
                            GeoLocation geoLocation = gpsDir.getGeoLocation();

                            if (geoLocation != null) {
                                metadataMap.put("latitude", geoLocation.getLatitude());
                                metadataMap.put("longitude", geoLocation.getLongitude());
                                xmpLog.add("✅ 표준 GeoLocation 추출 성공");
                            } else {
                                // 2. [수동] Raw Data 강제 추출 (방위 정보 누락된 드론 데이터용)
                                // 위도/경도 태그 ID는 전세계 표준입니다 (Lat: 2, Lon: 4)
                                Rational[] latParts = gpsDir.getRationalArray(GpsDirectory.TAG_LATITUDE);
                                Rational[] lonParts = gpsDir.getRationalArray(GpsDirectory.TAG_LONGITUDE);

                                if (latParts != null && lonParts != null) {
                                    // 도/분/초(DMS) -> 10진수(Decimal) 변환 공식 적용
                                    // 공식: 도 + (분/60) + (초/3600)
                                    double lat = latParts[0].doubleValue()
                                            + (latParts[1].doubleValue() / 60.0)
                                            + (latParts[2].doubleValue() / 3600.0);

                                    double lon = lonParts[0].doubleValue()
                                            + (lonParts[1].doubleValue() / 60.0)
                                            + (lonParts[2].doubleValue() / 3600.0);

                                    metadataMap.put("latitude", lat);
                                    metadataMap.put("longitude", lon);

                                    String msg = String.format("🔥 Raw Data 강제 변환 성공! 위도: %.6f, 경도: %.6f", lat, lon);
                                    System.out.println(msg);
                                    xmpLog.add(msg);
                                } else {
                                    xmpLog.add("❌ GPS 방은 있지만 좌표값(Rational)이 비어있습니다.");
                                }
                            }

                            // (참고용) 고도 정보 등 기타 GPS 정보 로깅
                            if (gpsDir.containsTag(GpsDirectory.TAG_ALTITUDE)) {
                                xmpLog.add("✨ 고도: " + gpsDir.getDoubleObject(GpsDirectory.TAG_ALTITUDE) + "m");
                            }

                        } else {
                            xmpLog.add("❌ GPS 디렉토리가 없습니다.");
                        }

                    } catch (Exception e) {
                        metadataMap.put("error", "에러 발생: " + e.getMessage());
                        e.printStackTrace();
                    }

                    metadataMap.put("xmpLog", xmpLog);
                    imageMetadataList.add(metadataMap);
                    count++;
                }
            }
        } else {
            model.addAttribute("error", "폴더가 없습니다: " + imageDirPath);
        }

        model.addAttribute("images", imageMetadataList);
        return "imageMetadata";
    }
}