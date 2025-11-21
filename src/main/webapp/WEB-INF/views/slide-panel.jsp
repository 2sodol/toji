<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>
<!-- 슬라이드 패널 토글 버튼 -->
<button id="slide-panel-toggle" class="slide-panel-toggle" type="button">
  <i class="fas fa-bars"></i>
</button>

<!-- 슬라이드 패널 오버레이 -->
<div class="slide-panel-overlay"></div>

<!-- 슬라이드 패널 -->
<div id="slide-panel" class="slide-panel">
  <div class="slide-panel__header">
    <h2 class="slide-panel__title">불법점용 리스트</h2>
    <div class="slide-panel__header-actions">
      <label class="slide-panel__checkbox-label">
        <input
          type="checkbox"
          id="slide-panel-image-toggle"
          class="slide-panel__checkbox"
          checked
        />
        <span class="slide-panel__checkbox-text">이미지 표시</span>
      </label>
      <button
        id="slide-panel-close-btn"
        class="slide-panel__close-btn"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
  <div class="slide-panel__body">
    <!-- 리스트 영역 -->
    <div id="slide-panel-list-wrapper" class="slide-panel-list-wrapper">
      <div id="slide-panel-list-container" class="slide-panel-list-container">
        <!-- 데이터그리드 헤더 -->
        <div class="slide-panel-list-header">
          <div
            class="slide-panel-list-header__cell slide-panel-list-header__cell--sequence"
          >
            번호
          </div>
          <div
            class="slide-panel-list-header__cell slide-panel-list-header__cell--address"
          >
            주소
          </div>
        </div>
        <!-- 리스트 아이템들이 여기에 동적으로 추가됩니다 -->
      </div>
      <!-- 페이징 영역 -->
      <div
        id="slide-panel-pagination-wrapper"
        class="slide-panel-pagination-wrapper"
      >
        <!-- 페이징 버튼들이 여기에 동적으로 추가됩니다 -->
      </div>
    </div>
    <!-- 로딩 영역 -->
    <div
      id="slide-panel-loading"
      class="slide-panel-loading"
      style="display: none"
    >
      <div class="slide-panel-loading__text">로딩 중...</div>
    </div>
    <!-- 빈 상태 영역 -->
    <div id="slide-panel-empty" class="slide-panel-empty" style="display: none">
      <div class="slide-panel-empty__icon">
        <i class="fas fa-inbox"></i>
      </div>
      <div class="slide-panel-empty__text">검색 결과가 없습니다</div>
    </div>
  </div>
</div>
