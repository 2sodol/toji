<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style>
    /* Modal Dialog Width Override */
    #inspectionDetailModal .modal-dialog {
        max-width: 860px;
        margin: 28px auto; /* 1.75rem -> 28px */
    }

    /* Modal Content Styling */
    #inspectionDetailModal .modal-content {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: none;
        font-family: 'Pretendard', -apple-system, sans-serif;
    }

    /* Header */
    .inspection-detail-header-custom {
        padding: 24px 32px;
        border-bottom: 1px solid #f9fafb; /* var(--gray-50) */
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
    }
    .inspection-detail-header-custom h2 { 
        margin: 0; 
        font-size: 20px; 
        font-weight: 700; 
        color: #111827; /* var(--gray-900) */ 
    }
    .inspection-detail-close-icon { 
        cursor: pointer; 
        color: #9ca3af; /* var(--gray-400) */ 
        font-size: 22px; 
        transition: color 0.2s; 
    }
    .inspection-detail-close-icon:hover { 
        color: #4b5563; /* var(--gray-600) */ 
    }

    /* Layout Wrapper */
    .inspection-detail-content-wrapper { display: flex; flex: 1; min-height: 400px; }

    /* Left Side: Info */
    .inspection-detail-info-side {
        flex: 0 0 320px;
        padding: 32px 28px;
        background-color: white;
        border-right: 1px solid #f9fafb; /* var(--gray-50) */
        display: flex;
        flex-direction: column;
    }

    .inspection-detail-side-title { 
        font-size: 16px; 
        font-weight: 700; 
        color: #111827; /* var(--gray-900) */ 
        margin-bottom: 24px;
        letter-spacing: -0.02em;
    }

    .inspection-detail-data-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .inspection-detail-data-card {
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 12px;
        background: white;
        border: 1px solid #f1f5f9;
        /* transition: all 0.2s; 제거 */
    }
    /* hover 효과 제거
    .inspection-detail-data-card:hover { 
        border-color: #007bff; 
        background-color: #f0f7ff; 
    }
    */

    .inspection-detail-icon-box {
        width: 40px;
        height: 40px;
        background: #f0f7ff; /* var(--light-blue) */
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
    }
    .inspection-detail-icon-box i { 
        color: #007bff; /* var(--primary-blue) */ 
        font-size: 17px; 
    }

    .inspection-detail-data-content { display: flex; flex-direction: column; gap: 2px; }
    .inspection-detail-data-label { 
        font-size: 11px; 
        color: #9ca3af; /* var(--gray-400) */ 
        font-weight: 700; 
    }
    .inspection-detail-data-value { 
        font-size: 15px; 
        color: #111827; /* var(--gray-900) */ 
        font-weight: 600; 
    }

    /* Right Side: Photos */
    .inspection-detail-photo-side { 
        flex: 1; 
        padding: 32px; 
        background-color: #f9fafb; /* var(--gray-50) */ 
        display: flex; 
        flex-direction: column; 
    }
    .inspection-detail-photo-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 16px; 
    }
    .inspection-detail-photo-header h3 { 
        margin: 0; 
        font-size: 16px; 
        font-weight: 700; 
    }
    
    .inspection-detail-photo-grid { 
        display: grid; 
        grid-template-columns: repeat(2, 1fr); 
        gap: 14px; 
        overflow-y: auto;
        max-height: 400px; /* 스크롤 처리 */
        padding-right: 4px; /* 스크롤바 여백 */
    }
    .inspection-detail-photo-item { 
        border-radius: 10px; 
        overflow: hidden; 
        aspect-ratio: 16 / 10; 
        border: 1px solid #e5e7eb; /* var(--gray-200) */ 
        background: white; 
        cursor: pointer; 
        position: relative;
    }
    .inspection-detail-photo-item img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        /* transition: 0.3s; 제거 */
    }
    /* hover 효과 제거
    .inspection-detail-photo-item:hover img { 
        opacity: 0.85; 
        transform: scale(1.05); 
    }
    */

    /* Footer */
    .inspection-detail-footer-custom { 
        padding: 20px 32px; 
        border-top: 1px solid #f3f4f6; /* var(--gray-100) */ 
        text-align: right; 
        background: #fff; 
    }
    .inspection-detail-btn-confirm { 
        padding: 12px 32px; 
        background: #007bff; /* var(--primary-blue) */ 
        color: white; 
        border: none; 
        border-radius: 8px; 
        font-weight: 700; 
        cursor: pointer; 
        transition: 0.2s; 
    }
    .inspection-detail-btn-confirm:hover { 
        background: #0069d9; 
    }

    /* Lightbox */
    .inspection-detail-lightbox-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: none;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .inspection-detail-lightbox-overlay.active { display: flex; opacity: 1; }
    .inspection-detail-lightbox-img { 
        max-width: 90%; 
        max-height: 90%; 
        object-fit: contain; 
        border-radius: 8px; 
        box-shadow: 0 0 20px rgba(0,0,0,0.5); 
    }
    .inspection-detail-lightbox-close { 
        position: absolute; 
        top: 20px; 
        right: 30px; 
        color: white; 
        font-size: 40px; 
        cursor: pointer; 
        z-index: 10001; 
        transition: transform 0.2s; 
    }
    .inspection-detail-lightbox-close:hover { 
        transform: scale(1.1); 
        color: #f8f9fa; 
    }
</style>

