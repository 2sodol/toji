<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% String todayIsoDate = java.time.LocalDate.now().toString(); %>
<div class="modal fade illegal-occupancy-modal" id="registerModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">불법점용 용지 등록</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="registerForm" class="illegal-occupancy-form" novalidate>
                    <div id="register-alert" class="alert illegal-occupancy-alert" role="alert" style="display: none;"></div>

                    <div class="form-section">
                        <p class="form-section-title illegal-occupancy-section-title mb-3">기본정보<span class="text-danger">*</span></p>
                        <div class="form-row">
                            <div class="form-group col-md-4">
                                <label class="illegal-occupancy-label" for="headOfficeInput">본부</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="headOfficeInput" maxlength="100" required>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="illegal-occupancy-label" for="branchOfficeInput">지사</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="branchOfficeInput" maxlength="100" required>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="illegal-occupancy-label" for="routeNameInput">노선</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="routeNameInput" maxlength="100" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-4">
                                <label class="illegal-occupancy-label" for="drivingDirectionSelect">주행방향</label>
                                <select class="form-control illegal-occupancy-control" id="drivingDirectionSelect" required>
                                    <option value="" disabled selected>선택하세요</option>
                                    <option value="UP">상행</option>
                                    <option value="DOWN">하행</option>
                                    <option value="BOTH">양방향</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="illegal-occupancy-label" for="distanceMarkInput">이정</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="distanceMarkInput" placeholder="예: 123.5km" maxlength="50">
                            </div>
                            <div class="form-group col-md-4">
                                <label class="illegal-occupancy-label">구분</label>
                                <div class="btn-group btn-group-toggle category-toggle d-flex" data-toggle="buttons">
                                    <label class="btn btn-outline-primary illegal-occupancy-toggle-option active flex-fill">
                                        <input type="radio" name="categoryOptions" value="GENERAL" autocomplete="off" checked> 일반
                                    </label>
                                    <label class="btn btn-outline-primary illegal-occupancy-toggle-option flex-fill">
                                        <input type="radio" name="categoryOptions" value="BRIDGE" autocomplete="off"> 교량
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-12 col-md-6">
                                <label class="illegal-occupancy-label" for="detailAddressInput">세부위치(주소)</label>
                                <div class="input-group">
                                    <input type="text" class="form-control illegal-occupancy-control" id="detailAddressInput" placeholder="주소를 검색하세요" maxlength="255" readonly>
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" type="button" id="detailAddressSearchBtn">검색</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="my-4">

                    <div class="form-section mt-4">
                        <p class="form-section-title illegal-occupancy-section-title mb-3">발생 및 관계자 정보</p>
                        <div class="form-row">
                            <div class="form-group col-md-3">
                                <label class="illegal-occupancy-label" for="incidentDateInput">발생일자</label>
                                <input type="date" class="form-control illegal-occupancy-control" id="incidentDateInput" required value="<%= todayIsoDate %>">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="illegal-occupancy-label" for="managerNameInput">담당자</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="managerNameInput" maxlength="100" required>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="illegal-occupancy-label" for="actorNameInput">행위자명</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="actorNameInput" maxlength="100" required>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="illegal-occupancy-label" for="relatedPersonInput">관련자</label>
                                <input type="text" class="form-control illegal-occupancy-control" id="relatedPersonInput" maxlength="100">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label class="illegal-occupancy-label" for="actorAddressInput">행위자 주소</label>
                                <div class="input-group">
                                    <input type="text" class="form-control illegal-occupancy-control" id="actorAddressInput" placeholder="주소를 검색하세요" maxlength="255" readonly>
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" type="button" data-address-target="actor">검색</button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="illegal-occupancy-label" for="relatedAddressInput">관련자 주소</label>
                                <div class="input-group">
                                    <input type="text" class="form-control illegal-occupancy-control" id="relatedAddressInput" placeholder="주소를 검색하세요" maxlength="255" readonly>
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" type="button" data-address-target="related">검색</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="my-4">

                    <div class="form-section mt-4">
                        <p class="form-section-title illegal-occupancy-section-title mb-3">점유 및 조치 정보</p>
                        <div class="form-row">
                            <div class="form-group col-12 col-md-4">
                                <label class="illegal-occupancy-label" for="occupancyRateInput">점유율 (%)</label>
                                <input type="number" class="form-control illegal-occupancy-control" id="occupancyRateInput" placeholder="예: 50.5" step="0.1" min="0" max="100">
                            </div>
                            <div class="form-group col-12 col-md-4">
                                <label class="illegal-occupancy-label" for="occupancyAreaInput">점유면적 (㎡)</label>
                                <input type="number" class="form-control illegal-occupancy-control" id="occupancyAreaInput" placeholder="예: 10.5" step="0.1" min="0">
                            </div>
                            <div class="form-group col-12 col-md-4">
                                <label class="d-block illegal-occupancy-label">조치상태</label>
                                <div class="btn-group btn-group-toggle action-status-toggle d-flex" data-toggle="buttons">
                                    <label class="btn btn-outline-primary illegal-occupancy-toggle-option active flex-fill">
                                        <input type="radio" name="actionStatusOptions" value="COMPLETED" autocomplete="off"> 조치완료
                                    </label>
                                    <label class="btn btn-outline-primary illegal-occupancy-toggle-option flex-fill">
                                        <input type="radio" name="actionStatusOptions" value="IN_PROGRESS" autocomplete="off" checked> 조치중
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="action-history-group mt-3">
                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 action-history-header">
                                <div>
                                    <p class="illegal-occupancy-label mb-1">조치 이력</p>
                                    <small class="text-muted">필요 시 여러 건을 추가할 수 있습니다.</small>
                                </div>
                                <button type="button" class="btn btn-primary btn-sm action-history-add-btn" id="addActionHistoryBtn">
                                    조치사항 추가
                                </button>
                            </div>
                            <div id="actionHistoryList" class="action-history-list">
                                <div class="action-history-item form-row align-items-center">
                                    <div class="form-group col-md-2 mb-2 mb-md-0">
                                        <input type="date" class="form-control illegal-occupancy-control action-history-date">
                                    </div>
                                    <div class="form-group col-md-9 mb-2 mb-md-0">
                                        <input type="text" class="form-control illegal-occupancy-control action-history-desc" placeholder="예: 구두주의, 경고 등" maxlength="500">
                                    </div>
                                    <div class="form-group col-md-1 text-right mb-0 initial-remove-placeholder"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="my-4">

                    <div class="form-section mt-4">
                        <p class="form-section-title illegal-occupancy-section-title mb-3">사진 등록</p>
                        <div class="form-row align-items-end">
                            <div class="form-group col-md-3">
                                <label class="illegal-occupancy-label" for="photoRegisteredAtInput">사진 등록 <span class="text-danger">*</span></label>
                                <input type="date" class="form-control illegal-occupancy-control" id="photoRegisteredAtInput" required>
                            </div>
                            <div class="form-group col-md-9">
                                <label class="d-block illegal-occupancy-label">사진 파일</label>
                                <div class="d-flex align-items-center">
                                    <button type="button" class="btn btn-outline-secondary mr-3" id="photoUploadBtn">
                                        <i class="fas fa-camera mr-1"></i> 사진 추가
                                    </button>
                                    <div class="flex-grow-1">
                                        <ul class="list-unstyled mb-0" id="photoFileList">
                                            <li class="text-muted" id="photoFilePlaceholder">선택된 파일이 없습니다.</li>
                                        </ul>
                                    </div>
                                </div>
                                <input type="file" id="photoFileInput" accept="image/*" multiple hidden>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
                <button type="button" id="submit-btn" class="btn btn-primary illegal-occupancy-submit">저장</button>
            </div>
        </div>
    </div>
</div>