<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <link rel="stylesheet" href="/resources/css/drone-raw-photo-modal.css">

    <div id="drp-modal" class="drp-modal">
        <div class="drp-modal-content">
            <div class="drp-modal-header">
                <h2 class="drp-modal-title">드론 원본 사진 탐색</h2>
                <div class="drp-header-controls">
                    <button id="drp-close-btn" class="drp-close-btn">&times;</button>
                </div>
            </div>
            <div class="drp-modal-body">
                <div id="drp-map" class="drp-map-container"></div>
                <div id="drp-list" class="drp-list-container">
                    <div class="drp-list-header">
                        <div class="drp-list-header-top">
                            <span>사진 목록 <span id="drp-photo-count">(0)</span></span>
                            <div style="display: flex; align-items: center;">
                                <span style="margin-right: 8px; font-size: 14px; color: #555;">촬영일 :</span>
                                <select id="drp-date-selector" class="drp-date-selector"
                                    style="padding: 4px 8px; font-size: 14px;">
                                    <option value="">날짜 선택</option>
                                </select>
                            </div>
                        </div>
                        <div class="drp-list-controls">
                            <div style="display:flex; align-items:center;">
                                <label style="cursor:pointer; display:flex; align-items:center; margin-bottom:0;">
                                    <input type="checkbox" id="drp-select-all" class="drp-checkbox"> 전체 선택
                                </label>
                                <span style="margin-left: 10px; font-size: 11px; color: #999; letter-spacing: -0.5px;">
                                    ※ GPS 오차로 인해 주소가 실제와 다를 수 있습니다.
                                </span>
                            </div>
                            <button id="drp-download-selected-btn" class="drp-download-btn"
                                style="display:none; margin-left:auto; font-size:12px; padding:4px 10px;">
                                선택 다운로드
                            </button>
                        </div>
                    </div>
                    <ul id="drp-photo-list-ul" class="drp-photo-list">
                        <!-- Photo items will be appended here -->
                    </ul>
                    <div id="drp-empty-state" class="drp-empty-state" style="display: none;">
                        해당 날짜에 촬영된 사진이 없습니다.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Image Viewer Modal -->
    <div id="drp-image-viewer" class="drp-image-viewer">
        <span id="drp-viewer-close" class="drp-viewer-close">&times;</span>
        <div class="drp-viewer-content">
            <img id="drp-viewer-img" class="drp-viewer-img" src="" alt="Original Photo">
        </div>
    </div>

    <script src="/resources/js/drone-raw-photo-modal.js"></script>