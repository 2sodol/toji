package com.toji.toji.domain;

import java.time.LocalDateTime;

public class RegionInfo {

  private Long id;
  private String address;
  private String roadAddress;
  private String jibunAddress;
  private String pnu;
  private String sido;
  private String sigungu;
  private String eupmyeondong;
  private String ri;
  private Double latitude;
  private Double longitude;
  private String memo;
  private LocalDateTime createdAt;

  public RegionInfo() {
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

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

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
