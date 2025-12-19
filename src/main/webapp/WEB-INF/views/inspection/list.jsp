<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>무정차 시설물 점검 목록</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .container { padding: 20px; max-width: 1200px; }
        .table-hover tbody tr { cursor: pointer; }
        
        /* 상세 모달 갤러리 */
        .gallery { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
        .gallery-item { border: 1px solid #ddd; padding: 5px; width: 100%; max-width: 350px; }
        .gallery-item img { width: 100%; height: auto; display: block; }
        .gallery-item p { text-align: center; margin: 5px 0 0 0; font-size: 12px; color: #666; }
        
        /* 점검일시 강조 스타일 */
        .highlight-date { font-weight: bold; color: #0056b3; font-size: 1.1em; }

        .excel-upload-wrapper {
            font-family: 'Pretendard', sans-serif;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: none;
        }

        .em-modal-header {
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
        }
        .em-modal-header h5 { margin: 0; font-size: 18px; font-weight: 600; color: #1f2937; }

        .em-modal-body { padding: 20px 24px; }

        /* 가변형 업로드 영역 */
        .em-upload-area {
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            background: #fafafa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        /* 파일이 없을 때 (기본) */
        .em-upload-area.empty { height: 180px; }
        .em-upload-area.empty i { font-size: 40px; color: #007bff; margin-bottom: 12px; }
        
        /* 파일이 있을 때 (축소형) */
        .em-upload-area.has-files {
            height: 60px;
            flex-direction: row;
            gap: 12px;
            border-style: solid;
            background: #eef6ff;
            border-color: #007bff;
        }
        .em-upload-area.has-files i { font-size: 20px; color: #007bff; margin-bottom: 0; }
        .em-upload-area.has-files .desc-main { font-size: 14px; font-weight: 600; color: #007bff; margin-bottom: 0; }
        .em-upload-area.has-files .desc-sub { display: none; }

        .em-upload-area:hover { background: #eef6ff; border-color: #007bff; }
        .em-upload-area.dragover { background: #eef6ff; border-color: #007bff; }
        
        .desc-main { display: block; margin-bottom: 4px; font-weight: 500; color: #1f2937; }
        .desc-sub { font-size: 12px; color: #6b7280; }

        /* 파일 리스트 */
        .em-file-list {
            margin-top: 16px;
            max-height: 240px;
            overflow-y: auto;
            display: none; /* 기본은 숨김 */
        }
        .em-file-list.active { display: block; }

        .em-file-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #fff;
            border: 1px solid #edf2f7;
            border-radius: 10px;
            margin-bottom: 8px;
        }
        .em-file-item:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        
        .em-file-icon { 
            width: 36px; height: 36px; 
            background: #e6f4ea; color: #1e7e34; 
            display: flex; align-items: center; justify-content: center; 
            border-radius: 8px; margin-right: 12px; 
        }
        .em-file-details { flex: 1; min-width: 0; }
        .em-file-name { display: block; font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .em-file-size { font-size: 12px; color: #6b7280; }
        .em-remove-btn { color: #ff4d4f; cursor: pointer; padding: 5px; border: none; background: none; font-size: 18px; }

        /* 로딩 오버레이 */
        .em-loading-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255, 255, 255, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 16px;
        }
        .em-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #f3f4f6;
            display: flex;
            justify-content: flex-end; /* 버튼 그룹 우측 정렬 */
            align-items: center;
            background: #fff;
        }
        .em-btn-group { display: flex; gap: 8px; width: 100%; justify-content: flex-end; }
        .em-btn { padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }
        .em-btn-cancel { background: #f3f4f6; color: #4b5563; }
        .em-btn-submit { background: #007bff; color: white; }
        .em-btn-submit:disabled { background: #d1d5db; cursor: not-allowed; }
    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>
    <div class="container">
        <h2 class="mt-4 mb-3">무정차 시설물 점검 목록</h2>
        
        <div style="margin-bottom: 10px; text-align: right;">
            <!-- 엑셀 등록 버튼 -->
            <button type="button" class="btn btn-primary" onclick="openUploadModal()">
                엑셀 등록
            </button>
        </div>

        <table class="table table-bordered table-hover">
            <thead class="thead-light">
                <tr>
                    <th style="width: 5%;">순번</th>
                    <th style="width: 25%;">노선/이정</th>
                    <th style="width: 25%;">시설물명</th>
                    <th style="width: 25%;">점검일시</th>
                    <th style="width: 20%;">등록일시</th>
                </tr>
            </thead>
            <tbody>
                <c:forEach var="item" items="${list}" varStatus="status">
                    <tr onclick="openDetailModal('${item.ispcId}')">
                        <td class="text-center">${status.count}</td>
                        <td>${item.routeDrnm}</td>
                        <td>${item.fcltsNm}</td>
                        <td class="text-center">
                            <div style="font-weight: bold; color: #333;">
                                <fmt:formatDate value="${item.ispcDttm}" pattern="yyyy-MM-dd"/>
                            </div>
                            <small class="text-muted">
                                <fmt:formatDate value="${item.ispcDttm}" pattern="HH:mm"/>
                            </small>
                        </td>
                        <td class="text-center"><fmt:formatDate value="${item.fsttmRgstDttm}" pattern="yyyy-MM-dd"/></td>
                    </tr>
                </c:forEach>
                <c:if test="${empty list}">
                    <tr>
                        <td colspan="5" class="text-center">등록된 점검 내역이 없습니다.</td>
                    </tr>
                </c:if>
            </tbody>
        </table>
    </div>

    <!-- 상세 모달 -->
    <div class="modal" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">점검 상세 정보</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <table class="table table-bordered">
                        <colgroup>
                            <col style="width: 20%; background-color: #f8f9fa;">
                            <col style="width: 80%;">
                        </colgroup>
                        <tbody>
                            <tr><th>노선/이정</th><td id="modal-route"></td></tr>
                            <tr><th>시설물명</th><td id="modal-fclts"></td></tr>
                            <tr><th>점검일시</th><td id="modal-date" class="highlight-date"></td></tr>
                            <tr><th>본부/지사</th><td id="modal-org"></td></tr>
                        </tbody>
                    </table>
                    <h5 class="mt-4">점검 사진</h5>
                    <div id="modal-gallery" class="gallery"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 엑셀 등록 모달 (개선된 디자인 적용) -->
    <div class="modal" id="uploadModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document" style="max-width: 480px;">
            <div class="modal-content excel-upload-wrapper">
                <div class="em-modal-header">
                    <h5>엑셀 파일 등록</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="padding:0; margin:0;">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                
                <div class="em-modal-body" style="position: relative;">
                    <!-- 로딩 오버레이 -->
                    <div id="emUploadStatus" class="em-loading-overlay" style="display: none;">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>

                    <!-- 가변형 드롭존 -->
                    <div class="em-upload-area empty" id="emDropZone">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <div>
                            <span class="desc-main">파일을 드래그하거나 클릭하세요</span>
                            <span class="desc-sub">최대 5개, .xlsx 또는 .xls (10MB 내외)</span>
                        </div>
                        <input type="file" id="emFileInput" multiple accept=".xlsx, .xls" style="display: none;">
                    </div>

                    <!-- 파일 목록 -->
                    <div class="em-file-list" id="emFileList"></div>
                </div>

                <div class="em-modal-footer">
                    <div class="em-btn-group">
                        <button class="em-btn em-btn-cancel" data-dismiss="modal">취소</button>
                        <button class="em-btn em-btn-submit" id="emSubmitBtn" onclick="uploadFiles()" disabled>등록하기</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // === 상세 모달 로직 ===
        function openDetailModal(ispcId) {
            $('#modal-route').text('');
            $('#modal-fclts').text('');
            $('#modal-date').text('');
            $('#modal-org').text('');
            $('#modal-gallery').empty();

            $.ajax({
                url: "/inspection/api/view",
                type: "GET",
                data: { id: ispcId },
                dataType: "json",
                success: function(data) {
                    if(data) {
                        $('#modal-route').text(data.routeDrnm);
                        $('#modal-fclts').text(data.fcltsNm);
                        var dateStr = "";
                        if(data.ispcDttm) {
                            var d = new Date(data.ispcDttm);
                            dateStr = d.getFullYear() + "년 " + 
                                      String(d.getMonth() + 1).padStart(2, '0') + "월 " + 
                                      String(d.getDate()).padStart(2, '0') + "일 " + 
                                      String(d.getHours()).padStart(2, '0') + "시 " + 
                                      String(d.getMinutes()).padStart(2, '0') + "분";
                        }
                        $('#modal-date').text(dateStr);
                        $('#modal-org').text(data.hdqrCd + " / " + data.mtnofCd);
                        if(data.files && data.files.length > 0) {
                            data.files.forEach(function(file) {
                                var html = '<div class="gallery-item">';
                                html += '<img src="/inspection/image/' + file.fileSeq + '" alt="점검사진">';
                                html += '<p>' + (file.attflNm || '') + '</p></div>';
                                $('#modal-gallery').append(html);
                            });
                        } else {
                            $('#modal-gallery').html('<p class="text-muted">등록된 사진이 없습니다.</p>');
                        }
                        $('#detailModal').modal('show');
                    }
                },
                error: function(e) {
                    alert("상세 정보를 불러오는데 실패했습니다.");
                }
            });
        }

        // === 엑셀 등록 모달 로직 (개선된 UI 적용) ===
        
        const emDropZone = document.getElementById('emDropZone');
        const emFileInput = document.getElementById('emFileInput');
        const emFileListContainer = document.getElementById('emFileList');
        const emSubmitBtn = document.getElementById('emSubmitBtn');
        
        let selectedFiles = [];

        function openUploadModal() {
            selectedFiles = [];
            updateUI();
            $('#emUploadStatus').hide();
            $('#uploadModal').modal('show');
        }

        // 클릭 이벤트
        emDropZone.addEventListener('click', function() {
            emFileInput.click();
        });

        // 드래그 이벤트
        ['dragover', 'dragleave', 'drop'].forEach(name => {
            emDropZone.addEventListener(name, (e) => { e.preventDefault(); e.stopPropagation(); });
        });

        emDropZone.addEventListener('dragover', () => emDropZone.classList.add('dragover'));
        emDropZone.addEventListener('dragleave', () => emDropZone.classList.remove('dragover'));

        emDropZone.addEventListener('drop', (e) => {
            emDropZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        emFileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        function handleFiles(files) {
            const validFiles = Array.from(files).filter(f => f.name.match(/\.(xlsx|xls)$/i));
            
            if (validFiles.length !== files.length) {
                alert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
            }

            if (selectedFiles.length + validFiles.length > 5) {
                alert('최대 5개까지만 등록 가능합니다.');
                return;
            }

            selectedFiles = [...selectedFiles, ...validFiles];
            updateUI();
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateUI();
        }

        function updateUI() {
            // 1. 드롭존 상태 변경 (Empty <-> Has-Files)
            if (selectedFiles.length > 0) {
                emDropZone.classList.replace('empty', 'has-files');
                emDropZone.querySelector('.desc-main').innerText = "파일 추가하기 (" + selectedFiles.length + "/5)";
                emFileListContainer.classList.add('active');
            } else {
                emDropZone.classList.replace('has-files', 'empty');
                emDropZone.querySelector('.desc-main').innerText = "파일을 드래그하거나 클릭하세요";
                emFileListContainer.classList.remove('active');
            }

            // 2. 리스트 렌더링
            emFileListContainer.innerHTML = selectedFiles.map((file, i) => `
                <div class="em-file-item">
                    <div class="em-file-icon"><i class="fa-solid fa-file-excel"></i></div>
                    <div class="em-file-details">
                        <span class="em-file-name">` + file.name + `</span>
                        <span class="em-file-size">` + (file.size / 1024).toFixed(1) + ` KB</span>
                    </div>
                    <button class="em-remove-btn" onclick="removeFile(` + i + `)">&times;</button>
                </div>
            `).join('');

            emSubmitBtn.disabled = selectedFiles.length === 0;
            emFileInput.value = ''; 
        }

        // 파일 서버 전송
        function uploadFiles() {
            if (selectedFiles.length === 0) return;

            // 로딩 오버레이 표시 (flex로 변경해야 중앙 정렬됨)
            $('#emUploadStatus').css('display', 'flex');
            emSubmitBtn.disabled = true;

            var promises = selectedFiles.map(function(file) {
                return new Promise(function(resolve, reject) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        resolve({
                            base64File: e.target.result,
                            fileName: file.name
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(promises).then(function(requests) {
                $.ajax({
                    type: "POST",
                    url: "/inspection/uploadMultipleAction",
                    data: JSON.stringify(requests),
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        $('#emUploadStatus').hide();
                        alert("총 " + requests.length + "건 등록 완료");
                        $('#uploadModal').modal('hide');
                        window.location.reload();
                    },
                    error: function (e) {
                        $('#emUploadStatus').hide();
                        emSubmitBtn.disabled = false;
                        alert("업로드 실패: " + (e.responseText || e.statusText));
                    }
                });
            }).catch(function(err) {
                $('#emUploadStatus').hide();
                emSubmitBtn.disabled = false;
                alert("파일 처리 오류");
                console.error(err);
            });
        }
    </script>
</body>
</html>
