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
          <input id="gpsLgtd" name="gpsLgtd" />
          <input id="gpsLttd" name="gpsLttd" />

          <p class="illegal-register-form__section-title">
            기본정보<span class="illegal-register-form__required">*</span>
          </p>
          <div class="illegal-register-grid illegal-register-grid--cols-3">
            <div class="illegal-register-field">
              <label class="illegal-register-label" for="hdqrNm">본부</label>
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
              <label class="illegal-register-label" for="mtnofNm">지사</label>
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
              <label class="illegal-register-label" for="routeCd">노선</label>
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
              <label class="illegal-register-label" for="drveDrctCd"
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
              <label class="illegal-register-label" for="routeDstnc"
                >이정 (km)</label
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
              <label class="illegal-register-label" for="lndsLdnoAddr"
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
          <div
            class="illegal-register-grid illegal-register-grid--cols-4 illegal-register-grid--single-row"
          >
            <div class="illegal-register-field">
              <label class="illegal-register-label" for="ocrnDates"
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
              <label class="illegal-register-label" for="prchEmno"
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
              <label class="illegal-register-label" for="rltrNm">관련자</label>
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
              <label class="illegal-register-label" for="trnrAddr"
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
                  class="illegal-register-button illegal-register-button--outline"
                  type="button"
                  data-register-address-target="actor"
                >
                  검색
                </button>
              </div>
            </div>
            <div class="illegal-register-field">
              <label class="illegal-register-label" for="rltrAddr"
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
                  class="illegal-register-button illegal-register-button--outline"
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
              <label class="illegal-register-label" for="ilglPssrt"
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
              <label class="illegal-register-label" for="ilglPssnSqms"
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
                class="illegal-register-button illegal-register-button--outline illegal-register-button--sm"
                id="addActionHistoryBtn"
              >
                추가
              </button>
            </div>
            <div id="actionHistoryList" class="illegal-register-history__list">
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
          <p class="illegal-register-form__section-title">사진 등록</p>

          <!-- 이미지 파일 등록 섹션 (날짜와 이미지 매핑) -->
          <div class="illegal-register-image-section">
            <div class="illegal-register-image-section__header">
              <div>
                <small class="illegal-register-file-upload__description">
                  날짜와 함께 이미지를 등록하세요. 여러 개 추가할 수 있습니다.
                </small>
              </div>
              <button
                type="button"
                class="illegal-register-button illegal-register-button--outline illegal-register-button--sm"
                id="addImageBtn"
              >
                <span class="illegal-register-button__text">추가</span>
              </button>
            </div>
            <div id="imageList" class="illegal-register-image-list">
              <!-- 이미지 아이템들이 동적으로 추가됩니다 -->
            </div>
          </div>
        </section>
      </form>
    </div>
    <footer class="illegal-register-modal__footer">
      <button
        type="button"
        id="illegalRegisterDeleteBtn"
        class="illegal-register-button illegal-register-button--danger"
        style="display: none;"
      >
        삭제
      </button>
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
        완료
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
    transition: background-color 0.2s ease, color 0.2s ease,
      border-color 0.2s ease, box-shadow 0.2s ease;
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

  .illegal-register-button--danger {
    background-color: #dc2626;
    color: #ffffff;
  }

  .illegal-register-button--danger:hover,
  .illegal-register-button--danger:focus-visible {
    background-color: #b91c1c;
  }

  [data-register-address-target]:not(.illegal-register-button--outline) {
    background-color: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
  }

  [data-register-address-target]:not(.illegal-register-button--outline):hover,
  [data-register-address-target]:not(
      .illegal-register-button--outline
    ):focus-visible {
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

  .illegal-register-button__text {
    font-weight: 600;
  }

  .illegal-register-button i {
    margin-right: 6px;
  }

  .illegal-register-file-upload__description {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }

  body.illegal-register-modal-open {
    overflow: hidden;
  }

  .illegal-register-image-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .illegal-register-image-section__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .illegal-register-image-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .illegal-register-image-item {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-color: #f9fafb;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .illegal-register-image-item__content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .illegal-register-image-item__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .illegal-register-image-item__number {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
  }

  .illegal-register-image-item__remove {
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

  .illegal-register-image-item__remove:hover,
  .illegal-register-image-item__remove:focus-visible {
    background-color: rgba(220, 38, 38, 0.1);
    color: #b91c1c;
  }

  .illegal-register-image-item__row {
    display: flex;
    gap: 16px;
    align-items: end;
    flex-wrap: wrap;
  }

  .illegal-register-image-item__row .illegal-register-field {
    flex: 0 0 auto;
    min-width: 0;
  }

  .illegal-register-image-item__row .illegal-register-field:first-child {
    width: auto;
  }

  .illegal-register-image-item__row .illegal-register-field:nth-child(2) {
    width: 100px;
  }

  .illegal-register-field--inline {
    flex-direction: row !important;
    align-items: center;
    gap: 8px;
  }

  .illegal-register-field--inline .illegal-register-label {
    margin: 0;
    white-space: nowrap;
  }

  .illegal-register-field--inline .illegal-register-input {
    width: auto;
    min-width: 150px;
  }

  .illegal-register-image-item__select-btn {
    margin-left: auto;
    align-self: flex-end;
  }

  /* 모든 input 요소와 버튼의 높이를 통일 */
  .illegal-register-image-item__row .illegal-register-input,
  .illegal-register-image-item__row .illegal-register-button {
    height: 40px;
    box-sizing: border-box;
  }

  .illegal-register-image-item__preview-section {
    margin-top: 12px;
  }

  .illegal-register-image-item__preview-section .illegal-register-label {
    padding-bottom: 8px;
  }

  .illegal-register-image-item__preview {
    min-height: 120px;
    padding: 16px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background-color: #fafbfc;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-start;
    box-sizing: border-box;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .illegal-register-image-item__preview.has-images {
    border-style: solid;
    border-color: #e5e7eb;
    background-color: #ffffff;
  }

  .illegal-register-image-item__preview-empty {
    color: #6b7280;
    font-size: 14px;
    width: 100%;
    text-align: center;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .illegal-register-image-item__preview-empty i {
    font-size: 32px;
    color: #d1d5db;
    margin-bottom: 4px;
    display: block;
  }

  .illegal-register-image-thumbnail {
    position: relative;
    width: 100px;
    height: 100px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    background-color: #ffffff;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease,
      box-shadow 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .illegal-register-image-thumbnail:hover {
    border-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }

  .illegal-register-image-thumbnail__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .illegal-register-image-thumbnail__remove {
    position: absolute;
    top: 6px;
    right: 6px;
    background-color: rgba(0, 0, 0, 0.7);
    border: none;
    color: #ffffff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-size: 12px;
    transition: background-color 0.2s ease, transform 0.2s ease,
      box-shadow 0.2s ease;
    z-index: 10;
    backdrop-filter: blur(4px);
  }

  .illegal-register-image-thumbnail__remove:hover,
  .illegal-register-image-thumbnail__remove:focus-visible {
    background-color: rgba(220, 38, 38, 0.95);
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
  }

  .illegal-register-image-thumbnail__remove i {
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .illegal-register-image-item__row {
      flex-direction: column;
      align-items: stretch;
    }

    .illegal-register-image-item__row .illegal-register-field:first-child,
    .illegal-register-image-item__row .illegal-register-field:nth-child(2) {
      width: 100%;
    }
  }
</style>

<script>
  (function (window, $) {
    "use strict";

    // ===== 상수 정의 =====
    var CONSTANTS = {
      MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_EXTENSIONS: ["png", "jpg", "jpeg"],
      ALLOWED_MIME_TYPES: ["image/png", "image/jpeg", "image/jpg"],
      EMPTY_PREVIEW_MESSAGE: "선택된 파일이 없습니다.",
    };

    // ===== DOM 요소 캐싱 =====
    var $modal = $("#illegalRegisterModal");
    if (!$modal.length) {
      return;
    }

    var $body = $("body");
    var $closeButtons = $modal.find("[data-register-modal-close]");
    var $addImageBtn = $("#addImageBtn");
    var $imageList = $("#imageList");

    // ===== 상태 관리 =====
    var state = {
      imageItemCounter: 0,
    };

    // ===== 유틸리티 함수 =====
    function triggerEvent(eventName) {
      $modal.trigger($.Event(eventName, { bubbles: true }));
    }

    function fileToBase64(file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.onerror = function (error) {
          reject(error);
        };
      });
    }

    function getSelector(id, type) {
      var selectors = {
        dateInput: "#imageDate_" + id,
        fileInput: "#fileInput_" + id,
        preview: "#preview_" + id,
        mappingData: "#mappingData_" + id,
        item: '[data-item-id="' + id + '"]',
      };
      return selectors[type] || "";
    }

    // ===== HTML 템플릿 함수 =====
    function createRemoveButton(itemId) {
      return (
        '<button type="button" class="illegal-register-image-item__remove" onclick="IllegalRegisterImage.removeItem(\'' +
        itemId +
        "')\">" +
        '<i class="fas fa-times" aria-hidden="true"></i>' +
        "</button>"
      );
    }

    function createImageItemHtml(itemId, number) {
      var removeButtonHtml = number > 1 ? createRemoveButton(itemId) : "";

      return (
        '<div class="illegal-register-image-item" data-item-id="' +
        itemId +
        '">' +
        '<div class="illegal-register-image-item__content">' +
        '<div class="illegal-register-image-item__header">' +
        '<span class="illegal-register-image-item__number">#' +
        number +
        "</span>" +
        removeButtonHtml +
        "</div>" +
        '<div class="illegal-register-image-item__row">' +
        '<div class="illegal-register-field illegal-register-field--inline" style="position: relative;">' +
        '<input type="date" class="illegal-register-input" id="imageDate_' +
        itemId +
        '" required />' +
        '<span class="illegal-register-form__required" style="position: absolute; top: -5px; right: -10px;">*</span>' +
        "</div>" +
        '<button type="button" class="illegal-register-button illegal-register-button--outline illegal-register-button--sm illegal-register-image-item__select-btn" onclick="IllegalRegisterImage.selectFile(\'' +
        itemId +
        "')\">" +
        '<i class="fas fa-upload" aria-hidden="true"></i>' +
        '<span class="illegal-register-button__text">선택</span>' +
        "</button>" +
        "</div>" +
        '<div class="illegal-register-image-item__preview-section">' +
        '<div class="illegal-register-image-item__preview" id="preview_' +
        itemId +
        '">' +
        createEmptyPreviewHtml() +
        "</div>" +
        "</div>" +
        '<input type="file" id="fileInput_' +
        itemId +
        '" accept=".png,.jpg,.jpeg" data-item-id="' +
        itemId +
        '" multiple hidden />' +
        '<input type="hidden" id="mappingData_' +
        itemId +
        '" name="imageMappingData[]" />' +
        "</div>" +
        "</div>"
      );
    }

    function createEmptyPreviewHtml() {
      return (
        '<span class="illegal-register-image-item__preview-empty">' +
        '<i class="fas fa-image" aria-hidden="true"></i>' +
        CONSTANTS.EMPTY_PREVIEW_MESSAGE +
        "</span>"
      );
    }

    function createImageThumbnailHtml(imageId, base64Data, fileName) {
      return (
        '<div class="illegal-register-image-thumbnail" data-image-id="' +
        imageId +
        '">' +
        '<img src="' +
        base64Data +
        '" alt="' +
        fileName +
        '" class="illegal-register-image-thumbnail__img" />' +
        '<button type="button" class="illegal-register-image-thumbnail__remove" onclick="IllegalRegisterImage.removeImage(\'' +
        imageId +
        '\')" aria-label="삭제">' +
        '<i class="fas fa-times" aria-hidden="true"></i>' +
        "</button>" +
        "</div>"
      );
    }

    // ===== 이미지 아이템 관리 =====
    function createImageItem() {
      state.imageItemCounter++;
      var itemId = "imageItem_" + state.imageItemCounter;
      // 현재 리스트의 항목 수 + 1을 넘버링으로 사용
      var currentItemCount = $imageList.find(
        ".illegal-register-image-item"
      ).length;
      var number = currentItemCount + 1;
      var itemHtml = createImageItemHtml(itemId, number);
      $imageList.append(itemHtml);
      return itemId;
    }

    function renumberImageItems() {
      $imageList.find(".illegal-register-image-item").each(function (index) {
        var newNumber = index + 1;
        var $item = $(this);
        var itemId = $item.data("item-id");
        var $header = $item.find(".illegal-register-image-item__header");
        var $removeBtn = $item.find(".illegal-register-image-item__remove");

        // 넘버링 업데이트
        $item
          .find(".illegal-register-image-item__number")
          .text("#" + newNumber);

        // 첫 번째 아이템은 삭제 버튼 제거
        if (newNumber === 1) {
          $removeBtn.remove();
        } else if ($removeBtn.length === 0) {
          // 두 번째 이상은 삭제 버튼 추가
          $header.append(createRemoveButton(itemId));
        }
      });
    }

    // ===== 파일 검증 =====
    function validateFile(file) {
      // 파일명에서 확장자 추출
      var fileName = file.name.toLowerCase();
      var fileExtension = fileName.split(".").pop();

      // 확장자 검증
      if (
        !fileExtension ||
        CONSTANTS.ALLOWED_EXTENSIONS.indexOf(fileExtension) === -1
      ) {
        alert("PNG, JPG 등 이미지 파일만 업로드 가능합니다.");
        return false;
      }

      // MIME 타입 검증
      if (
        !file.type ||
        CONSTANTS.ALLOWED_MIME_TYPES.indexOf(file.type.toLowerCase()) === -1
      ) {
        alert(
          "PNG, JPG 등 이미지 파일만 업로드 가능합니다. (파일 형식이 올바르지 않습니다)"
        );
        return false;
      }

      // 파일 크기 검증
      if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        alert("파일 크기는 10MB를 초과할 수 없습니다.");
        return false;
      }

      // 파일이 비어있는지 확인
      if (file.size === 0) {
        alert("빈 파일은 업로드할 수 없습니다.");
        return false;
      }

      return true;
    }

    function validateImageDate(itemId) {
      var imageDate = $(getSelector(itemId, "dateInput")).val();
      if (!imageDate) {
        alert("이미지 등록일을 먼저 선택해주세요.");
        return false;
      }
      return imageDate;
    }

    // ===== 파일 처리 =====
    function handleImageFileSelect(event) {
      var fileInput = event.target;
      var itemId = $(fileInput).data("item-id");
      var files = fileInput.files;

      if (!files || files.length === 0) return;

      var imageDate = validateImageDate(itemId);
      if (!imageDate) {
        $(fileInput).val("");
        return;
      }

      var validFiles = [];
      for (var i = 0; i < files.length; i++) {
        if (validateFile(files[i])) {
          validFiles.push(files[i]);
        }
      }

      if (validFiles.length === 0) {
        $(fileInput).val("");
        return;
      }

      // 모든 유효한 파일 처리
      var promises = validFiles.map(function (file) {
        return fileToBase64(file).then(function (base64Data) {
          return {
            file: file,
            base64Data: base64Data,
            base64Content: base64Data.split(",")[1],
          };
        });
      });

      Promise.all(promises)
        .then(function (results) {
          var $preview = $(getSelector(itemId, "preview"));
          var currentMapping =
            $(getSelector(itemId, "mappingData")).val() || "";
          var mappings = currentMapping ? currentMapping.split("||") : [];

          results.forEach(function (result, index) {
            var imageId =
              itemId +
              "_img_" +
              Date.now() +
              "_" +
              index +
              "_" +
              Math.random().toString(36).substr(2, 9);
            var mapping = imageDate + ":" + result.base64Content;
            mappings.push(mapping);

            // 썸네일 추가
            var thumbnailHtml = createImageThumbnailHtml(
              imageId,
              result.base64Data,
              result.file.name
            );
            if (
              $preview.find(".illegal-register-image-item__preview-empty")
                .length > 0
            ) {
              $preview.empty();
              $preview.addClass("has-images");
            }
            $preview.append(thumbnailHtml);

            // 이미지 데이터 저장 (나중에 삭제를 위해)
            $preview.data("images-" + imageId, {
              mapping: mapping,
              fileName: result.file.name,
            });
          });

          // 모든 매핑 데이터 업데이트
          $(getSelector(itemId, "mappingData")).val(mappings.join("||"));
          $(fileInput).val("");
        })
        .catch(function (error) {
          console.error("파일 변환 중 오류 발생:", error);
          alert("파일 처리 중 오류가 발생했습니다.");
          $(fileInput).val("");
        });
    }

    // ===== 모달 관리 =====
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

    // ===== 이미지 삭제 =====
    function removeImageFromPreview(imageId) {
      var $thumbnail = $(
        '.illegal-register-image-thumbnail[data-image-id="' + imageId + '"]'
      );
      var $preview = $thumbnail.closest(
        ".illegal-register-image-item__preview"
      );
      var itemId = $preview
        .closest(".illegal-register-image-item")
        .data("item-id");

      // 저장된 이미지 데이터 가져오기
      var imageData = $preview.data("images-" + imageId);
      if (imageData && imageData.mapping) {
        // 매핑 데이터에서 해당 이미지 제거
        var currentMapping = $(getSelector(itemId, "mappingData")).val() || "";
        var mappings = currentMapping.split("||").filter(function (mapping) {
          return mapping !== imageData.mapping;
        });
        $(getSelector(itemId, "mappingData")).val(mappings.join("||"));
      }

      // 썸네일 제거
      $thumbnail.remove();

      // 저장된 데이터 제거
      $preview.removeData("images-" + imageId);

      // 이미지가 없으면 빈 상태 메시지 표시
      if ($preview.find(".illegal-register-image-thumbnail").length === 0) {
        $preview.removeClass("has-images");
        $preview.html(createEmptyPreviewHtml());
      }
    }

    // ===== 공개 API =====
    window.IllegalRegisterImage = {
      selectFile: function (itemId) {
        $(getSelector(itemId, "fileInput")).click();
      },

      clearFile: function (itemId) {
        $(getSelector(itemId, "fileInput")).val("");
        $(getSelector(itemId, "mappingData")).val("");
        var $preview = $(getSelector(itemId, "preview"));
        $preview.removeClass("has-images");
        $preview.html(createEmptyPreviewHtml());
      },

      removeImage: function (imageId) {
        removeImageFromPreview(imageId);
      },

      removeItem: function (itemId) {
        $(getSelector(itemId, "item")).remove();
        renumberImageItems();
      },
    };

    // ===== 이벤트 바인딩 =====
    function bindEvents() {
      $addImageBtn.on("click", function () {
        createImageItem();
      });

      $(document).on(
        "change",
        'input[type="file"][accept*=".png"]',
        handleImageFileSelect
      );

      $modal.on("click", function (event) {
        if (event.target === $modal[0]) {
          closeModal();
        }
      });

      $closeButtons.on("click", closeModal);

      $(document).on("keydown", function (event) {
        if (event.key === "Escape" && $modal.hasClass("is-open")) {
          closeModal();
        }
      });

      $modal.on("illegalRegisterModal:open", function () {
        if ($imageList.children().length === 0) {
          createImageItem();
        }
      });
    }

    // ===== 초기화 =====
    bindEvents();

    window.IllegalRegisterModal = {
      open: openModal,
      close: closeModal,
      toggle: function (force) {
        if (typeof force === "boolean") {
          force ? openModal() : closeModal();
          return;
        }
        $modal.hasClass("is-open") ? closeModal() : openModal();
      },
      element: $modal[0],
    };
  })(window, window.jQuery);
</script>