<!-- 상세 모달 Structure -->
<div class="modal fade" id="inspectionDetailModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="inspection-detail-header-custom">
                <h2>점검 상세 내역</h2>
                <i class="fa-solid fa-xmark inspection-detail-close-icon" data-dismiss="modal"></i>
            </div>

            <div class="inspection-detail-content-wrapper">
                <!-- 좌측 정보 영역 -->
                <div class="inspection-detail-info-side">
                    <div class="inspection-detail-side-title">주요 점검 정보</div>
                    
                    <div class="inspection-detail-data-stack">
                        <!-- 1. 노선 -->
                        <div class="inspection-detail-data-card">
                            <div class="inspection-detail-icon-box"><i class="fa-solid fa-route"></i></div>
                            <div class="inspection-detail-data-content">
                                <span class="inspection-detail-data-label">점검 노선</span>
                                <span class="inspection-detail-data-value" id="inspection-detail-route-drnm"></span>
                            </div>
                        </div>
                        <!-- 2. 이정 -->
                        <div class="inspection-detail-data-card">
                            <div class="inspection-detail-icon-box"><i class="fa-solid fa-location-dot"></i></div>
                            <div class="inspection-detail-data-content">
                                <span class="inspection-detail-data-label">점검 위치 (이정)</span>
                                <span class="inspection-detail-data-value" id="inspection-detail-route-dstnc"></span>
                            </div>
                        </div>
                        <!-- 3. 시설물명 -->
                        <div class="inspection-detail-data-card">
                            <div class="inspection-detail-icon-box"><i class="fa-solid fa-layer-group"></i></div>
                            <div class="inspection-detail-data-content">
                                <span class="inspection-detail-data-label">점검 시설물</span>
                                <span class="inspection-detail-data-value" id="inspection-detail-fclts"></span>
                            </div>
                        </div>
                        <!-- 4. 점검일시 -->
                        <div class="inspection-detail-data-card">
                            <div class="inspection-detail-icon-box"><i class="fa-regular fa-calendar-check"></i></div>
                            <div class="inspection-detail-data-content">
                                <span class="inspection-detail-data-label">점검 일시</span>
                                <span class="inspection-detail-data-value" id="inspection-detail-date"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 우측 사진 영역 -->
                <div class="inspection-detail-photo-side">
                    <div class="inspection-detail-photo-header">
                        <h3>현장 첨부 사진</h3>
                        <span style="font-size:12px; color:#9ca3af;">이미지 클릭 시 원본 보기</span>
                    </div>
                    <div class="inspection-detail-photo-grid" id="inspection-detail-gallery">
                        <!-- JS Dynamic Content -->
                    </div>
                </div>
            </div>

            <div class="inspection-detail-footer-custom">
                <button class="inspection-detail-btn-confirm" data-dismiss="modal">확인 완료</button>
            </div>
        </div>
    </div>
</div>

<!-- Custom Lightbox Element -->
<div id="inspection-detail-custom-lightbox" class="inspection-detail-lightbox-overlay" onclick="closeDetailLightbox()">
    <span class="inspection-detail-lightbox-close">&times;</span>
    <img id="inspection-detail-lightbox-img" class="inspection-detail-lightbox-img" src="" alt="확대 이미지">
</div>

<script>
    // === 상세 모달 로직 ===
    function openInspectionDetailModal(ispcId) {
        // 초기화
        $('#inspection-detail-route-drnm').text('');
        $('#inspection-detail-route-dstnc').text('');
        $('#inspection-detail-fclts').text('');
        $('#inspection-detail-date').text('');
        $('#inspection-detail-gallery').empty();

        $.ajax({
            url: "/inspection/api/view",
            type: "GET",
            data: { id: ispcId },
            dataType: "json",
            success: function(data) {
                if(data) {
                    $('#inspection-detail-route-drnm').text(data.routeDrnm);
                    $('#inspection-detail-route-dstnc').text(data.routeDstnc ? data.routeDstnc + ' KM' : '');
                    $('#inspection-detail-fclts').text(data.fcltsNm);
                    
                    var dateStr = "";
                    if(data.ispcDttm) {
                        var d = new Date(data.ispcDttm);
                        dateStr = d.getFullYear() + "-" + 
                                  String(d.getMonth() + 1).padStart(2, '0') + "-" + 
                                  String(d.getDate()).padStart(2, '0') + " " + 
                                  String(d.getHours()).padStart(2, '0') + ":" + 
                                  String(d.getMinutes()).padStart(2, '0');
                    }
                    $('#inspection-detail-date').text(dateStr);

                    // 갤러리 렌더링
                    if(data.files && data.files.length > 0) {
                        data.files.forEach(function(file) {
                            var imgUrl = '/inspection/image/' + file.fileSeq;
                            var html = `
                                <div class="inspection-detail-photo-item" onclick="openDetailLightbox('` + imgUrl + `')">
                                    <img src="` + imgUrl + `" alt="점검사진">
                                </div>
                            `;
                            $('#inspection-detail-gallery').append(html);
                        });
                    } else {
                        $('#inspection-detail-gallery').html(`
                            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #adb5bd; background: #fff; border-radius: 8px; border: 1px dashed #e5e7eb;">
                                <i class="far fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                                <p style="font-size: 14px; margin: 0;">등록된 사진이 없습니다.</p>
                            </div>
                        `);
                    }
                    $('#inspectionDetailModal').modal('show');
                }
            },
            error: function(e) {
                alert("상세 정보를 불러오는데 실패했습니다.");
            }
        });
    }

    // Lightbox Logic
    function openDetailLightbox(src) {
        var lightbox = document.getElementById('inspection-detail-custom-lightbox');
        var img = document.getElementById('inspection-detail-lightbox-img');
        img.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDetailLightbox() {
        var lightbox = document.getElementById('inspection-detail-custom-lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            document.getElementById('inspection-detail-lightbox-img').src = '';
        }, 300);
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeDetailLightbox();
        }
    });
</script>
