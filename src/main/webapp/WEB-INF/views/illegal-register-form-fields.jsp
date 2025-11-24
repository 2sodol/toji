<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <% String todayIsoDate=java.time.LocalDate.now().toString(); %>

        <section class="illegal-register-form__section">
            <!-- 히든 필드: PNU 및 좌표 정보 -->
            <input id="${param.prefix}lndsUnqNo" name="lndsUnqNo" />
            <input id="${param.prefix}gpsLgtd" name="gpsLgtd" />
            <input id="${param.prefix}gpsLttd" name="gpsLttd" />

            <p class="illegal-register-form__section-title">
                기본정보<span class="illegal-register-form__required">*</span>
            </p>
            <div class="illegal-register-grid illegal-register-grid--cols-3">
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}hdqrNm">본부</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}hdqrNm" value="${loginUserDept}"
                        maxlength="100" required readonly />
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}mtnofNm">지사</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}mtnofNm" maxlength="100" required readonly />
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}routeCd">노선</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}routeCd" maxlength="100" required readonly />
                </div>
            </div>
            <div class="illegal-register-grid illegal-register-grid--cols-3">
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}drveDrctCd">주행방향</label>
                    <select class="illegal-register-select" id="${param.prefix}drveDrctCd" required disabled>
                        <option value="" disabled selected>선택하세요</option>
                        <option value="UP">상행</option>
                        <option value="DOWN">하행</option>
                        <option value="BOTH">양방향</option>
                    </select>
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}routeDstnc">이정 (km)</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}routeDstnc" placeholder="예: 123.5km"
                        maxlength="50" readonly />
                </div>
                <div class="illegal-register-field">
                    <span class="illegal-register-label">구분</span>
                    <div class="illegal-register-segmented" role="radiogroup" aria-label="구분">
                        <label class="illegal-register-segmented__option illegal-register-segmented__option_left">
                            <input type="radio" name="${param.prefix}strcClssCd" value="GENERAL" checked />
                            <span>일반</span>
                        </label>
                        <label class="illegal-register-segmented__option illegal-register-segmented__option_right">
                            <input type="radio" name="${param.prefix}strcClssCd" value="BRIDGE" />
                            <span>교량</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="illegal-register-grid illegal-register-grid--cols-2">
                <div class="illegal-register-field illegal-register-field--full">
                    <label class="illegal-register-label" for="${param.prefix}lndsLdnoAddr">세부위치(주소)</label>
                    <div class="illegal-register-input-group">
                        <input type="text" class="illegal-register-input" id="${param.prefix}lndsLdnoAddr" placeholder="주소를 검색하세요"
                            maxlength="255" readonly />
                    </div>
                </div>
            </div>
        </section>

        <section class="illegal-register-form__section">
            <p class="illegal-register-form__section-title">
                발생 및 관계자 정보
            </p>
            <div class="illegal-register-grid illegal-register-grid--cols-4 illegal-register-grid--single-row">
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}ocrnDates">발생일자</label>
                    <input type="date" class="illegal-register-input" id="${param.prefix}ocrnDates" value="<%= todayIsoDate %>"
                        required />
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}prchEmno">담당자</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}prchEmno" value="${loginUserName}"
                        maxlength="100" required />
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}trnrNm">행위자명</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}trnrNm" maxlength="100" required />
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}rltrNm">관련자</label>
                    <input type="text" class="illegal-register-input" id="${param.prefix}rltrNm" maxlength="100" />
                </div>
            </div>
            <div class="illegal-register-grid illegal-register-grid--cols-2">
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}trnrAddr">행위자 주소</label>
                    <div class="illegal-register-input-group">
                        <input type="text" class="illegal-register-input" id="${param.prefix}trnrAddr" placeholder="주소를 검색하세요"
                            maxlength="255" readonly />
                        <button class="illegal-register-button illegal-register-button--outline" type="button"
                            data-register-address-target="actor">
                            검색
                        </button>
                    </div>
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}rltrAddr">관련자 주소</label>
                    <div class="illegal-register-input-group">
                        <input type="text" class="illegal-register-input" id="${param.prefix}rltrAddr" placeholder="주소를 검색하세요"
                            maxlength="255" readonly />
                        <button class="illegal-register-button illegal-register-button--outline" type="button"
                            data-register-address-target="related">
                            검색
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="illegal-register-form__section">
            <p class="illegal-register-form__section-title">점유 및 조치 정보</p>
            <div class="illegal-register-grid illegal-register-grid--cols-3">
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}ilglPssrt">점유율 (%)</label>
                    <input type="number" class="illegal-register-input" id="${param.prefix}ilglPssrt" placeholder="예: 50.5" step="0.1"
                        min="0" max="100" />
                </div>
                <div class="illegal-register-field">
                    <label class="illegal-register-label" for="${param.prefix}ilglPssnSqms">점유면적 (㎡)</label>
                    <input type="number" class="illegal-register-input" id="${param.prefix}ilglPssnSqms" placeholder="예: 10.5"
                        step="0.1" min="0" />
                </div>
                <div class="illegal-register-field">
                    <span class="illegal-register-label">조치상태</span>
                    <div class="illegal-register-segmented" role="radiogroup" aria-label="조치상태">
                        <label class="illegal-register-segmented__option illegal-register-segmented__option_left">
                            <input type="radio" name="${param.prefix}ilglPrvuActnStatVal" value="COMPLETED" />
                            <span>조치완료</span>
                        </label>
                        <label class="illegal-register-segmented__option illegal-register-segmented__option_right">
                            <input type="radio" name="${param.prefix}ilglPrvuActnStatVal" value="IN_PROGRESS" checked />
                            <span>조치중</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="illegal-register-history">
                <div class="illegal-register-history__header">
                    <div>
                        <p class="illegal-register-label illegal-register-history__title">
                            조치 이력
                        </p>
                        <small class="illegal-register-history__description">필요 시 여러 건을 추가할 수 있습니다.</small>
                    </div>
                    <button type="button"
                        class="illegal-register-button illegal-register-button--outline illegal-register-button--sm"
                        id="${param.prefix}addActionHistoryBtn">
                        추가
                    </button>
                </div>
                <div id="${param.prefix}actionHistoryList" class="illegal-register-history__list">
                    <div class="illegal-register-history__item">
                        <div class="illegal-register-history__date">
                            <input type="date" class="illegal-register-input illegal-register-history__date-input"
                                name="actnDttm" />
                        </div>
                        <div class="illegal-register-history__desc">
                            <input type="text" class="illegal-register-input illegal-register-history__desc-input"
                                name="actnCtnt" placeholder="예: 구두주의, 경고 등" maxlength="500" />
                        </div>
                        <div class="illegal-register-history__actions"></div>
                    </div>
                </div>
            </div>
        </section>

        <section class="illegal-register-form__section">
            <p class="illegal-register-form__section-title">사진 등록</p>

            <!-- 이미지 파일 등록 섹션 (날짜와 이미지 매핑) -->
            <div class="illegal-register-image-section">
                <div class="illegal-register-image-section__header">
                    <div>
                        <small class="illegal-register-file-upload__description">
                            날짜와 함께 이미지를 등록하세요. 여러 개 추가할 수 있습니다.
                        </small>
                    </div>
                    <button type="button"
                        class="illegal-register-button illegal-register-button--outline illegal-register-button--sm"
                        id="${param.prefix}addImageBtn">
                        <span class="illegal-register-button__text">추가</span>
                    </button>
                </div>
                <div id="${param.prefix}imageList" class="illegal-register-image-list">
                    <!-- 이미지 아이템들이 동적으로 추가됩니다 -->
                </div>
            </div>
        </section>