<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <div id="drone-modal" class="drone-modal">
        <div class="drone-modal__content">
            <div class="drone-modal__header">
                <h3 class="drone-modal__title">드론 촬영 이미지 다운로드</h3>
                <button type="button" id="drone-modal-close" class="drone-modal__close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="drone-modal__body">
                <!-- 검색 필터 -->
                <div class="drone-modal__search">
                    <div class="drone-modal__input-group">
                        <label class="drone-modal__label">시작일</label>
                        <input type="date" id="drone-start-date" class="drone-modal__input">
                    </div>
                    <div class="drone-modal__input-group">
                        <label class="drone-modal__label">종료일</label>
                        <input type="date" id="drone-end-date" class="drone-modal__input">
                    </div>
                    <button type="button" id="drone-search-btn" class="drone-modal__search-btn">
                        <i class="fas fa-search"></i> 검색
                    </button>
                </div>

                <!-- 리스트 영역 -->
                <div id="drone-list-container" class="drone-modal__list-container">
                    <div id="drone-grid" class="drone-modal__grid">
                        <!-- 아이템들이 여기에 동적으로 추가됨 -->
                    </div>

                    <!-- 빈 상태 -->
                    <div id="drone-empty" class="drone-modal__empty" style="display: none;">
                        <i class="fas fa-images"></i>
                        <span>조회된 이미지가 없습니다.</span>
                    </div>
                </div>

                <!-- 페이징 -->
                <div id="drone-pagination" class="drone-modal__pagination">
                    <!-- 페이징 버튼들이 여기에 동적으로 추가됨 -->
                </div>
            </div>

            <div class="drone-modal__footer">
                <div style="margin-right: auto; font-size: 14px; color: #666;">
                    선택된 이미지: <span id="drone-selected-count">0</span>개
                </div>
                <button type="button" id="drone-download-all" class="drone-modal__btn drone-modal__btn--secondary">
                    <i class="fas fa-download"></i> 전체 다운로드
                </button>
                <button type="button" id="drone-download-selected" class="drone-modal__btn drone-modal__btn--primary">
                    <i class="fas fa-check"></i> 선택 다운로드
                </button>
            </div>
        </div>
    </div>