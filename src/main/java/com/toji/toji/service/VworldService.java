package com.toji.toji.service;

import java.util.Map;

public interface VworldService {
    /**
     * 좌표를 주소로 변환
     * 
     * @param lat 위도
     * @param lon 경도
     * @return Map<String, String> (key: "full", "group")
     */
    Map<String, String> latLonToAddress(double lat, double lon);
}
