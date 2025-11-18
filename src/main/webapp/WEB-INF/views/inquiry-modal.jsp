<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<div
  id="illegalInquiryModal"
  class="illegal-inquiry-modal"
  aria-hidden="true"
>
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
        <span aria-hidden="true">&times;</span>
      </button>
    </header>
    
    <div class="illegal-inquiry-modal__body">
      <!-- 탭 네비게이션 -->
      <div class="illegal-inquiry-tabs">
        <button 
          type="button" 
          class="illegal-inquiry-tab illegal-inquiry-tab--active" 
          data-tab="detail"
        >
          상세정보
        </button>
        <button 
          type="button" 
          class="illegal-inquiry-tab" 
          data-tab="photo"
        >
          사진
        </button>
      </div>

      <!-- 상세정보 탭 콘텐츠 -->
      <div class="illegal-inquiry-tab-content illegal-inquiry-tab-content--active" id="detailTabContent">
        <div class="illegal-inquiry-content">
          <!-- 좌측: 등록일 리스트 -->
          <div class="illegal-inquiry-sidebar">
            <h3 class="illegal-inquiry-sidebar__title">등록일 목록</h3>
            <div class="illegal-inquiry-date-list" id="detailDateList">
              <!-- 동적으로 생성될 날짜 리스트 -->
            </div>
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
                    <input type="text" class="illegal-inquiry-input" id="detail_hdqrNm" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">지사</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_mtnofNm" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">노선</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_routeCd" readonly />
                  </div>
                </div>

                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-3">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">주행방향</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_drveDrctCd" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">이정</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_routeDstnc" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">구분</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_strcClssCd" readonly />
                  </div>
                </div>
              </section>

              <!-- 토지정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">토지정보</p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-1">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">세부위치(주소)</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_lndsLdnoAddr" readonly />
                  </div>
                </div>
              </section>

              <!-- 발생 및 관계자 정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">발생 및 관계자 정보</p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-4">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">발생일자</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_ocrnDates" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">담당자</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_prchEmno" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">행위자명</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_trnrNm" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">관련자</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_rltrNm" readonly />
                  </div>
                </div>

                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-2">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">행위자 주소</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_trnrAddr" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">관련자 주소</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_rltrAddr" readonly />
                  </div>
                </div>
              </section>

              <!-- 점유 및 조치 정보 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">점유 및 조치 정보</p>
                <div class="illegal-inquiry-grid illegal-inquiry-grid--cols-3">
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">점유율 (%)</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_ilglPssrt" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">점유면적 (㎡)</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_ilglPssnSqms" readonly />
                  </div>
                  <div class="illegal-inquiry-field">
                    <label class="illegal-inquiry-label">조치상태</label>
                    <input type="text" class="illegal-inquiry-input" id="detail_ilglPrvuActnStatVal" readonly />
                  </div>
                </div>
              </section>

              <!-- 조치 이력 섹션 -->
              <section class="illegal-inquiry-form__section">
                <p class="illegal-inquiry-form__section-title">조치 이력</p>
                <div class="illegal-inquiry-action-history" id="detailActionHistory">
                  <!-- 동적으로 생성될 조치이력 -->
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 사진 탭 콘텐츠 -->
      <div class="illegal-inquiry-tab-content" id="photoTabContent">
        <div class="illegal-inquiry-content">
          <!-- 좌측: 등록일 리스트 -->
          <div class="illegal-inquiry-sidebar">
            <h3 class="illegal-inquiry-sidebar__title">등록일 목록</h3>
            <div class="illegal-inquiry-date-list" id="photoDateList">
              <!-- 동적으로 생성될 날짜 리스트 -->
            </div>
          </div>

          <!-- 우측: 사진 갤러리 -->
          <div class="illegal-inquiry-main">
            <div class="illegal-inquiry-photo-gallery" id="photoGallery">
              <div class="illegal-inquiry-photo-header">
                <h3 class="illegal-inquiry-photo-title">첨부 사진</h3>
                <div class="illegal-inquiry-photo-controls">
                  <button type="button" class="illegal-inquiry-photo-btn" id="downloadAllBtn">
                    전체 다운로드
                  </button>
                </div>
              </div>
              
              <div class="illegal-inquiry-photo-grid" id="photoGrid">
                <!-- 동적으로 생성될 사진들 -->
              </div>
              
              <div class="illegal-inquiry-photo-empty" id="photoEmpty" style="display: none;">
                <p>선택된 날짜에 등록된 사진이 없습니다.</p>
              </div>
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
