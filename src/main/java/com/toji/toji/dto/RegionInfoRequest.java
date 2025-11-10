package com.toji.toji.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegionInfoRequest {

    @NotBlank
    @Size(max = 255)
    private String address;

    @Size(max = 255)
    private String roadAddress;

    @Size(max = 255)
    private String jibunAddress;

    @Size(max = 30)
    private String pnu;

    @Size(max = 50)
    private String sido;

    @Size(max = 50)
    private String sigungu;

    @Size(max = 50)
    private String eupmyeondong;

    @Size(max = 50)
    private String ri;

    private Double latitude;
    private Double longitude;

    @Size(max = 500)
    private String memo;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRoadAddress() {
        return roadAddress;
    }

    public void setRoadAddress(String roadAddress) {
        this.roadAddress = roadAddress;
    }

    public String getJibunAddress() {
        return jibunAddress;
    }

    public void setJibunAddress(String jibunAddress) {
        this.jibunAddress = jibunAddress;
    }

    public String getPnu() {
        return pnu;
    }

    public void setPnu(String pnu) {
        this.pnu = pnu;
    }

    public String getSido() {
        return sido;
    }

    public void setSido(String sido) {
        this.sido = sido;
    }

    public String getSigungu() {
        return sigungu;
    }

    public void setSigungu(String sigungu) {
        this.sigungu = sigungu;
    }

    public String getEupmyeondong() {
        return eupmyeondong;
    }

    public void setEupmyeondong(String eupmyeondong) {
        this.eupmyeondong = eupmyeondong;
    }

    public String getRi() {
        return ri;
    }

    public void setRi(String ri) {
        this.ri = ri;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }
}

