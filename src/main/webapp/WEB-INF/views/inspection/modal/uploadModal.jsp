<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style>
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

<!-- SheetJS 라이브러리 추가 (엑셀 파싱용) -->
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

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
    // === 엑셀 등록 모달 로직 (개선된 UI 적용) ===
    
    // 이 스크립트가 실행될 때 요소들이 존재해야 하므로, $(document).ready 안에 넣거나 
    // 모달이 로드된 후에 이벤트를 바인딩해야 하는데, 
    // jsp:include로 들어오면 페이지 로드 시점에 존재하므로 바로 실행 가능.
    // 하지만 안전하게 $(document).ready 안에 넣거나, 
    // 전역 변수 오염을 막기 위해 IIFE를 쓰거나 할 수 있음.
    // 여기서는 기존 코드 스타일을 따름.

    (function() {
        const emDropZone = document.getElementById('emDropZone');
        const emFileInput = document.getElementById('emFileInput');
        const emFileListContainer = document.getElementById('emFileList');
        const emSubmitBtn = document.getElementById('emSubmitBtn');
        
        let selectedFiles = [];

        // 전역 함수로 노출 (onclick="openUploadModal()" 등에서 사용)
        window.openUploadModal = function() {
            selectedFiles = [];
            updateUI();
            $('#emUploadStatus').hide();
            $('#uploadModal').modal('show');
        }

        // 클릭 이벤트
        if(emDropZone) {
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
        }

        if(emFileInput) {
            emFileInput.addEventListener('change', (e) => handleFiles(e.target.files));
        }

        // 파일 양식 검증 함수 (A1: 위치, A2: 시간, A3: 시설물)
        function validateExcelFile(file) {
            return new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        var data = new Uint8Array(e.target.result);
                        var workbook = XLSX.read(data, {type: 'array'});
                        
                        // 첫 번째 시트 가져오기
                        var firstSheetName = workbook.SheetNames[0];
                        var worksheet = workbook.Sheets[firstSheetName];
                        
                        // 셀 값 확인 (A1, A2, A3)
                        var cellA1 = worksheet['A1'] ? (worksheet['A1'].v || '').toString().trim() : '';
                        var cellA2 = worksheet['A2'] ? (worksheet['A2'].v || '').toString().trim() : '';
                        var cellA3 = worksheet['A3'] ? (worksheet['A3'].v || '').toString().trim() : '';
                        
                        // 검증 로직
                        if (cellA1 === '위치' && cellA2 === '시간' && cellA3 === '시설물') {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } catch (err) {
                        console.error("Excel parsing error:", err);
                        resolve(false);
                    }
                };
                reader.onerror = function() { resolve(false); };
                reader.readAsArrayBuffer(file);
            });
        }

        async function handleFiles(files) {
            const validFiles = Array.from(files).filter(f => f.name.match(/\.(xlsx|xls)$/i));
            
            if (validFiles.length !== files.length) {
                alert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
            }

            if (selectedFiles.length + validFiles.length > 5) {
                alert('최대 5개까지만 등록 가능합니다.');
                return;
            }

            // 양식 검증 진행
            $('#emUploadStatus').css('display', 'flex');
            
            var verifiedFiles = [];
            for (var i = 0; i < validFiles.length; i++) {
                var file = validFiles[i];
                var isValid = await validateExcelFile(file);
                
                if (isValid) {
                    verifiedFiles.push(file);
                } else {
                    alert("[" + file.name + "] 파일의 양식이 올바르지 않습니다.\n(필수: A1-위치, A2-시간, A3-시설물)");
                }
            }
            
            $('#emUploadStatus').hide();

            if (verifiedFiles.length > 0) {
                selectedFiles = [...selectedFiles, ...verifiedFiles];
                updateUI();
            }
        }

        // 전역 함수로 노출
        window.removeFile = function(index) {
            selectedFiles.splice(index, 1);
            updateUI();
        }

        function updateUI() {
            if(!emDropZone) return;

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

        // 파일 서버 전송 (전역 노출)
        window.uploadFiles = function() {
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
    })();
</script>

