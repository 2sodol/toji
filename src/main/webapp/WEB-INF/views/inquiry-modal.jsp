<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<div id="illegalInquiryModal" class="illegal-inquiry-modal" aria-hidden="true">
  <div
    class="illegal-inquiry-modal__window"
    role="dialog"
    aria-modal="true"
    aria-labelledby="illegalInquiryModalTitle"
  >
    <header class="illegal-inquiry-modal__header">
      <h2 id="illegalInquiryModalTitle" class="illegal-inquiry-modal__title">
        상세 정보 조회
      </h2>
      <button
        type="button"
        class="illegal-inquiry-modal__close-button"
        data-inquiry-modal-close
        aria-label="닫기"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </header>

    <div class="illegal-inquiry-modal__body">
      <!-- 상세정보 콘텐츠 -->
      <div class="illegal-inquiry-content-wrapper">
        <div class="illegal-inquiry-content">
          <!-- 좌측: 등록일 리스트 -->
          <div class="illegal-inquiry-sidebar">
            <h3 class="illegal-inquiry-sidebar__title">등록일 목록</h3>
            <div class="illegal-inquiry-date-list" id="detailDateList"></div>
          </div>

          <!-- 우측: 상세정보 -->
          <div class="illegal-inquiry-main">
            <div class="illegal-inquiry-form" id="detailForm">
              <!-- 기본정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">기본정보</p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-3">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">본부</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_hdqrNm"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">지사</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_mtnofNm"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">노선</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_routeCd"
                    ></span>
                  </div>
                </div>

                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-3">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">주행방향</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_drveDrctCd"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">이정(km)</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_routeDstnc"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">구분</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_strcClssCd"
                    ></span>
                  </div>
                </div>
              </section>

              <!-- 토지정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">토지정보</p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-1">
                  <div class="illegal-inquiry-field illegal-inquiry-field--row">
                    <label class="illegal-inquiry-label">세부위치(주소)</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_lndsLdnoAddr"
                    ></span>
                  </div>
                </div>
              </section>

              <!-- 발생 및 관계자 정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">
                  발생 및 관계자 정보
                </p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-4">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">발생일자</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_ocrnDates"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">담당자</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_prchEmno"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">행위자명</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_trnrNm"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">관련자</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_rltrNm"
                    ></span>
                  </div>
                </div>

                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-2">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">행위자 주소</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_trnrAddr"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">관련자 주소</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_rltrAddr"
                    ></span>
                  </div>
                </div>
              </section>

              <!-- 점유 및 조치 정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">
                  점유 및 조치 정보
                </p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-3">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">점유율 (%)</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_ilglPssrt"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">점유면적 (㎡)</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_ilglPssnSqms"
                    ></span>
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">조치상태</label>
                    <span
                      class="illegal-inquiry-text"
                      id="detail_ilglPrvuActnStatVal"
                    ></span>
                  </div>
                </div>
              </section>

              <!-- 조치 이력 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">조치 이력</p>
                <div
                  class="illegal-inquiry-action-history"
                  id="detailActionHistory"
                ></div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="illegal-inquiry-modal__footer">
      <button
        type="button"
        class="illegal-inquiry-modal__button illegal-inquiry-modal__button--secondary"
        data-inquiry-modal-close
      >
        닫기
      </button>
    </footer>
  </div>
</div>
