package com.toji.toji.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class VworldServiceImpl implements VworldService {

    // index.jsp에서 사용된 API 키
    private static final String API_KEY = "B13ADD16-4164-347A-A733-CD9022E8FB3B";
    private static final String API_URL = "https://api.vworld.kr/req/address";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Map<String, String> latLonToAddress(double lat, double lon) {
        Map<String, String> result = new HashMap<>();
        result.put("full", "주소 미상");
        result.put("group", "주소 미상");

        try {
            // 1. V-World Geocoder API 호출
            // point=x,y (경도, 위도 순서)
            String point = lon + "," + lat;
            StringBuilder urlBuilder = new StringBuilder(API_URL);
            urlBuilder.append("?service=address");
            urlBuilder.append("&request=getAddress");
            urlBuilder.append("&version=2.0");
            urlBuilder.append("&crs=epsg:4326");
            urlBuilder.append("&point=").append(point);
            urlBuilder.append("&format=json");
            urlBuilder.append("&type=PARCEL"); // 지번 주소 (PARCEL)
            urlBuilder.append("&zipcode=false");
            urlBuilder.append("&simple=false");
            urlBuilder.append("&key=").append(API_KEY);

            URL url = new URL(urlBuilder.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");

            BufferedReader rd;
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
                rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) {
                sb.append(line);
            }
            rd.close();
            conn.disconnect();

            // 2. JSON 파싱 (Jackson 사용)
            JsonNode root = objectMapper.readTree(sb.toString());
            JsonNode response = root.path("response");

            if ("OK".equals(response.path("status").asText())) {
                JsonNode resultArray = response.path("result");
                if (resultArray.isArray() && resultArray.size() > 0) {
                    JsonNode firstResult = resultArray.get(0);

                    // 3. 전체 주소 추출 ("full")
                    String fullAddress = firstResult.path("text").asText();
                    result.put("full", fullAddress);

                    // 4. 구조적 주소 조합 ("group")
                    // level1(시도) + level2(시군구) + level3(읍면동) + level4L(리)
                    JsonNode structure = firstResult.path("structure");
                    StringBuilder groupBuilder = new StringBuilder();

                    String level1 = structure.path("level1").asText();
                    String level2 = structure.path("level2").asText();
                    String level3 = structure.path("level3").asText();
                    String level4L = structure.path("level4L").asText();

                    if (!level1.isEmpty())
                        groupBuilder.append(level1).append(" ");
                    if (!level2.isEmpty())
                        groupBuilder.append(level2).append(" ");
                    if (!level3.isEmpty())
                        groupBuilder.append(level3).append(" ");
                    if (!level4L.isEmpty())
                        groupBuilder.append(level4L);

                    result.put("group", groupBuilder.toString().trim());
                }
            }

        } catch (Exception e) {
            System.err.println("V-World API 호출 중 오류 발생: " + e.getMessage());
        }
        return result;
    }
}
