<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %> <%String
todayIsoDate = java.time.LocalDate.now().toString(); %>
<div
  id="illegalRegisterModal"
  class="illegal-register-modal"
  aria-hidden="true"
>
  <div
    class="illegal-register-modal__window"
    role="dialog"
    aria-modal="true"
    aria-labelledby="illegalRegisterModalTitle"
  >
    <header class="illegal-register-modal__header">
      <h2 id="illegalRegisterModalTitle" class="illegal-register-modal__title">
        불법점용 용지 등록
      </h2>
      <button
        type="button"
        class="illegal-register-modal__close-button"
        data-register-modal-close
        aria-label="닫기"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </header>
    <div class="illegal-register-modal__body">
      <form id="illegalRegisterForm" class="illegal-register-form" novalidate>
        <section class="illegal-register-form__section">
          <!-- 히든 필드: PNU 및 좌표 정보 -->
          <input id="lndsUnqNo" name="lndsUnqNo" />
          <input  id="gpsLgtd" name="gpsLgtd" />
          <input id="gpsLttd" name="gpsLttd" />
          
          <p class="illegal-register-form__section-title">
            기본정보<span class="illegal-register-form__required">*</span>
          </p>
          <div class="illegal-register-grid illegal-register-grid--cols-3">
            <div class="illegal-register-field">
              <label class="illegal-register-label" for="hdqrNm"
                >본부</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="hdqrNm"
                value="${loginUserDept}"
                maxlength="100"
                required
                readonly
              />
            </div>
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="mtnofNm"
                >지사</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="mtnofNm"
                maxlength="100"
                required
                readonly
              />
            </div>
            <div class="illegal-register-field">
              <label class="illegal-register-label" for="routeCd"
                >노선</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="routeCd"
                maxlength="100"
                required
                readonly
              />
            </div>
          </div>
          <div class="illegal-register-grid illegal-register-grid--cols-3">
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="drveDrctCd"
                >주행방향</label
              >
              <select
                class="illegal-register-select"
                id="drveDrctCd"
                required
                disabled
              >
                <option value="" disabled selected>선택하세요</option>
                <option value="UP">상행</option>
                <option value="DOWN">하행</option>
                <option value="BOTH">양방향</option>
              </select>
            </div>
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="routeDstnc"
                >이정</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="routeDstnc"
                placeholder="예: 123.5km"
                maxlength="50"
                readonly
              />
            </div>
            <div class="illegal-register-field">
              <span class="illegal-register-label">구분</span>
              <div
                class="illegal-register-segmented"
                role="radiogroup"
                aria-label="구분"
              >
                <label
                  class="illegal-register-segmented__option illegal-register-segmented__option_left"
                >
                  <input
                    type="radio"
                    name="strcClssCd"
                    value="GENERAL"
                    checked
                  />
                  <span>일반</span>
                </label>
                <label
                  class="illegal-register-segmented__option illegal-register-segmented__option_right"
                >
                  <input type="radio" name="strcClssCd" value="BRIDGE" />
                  <span>교량</span>
                </label>
              </div>
            </div>
          </div>
          <div class="illegal-register-grid illegal-register-grid--cols-2">
            <div class="illegal-register-field illegal-register-field--full">
              <label
                class="illegal-register-label"
                for="lndsLdnoAddr"
                >세부위치(주소)</label
              >
              <div class="illegal-register-input-group">
                <input
                  type="text"
                  class="illegal-register-input"
                  id="lndsLdnoAddr"
                  placeholder="주소를 검색하세요"
                  maxlength="255"
                  readonly
                />
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
              <label
                class="illegal-register-label"
                for="ocrnDates"
                >발생일자</label
              >
              <input
                type="date"
                class="illegal-register-input"
                id="ocrnDates"
                value="<%= todayIsoDate %>"
                required
              />
            </div>
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="prchEmno"
                >담당자</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="prchEmno"
                value="${loginUserName}"
                maxlength="100"
                required
              />
            </div>
            <div class="illegal-register-field">
              <label class="illegal-register-label" for="trnrNm"
                >행위자명</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="trnrNm"
                maxlength="100"
                required
              />
            </div>
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="rltrNm"
                >관련자</label
              >
              <input
                type="text"
                class="illegal-register-input"
                id="rltrNm"
                maxlength="100"
              />
            </div>
          </div>
          <div class="illegal-register-grid illegal-register-grid--cols-2">
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="trnrAddr"
                >행위자 주소</label
              >
              <div class="illegal-register-input-group">
                <input
                  type="text"
                  class="illegal-register-input"
                  id="trnrAddr"
                  placeholder="주소를 검색하세요"
                  maxlength="255"
                  readonly
                />
                <button
                  class="illegal-register-button illegal-register-button--ghost"
                  type="button"
                  data-register-address-target="actor"
                >
                  검색
                </button>
              </div>
            </div>
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="rltrAddr"
                >관련자 주소</label
              >
              <div class="illegal-register-input-group">
                <input
                  type="text"
                  class="illegal-register-input"
                  id="rltrAddr"
                  placeholder="주소를 검색하세요"
                  maxlength="255"
                  readonly
                />
                <button
                  class="illegal-register-button illegal-register-button--ghost"
                  type="button"
                  data-register-address-target="related"
                >
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
              <label
                class="illegal-register-label"
                for="ilglPssrt"
                >점유율 (%)</label
              >
              <input
                type="number"
                class="illegal-register-input"
                id="ilglPssrt"
                placeholder="예: 50.5"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div class="illegal-register-field">
              <label
                class="illegal-register-label"
                for="ilglPssnSqms"
                >점유면적 (㎡)</label
              >
              <input
                type="number"
                class="illegal-register-input"
                id="ilglPssnSqms"
                placeholder="예: 10.5"
                step="0.1"
                min="0"
              />
            </div>
            <div class="illegal-register-field">
              <span class="illegal-register-label">조치상태</span>
              <div
                class="illegal-register-segmented"
                role="radiogroup"
                aria-label="조치상태"
              >
                <label
                  class="illegal-register-segmented__option illegal-register-segmented__option_left"
                >
                  <input
                    type="radio"
                    name="ilglPrvuActnStatVal"
                    value="COMPLETED"
                  />
                  <span>조치완료</span>
                </label>
                <label
                  class="illegal-register-segmented__option illegal-register-segmented__option_right"
                >
                  <input
                    type="radio"
                    name="ilglPrvuActnStatVal"
                    value="IN_PROGRESS"
                    checked
                  />
                  <span>조치중</span>
                </label>
              </div>
            </div>
          </div>

          <div class="illegal-register-history">
            <div class="illegal-register-history__header">
              <div>
                <p
                  class="illegal-register-label illegal-register-history__title"
                >
                  조치 이력
                </p>
                <small class="illegal-register-history__description"
                  >필요 시 여러 건을 추가할 수 있습니다.</small
                >
              </div>
              <button
                type="button"
                class="illegal-register-button illegal-register-button--primary illegal-register-button--sm"
                id="addActionHistoryBtn"
              >
                조치사항 추가
              </button>
            </div>
            <div
              id="actionHistoryList"
              class="illegal-register-history__list"
            >
              <div class="illegal-register-history__item">
                <div class="illegal-register-history__date">
                  <input
                    type="date"
                    class="illegal-register-input illegal-register-history__date-input"
                    name="actnDttm"
                  />
                </div>
                <div class="illegal-register-history__desc">
                  <input
                    type="text"
                    class="illegal-register-input illegal-register-history__desc-input"
                    name="actnCtnt"
                    placeholder="예: 구두주의, 경고 등"
                    maxlength="500"
                  />
                </div>
                <div class="illegal-register-history__actions"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="illegal-register-form__section">
          <p class="illegal-register-form__section-title">파일 등록</p>
          
          <!-- 이미지 파일 (갤러리용 및 레이어용으로 공통 사용) -->
          <div class="illegal-register-file-upload">
            <div class="illegal-register-file-upload__header">
              <label class="illegal-register-label">
                이미지 파일
                <span class="illegal-register-file-upload__format">(TIF 또는 PNG 파일)</span>
              </label>
              <small class="illegal-register-file-upload__description">
                조회 모달 갤러리 및 레이어 표시에 사용됩니다.
              </small>
            </div>
            <div class="illegal-register-file-upload__content">
              <div class="illegal-register-grid illegal-register-grid--cols-2">
                <div class="illegal-register-field">
                  <label
                    class="illegal-register-label"
                    for="imageOcrnDates"
                  >
                    이미지 등록일
                    <span class="illegal-register-form__required">*</span>
                  </label>
                  <input
                    type="date"
                    class="illegal-register-input"
                    id="imageOcrnDates"
                    required
                  />
                </div>
                <div class="illegal-register-field">
                  <label class="illegal-register-label">
                    파일 선택
                  </label>
                  <button
                    type="button"
                    class="illegal-register-button illegal-register-button--outline"
                    data-file-upload-type="image"
                    id="imageFileUploadBtn"
                  >
                    <i class="fas fa-upload" aria-hidden="true"></i>
                    <span class="illegal-register-button__text">이미지 파일 선택</span>
                  </button>
                </div>
              </div>
              <div class="illegal-register-file-upload__preview" id="imageFilePreview">
                <div class="illegal-register-file-upload__placeholder">
                  선택된 파일이 없습니다.
                </div>
              </div>
              <input
                type="file"
                id="imageFileInput"
                accept=".tif,.tiff,.png"
                data-file-type="image"
                hidden
              />
            </div>
          </div>

          <!-- KML 파일 -->
          <div class="illegal-register-file-upload">
            <div class="illegal-register-file-upload__header">
              <label class="illegal-register-label">
                KML 파일
                <span class="illegal-register-file-upload__format">(KML 파일)</span>
              </label>
            </div>
            <div class="illegal-register-file-upload__content">
              <div class="illegal-register-grid illegal-register-grid--cols-2">
                <div class="illegal-register-field">
                  <label class="illegal-register-label">
                    파일 선택
                  </label>
                  <button
                    type="button"
                    class="illegal-register-button illegal-register-button--outline"
                    data-file-upload-type="kml"
                    id="kmlFileUploadBtn"
                  >
                    <i class="fas fa-upload" aria-hidden="true"></i>
                    <span class="illegal-register-button__text">KML 파일 선택</span>
                  </button>
                </div>
              </div>
              <div class="illegal-register-file-upload__preview" id="kmlFilePreview">
                <div class="illegal-register-file-upload__placeholder">
                  선택된 파일이 없습니다.
                </div>
              </div>
              <input
                type="file"
                id="kmlFileInput"
                accept=".kml"
                data-file-type="kml"
                hidden
              />
            </div>
          </div>
        </section>
      </form>
    </div>
    <footer class="illegal-register-modal__footer">
      <button
        type="button"
        class="illegal-register-button illegal-register-button--ghost"
        data-register-modal-close
      >
        닫기
      </button>
      <button
        type="button"
        id="illegalRegisterSubmitBtn"
        class="illegal-register-button illegal-register-button--primary"
      >
        저장
      </button>
    </footer>
  </div>
