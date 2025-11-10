<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<div class="modal fade" id="registerModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">선택 지역 정보 등록</h5>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="registerForm">
                    <div id="register-alert" class="alert" role="alert" style="display: none;"></div>

                    <p class="form-section-title">기본 정보</p>
                    <div class="form-group">
                        <label for="addressInput">주소</label>
                        <input type="text" class="form-control readonly-field" id="addressInput" name="address" readonly>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="roadAddressInput">도로명 주소</label>
                            <input type="text" class="form-control readonly-field" id="roadAddressInput" name="roadAddress" readonly>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="jibunAddressInput">지번 주소</label>
                            <input type="text" class="form-control readonly-field" id="jibunAddressInput" name="jibunAddress" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="pnuInput">PNU</label>
                            <input type="text" class="form-control readonly-field" id="pnuInput" name="pnu" readonly>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="riInput">리/통</label>
                            <input type="text" class="form-control readonly-field" id="riInput" name="ri" readonly>
                        </div>
                    </div>

                    <p class="form-section-title mt-4">행정 구역</p>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label for="sidoInput">시/도</label>
                            <input type="text" class="form-control readonly-field" id="sidoInput" name="sido" readonly>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="sigunguInput">시/군/구</label>
                            <input type="text" class="form-control readonly-field" id="sigunguInput" name="sigungu" readonly>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="eupmyeondongInput">읍/면/동</label>
                            <input type="text" class="form-control readonly-field" id="eupmyeondongInput" name="eupmyeondong" readonly>
                        </div>
                    </div>

                    <p class="form-section-title mt-4">좌표 정보</p>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="latitudeInput">위도 (WGS84)</label>
                            <input type="text" class="form-control readonly-field" id="latitudeInput" name="latitude" readonly>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="longitudeInput">경도 (WGS84)</label>
                            <input type="text" class="form-control readonly-field" id="longitudeInput" name="longitude" readonly>
                        </div>
                    </div>

                    <p class="form-section-title mt-4">추가 메모</p>
                    <div class="form-group">
                        <label for="memoInput">메모</label>
                        <textarea class="form-control" id="memoInput" name="memo" rows="3" placeholder="추가 정보를 입력하세요"></textarea>
                    </div>
                </form>

                <div class="mt-4">
                    <p class="form-section-title">최근 저장된 지역</p>
                    <div class="recent-table-wrapper">
                        <table class="table table-sm table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th scope="col">주소</th>
                                    <th scope="col">행정 구역</th>
                                    <th scope="col">좌표</th>
                                    <th scope="col">등록일</th>
                                </tr>
                            </thead>
                            <tbody id="recentRegionBody">
                                <tr>
                                    <td colspan="4" class="text-center text-muted">등록된 지역이 없습니다.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
                <button type="button" id="submit-btn" class="btn btn-primary">저장하기</button>
            </div>
        </div>
    </div>
</div>

