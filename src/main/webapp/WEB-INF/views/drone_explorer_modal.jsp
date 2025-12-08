<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html>

    <head>
        <link rel="stylesheet" href="<%=request.getContextPath()%>/resources/css/drone_explorer_modal.css">
        <!-- 라이브러리: jQuery와 OpenLayers CSS/JS는 부모 페이지나 여기서 로드된다고 가정 -->
        <!-- 요청대로 exifr CDN 사용 -->
        <script src="https://cdn.jsdelivr.net/npm/exifr/dist/full.umd.js"></script>
    </head>

    <body>

        <div id="drp-modal" class="drp-modal">
            <div class="drp-modal-content">
                <div class="drp-modal-header">
                    <h2 class="drp-modal-title">드론 원본 사진 탐색 (클라이언트 사이드)</h2>
                    <div class="drp-header-controls">
                        <button id="drp-close-btn" class="drp-close-btn">&times;</button>
                    </div>
                </div>
                <div class="drp-modal-body">
                    <div id="drp-map" class="drp-map-container"></div>

                    <div id="drp-list" class="drp-list-container">
                        <div class="drp-list-header">
                            <div class="drp-list-header-top">
                                <span class="drp-list-title">사진 목록 <span id="drp-photo-count">(0)</span></span>
                                <div class="drp-date-group">
                                    <span class="drp-date-label">촬영일 :</span>
                                    <input type="text" id="drp-datepicker" placeholder="날짜 선택"
                                        class="drp-date-selector">
                                </div>
                            </div>

                            <div class="drp-list-controls">
                                <button id="drp-select-all-btn" class="drp-select-all-btn"><span>전체 선택</span>
                                </button>
                                <span class="drp-disclaimer">GPS 오차로 주소가 다를 수 있습니다</span>
                            </div>
                        </div>

                        <ul id="drp-photo-list-ul" class="drp-photo-list">
                            <!-- 사진 아이템 -->
                        </ul>

                        <div id="drp-empty-state" class="drp-empty-state">
                            사진을 보려면 날짜를 선택하세요.
                        </div>
                        <div id="drp-loading-state" class="drp-empty-state" style="display:none;">
                            사진 및 메타데이터 로딩 중... <br>
                            <span id="drp-progress-text"></span>
                        </div>

                        <!-- 하단 다운로드 바 -->
                        <div id="drp-download-bar" class="drp-download-bar">
                            <div class="drp-download-info">
                                <span id="drp-selected-count">0</span>개 선택됨
                            </div>
                            <button id="drp-download-btn" class="drp-download-btn-full">
                                <i class="fa fa-download"></i> 다운로드
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 이미지 뷰어 -->
        <div id="drp-image-viewer" class="drp-image-viewer">
            <span id="drp-viewer-close" class="drp-viewer-close">&times;</span>
            <div class="drp-viewer-content">
                <img id="drp-viewer-img" class="drp-viewer-img" src="">
            </div>
        </div>

        <script src="<%=request.getContextPath()%>/resources/js/drone_explorer_modal.js"></script>
    </body>

    </html>