</div>

<style>
  .illegal-register-modal {
    position: fixed;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background-color: rgba(17, 24, 39, 0.55);
    z-index: 1200;
    transition: opacity 0.25s ease;
    opacity: 0;
  }

  .illegal-register-modal.is-open {
    display: flex;
    opacity: 1;
  }

  .illegal-register-modal__window {
    width: min(1080px, 100%);
    max-height: calc(100vh - 64px);
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 55px rgba(15, 23, 42, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .illegal-register-modal__header,
  .illegal-register-modal__footer {
    padding: 20px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .illegal-register-modal__header {
    border-bottom: 1px solid #e5e7eb;
  }

  .illegal-register-modal__footer {
    border-top: 1px solid #e5e7eb;
    justify-content: flex-end;
    gap: 12px;
  }

  .illegal-register-modal__title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #111827;
  }

  .illegal-register-modal__close-button {
    all: unset;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 24px;
    color: #6b7280;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .illegal-register-modal__close-button i {
    display: block;
    line-height: 1;
  }

  .illegal-register-modal__close-button:hover,
  .illegal-register-modal__close-button:focus-visible {
    background-color: rgba(107, 114, 128, 0.15);
    color: #374151;
  }

  .illegal-register-modal__body {
    padding: 24px 28px 12px;
    overflow-y: auto;
  }

  .illegal-register-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .illegal-register-form__section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .illegal-register-form__section + .illegal-register-form__section {
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
  }

  .illegal-register-form__section-title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .illegal-register-form__required {
    color: #dc2626;
    font-weight: 600;
  }

  .illegal-register-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
  }

  .illegal-register-grid--single-row {
    flex-wrap: nowrap;
  }

  .illegal-register-field {
    flex: 1 1 calc(33.333% - 12px);
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .illegal-register-grid--single-row .illegal-register-field {
    flex: 1 1 0;
    min-width: 0;
  }

  .illegal-register-field--wide {
    flex: 1 1 calc(66.666% - 12px);
  }

  .illegal-register-field--full {
    flex: 1 1 100%;
  }

  .illegal-register-label {
    font-size: 15px;
    font-weight: 500;
    color: #374151;
    display: block;
    margin: 0;
  }

  .illegal-register-input,
  .illegal-register-select {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 15px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background-color: #ffffff;
    color: #111827;
  }

  .illegal-register-input:focus,
  .illegal-register-select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .illegal-register-input[readonly],
  .illegal-register-select[disabled] {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  .illegal-register-input-group {
    display: flex;
    gap: 8px;
  }

  .illegal-register-segmented {
    display: flex;
  }

  .illegal-register-segmented__option {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    cursor: pointer;
    font-size: 15px;
    color: #4b5563;
  }

  .illegal-register-segmented__option input {
    position: absolute;
    opacity: 0;
    inset: 0;
    cursor: pointer;
  }

  .illegal-register-segmented__option span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10px 0;
    pointer-events: none;
    transition: background-color 0.2s ease, color 0.2s ease,
      border-color 0.2s ease;
  }

  .illegal-register-segmented__option_left span {
    border: 1px solid #d1d5db;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .illegal-register-segmented__option_right span {
    border: 1px solid #d1d5db;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .illegal-register-segmented__option input:checked + span {
    background-color: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    font-weight: 600;
  }

  .illegal-register-segmented__option:hover span {
    background-color: rgba(37, 99, 235, 0.08);
    border-color: #2563eb;
  }

  .illegal-register-button {
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    padding: 10px 18px;
    min-width: 70px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .illegal-register-button--primary {
    background-color: #2563eb;
    color: #ffffff;
  }

  .illegal-register-button--primary:hover,
  .illegal-register-button--primary:focus-visible {
    background-color: #1d4ed8;
  }

  .illegal-register-button--outline {
    background-color: #ffffff;
    color: #1f2937;
    border: 1px solid #d1d5db;
  }

  .illegal-register-button--outline:hover,
  .illegal-register-button--outline:focus-visible {
    border-color: #2563eb;
    color: #2563eb;
  }

  .illegal-register-button--ghost {
    background-color: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
  }

  .illegal-register-button--ghost:hover,
  .illegal-register-button--ghost:focus-visible {
    color: #1f2937;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  #lndsLdnoAddrSearchBtn,
  [data-register-address-target] {
    background-color: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
  }

  #lndsLdnoAddrSearchBtn:hover,
  #lndsLdnoAddrSearchBtn:focus-visible,
  [data-register-address-target]:hover,
  [data-register-address-target]:focus-visible {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
    color: #ffffff;
  }

  .illegal-register-button--sm {
    padding: 8px 14px;
    font-size: 14px;
  }

  .illegal-register-history {
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: none;
    border-radius: 0;
    padding: 0;
    background: transparent;
  }

  .illegal-register-history__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .illegal-register-history__title {
    margin: 0 0 4px;
  }

  .illegal-register-history__description {
    color: #6b7280;
  }

  .illegal-register-history__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .illegal-register-history__item {
    display: grid;
    grid-template-columns: 140px 1fr auto;
    gap: 12px;
    align-items: center;
  }

  .illegal-register-history__actions {
    display: flex;
    justify-content: flex-end;
    width: 32px;
  }

  .illegal-register-history__remove {
    background-color: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.18);
    color: #dc2626;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    font-size: 16px;
    transition: background-color 0.2s ease, color 0.2s ease,
      box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .illegal-register-history__remove i {
    pointer-events: none;
  }

  .illegal-register-history__remove:hover,
  .illegal-register-history__remove:focus-visible {
    background-color: rgba(220, 38, 38, 0.18);
    border-color: rgba(220, 38, 38, 0.28);
    color: #b91c1c;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
  }

  .illegal-register-photo {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px;
  }

  .illegal-register-photo__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .illegal-register-photo__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-color: #ffffff;
  }

  .illegal-register-photo__name {
    flex: 1 1 auto;
    color: #111827;
    word-break: break-all;
  }

  .illegal-register-photo__placeholder {
    color: #9ca3af;
  }

  .illegal-register-photo__list-wrapper {
    flex: 1 1 240px;
  }

  .illegal-register-photo__remove {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }

  .illegal-register-photo__remove:hover,
  .illegal-register-photo__remove:focus-visible {
    text-decoration: underline;
  }

  .illegal-register-button__text {
    font-weight: 600;
  }

  .illegal-register-button i {
    margin-right: 6px;
  }

  .illegal-register-file-upload {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-color: #f9fafb;
  }

  .illegal-register-file-upload + .illegal-register-file-upload {
    margin-top: 16px;
  }

  .illegal-register-file-upload__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .illegal-register-file-upload__format {
    font-size: 13px;
    font-weight: 400;
    color: #6b7280;
  }

  .illegal-register-file-upload__description {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }

  .illegal-register-file-upload__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .illegal-register-file-upload__preview {
    min-height: 60px;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .illegal-register-file-upload__placeholder {
    color: #9ca3af;
    font-size: 14px;
  }

  .illegal-register-file-upload__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background-color: #ffffff;
  }

  .illegal-register-file-upload__item-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .illegal-register-file-upload__item-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background-color: #f3f4f6;
    color: #6b7280;
    font-size: 18px;
    flex-shrink: 0;
  }

  .illegal-register-file-upload__item-icon--image {
    background-color: #dbeafe;
    color: #2563eb;
  }

  .illegal-register-file-upload__item-icon--kml {
    background-color: #e9d5ff;
    color: #9333ea;
  }

  .illegal-register-file-upload__item-details {
    flex: 1 1 auto;
    min-width: 0;
  }

  .illegal-register-file-upload__item-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    word-break: break-all;
    margin-bottom: 4px;
  }

  .illegal-register-file-upload__item-size {
    font-size: 12px;
    color: #6b7280;
  }

  .illegal-register-file-upload__item-preview {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .illegal-register-file-upload__item-remove {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    font-size: 16px;
    transition: background-color 0.2s ease, color 0.2s ease;
    flex-shrink: 0;
  }

  .illegal-register-file-upload__item-remove:hover,
  .illegal-register-file-upload__item-remove:focus-visible {
    background-color: rgba(220, 38, 38, 0.1);
    color: #b91c1c;
  }

  body.illegal-register-modal-open {
    overflow: hidden;
  }
</style>

<script>
  (function (window, $) {
    var $modal = $("#illegalRegisterModal");
    if (!$modal.length) {
      return;
    }

    var $body = $("body");
    var $closeButtons = $modal.find("[data-register-modal-close]");

    function triggerEvent(eventName) {
      $modal.trigger($.Event(eventName, { bubbles: true }));
    }

    function openModal() {
      if ($modal.hasClass("is-open")) {
        return;
      }
      $modal.addClass("is-open").attr("aria-hidden", "false");
      $body.addClass("illegal-register-modal-open");
      triggerEvent("illegalRegisterModal:open");
    }

    function closeModal() {
      if (!$modal.hasClass("is-open")) {
        return;
      }
      $modal.removeClass("is-open").attr("aria-hidden", "true");
      $body.removeClass("illegal-register-modal-open");
      triggerEvent("illegalRegisterModal:close");
    }

    $modal.on("click", function (event) {
      if (event.target === $modal[0]) {
        closeModal();
      }
    });

    $closeButtons.on("click", function () {
      closeModal();
    });

    $(document).on("keydown", function (event) {
      if (event.key === "Escape" && $modal.hasClass("is-open")) {
        closeModal();
      }
    });

    window.IllegalRegisterModal = {
      open: openModal,
      close: closeModal,
      toggle: function (force) {
        if (typeof force === "boolean") {
          force ? openModal() : closeModal();
          return;
        }
        if ($modal.hasClass("is-open")) {
          closeModal();
        } else {
          openModal();
        }
      },
      element: $modal[0],
    };
  })(window, window.jQuery);
</script>
