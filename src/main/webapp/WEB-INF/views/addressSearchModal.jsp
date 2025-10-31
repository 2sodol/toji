<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>VWorld 주소 검색 모달</title>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<style>
.address-modal {
    display: none; 
    position: fixed; 
    z-index: 1000; 
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto; 
    background-color: rgba(0,0,0,0.4); 
}

.address-modal-content {
    background-color: #fff;
    margin: 8% auto;
    padding: 25px; 
    border: none;
    width: 90%;
    max-width: 500px;
    border-radius: 6px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
}

.address-modal-close {
    color: #888;
    float: right;
    font-size: 28px;
    font-weight: normal;
    transition: color 0.2s;
}

.address-modal-close:hover {
    color: #333;
    cursor: pointer;
}

.address-modal-title {
    font-size: 22px; 
    color: #222;
    margin-bottom: 20px;
    font-weight: 700;
}

/* --- 2. 검색 폼 (깔끔한 라인 스타일) --- */
.address-modal-search-form {
    display: flex;
    margin-bottom: 15px;
}

.address-modal-search-form input[type="text"] {
    flex-grow: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-right: none;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
    outline: none;
    background-color: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.address-modal-search-form input[type="text"]:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 1px #007bff inset;
}

.address-modal-search-form button {
    padding: 10px 18px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s;
}

.address-modal-search-form button:hover {
    background-color: #0056b3;
}

/* --- 3. 결과 영역 및 리스트 (명확한 구획) --- */
.address-modal-result-count { 
    font-size: 14px; 
    text-align: left; 
    color: #666;
    margin-bottom: 10px;
    padding-left: 0; 
    font-weight: 500;
}

.address-modal-list {
    list-style: none;
    padding: 0;
    max-height: 350px; 
    overflow-y: auto;
    border-radius: 4px; 
    margin-bottom: 15px; 
    border: 1px solid #e0e0e0; /* 전체 리스트 테두리 추가 */
}

/* 스크롤바 커스터마이징 */
.address-modal-list::-webkit-scrollbar { width: 6px; }
.address-modal-list::-webkit-scrollbar-thumb { background-color: #c0c0c0; border-radius: 3px; }
.address-modal-list::-webkit-scrollbar-track { background-color: #f7f7f7; }


.address-modal-list li {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0; 
    cursor: pointer;
    transition: background-color 0.15s;
}

.address-modal-list li:last-child {
    border-bottom: none;
}

.address-modal-list li:hover {
    background-color: #f8f8f8;
}

/* 주소 유형 레이블 스타일링 */
.address-modal-type-label {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    color: #007bff;
    background-color: #e0f0ff;
    padding: 2px 2px;
    border-radius: 3px;
    margin-right: 8px;
    
    /* ★★★ 수정된 부분: 레이블 너비를 고정하여 정렬합니다. ★★★ */
    min-width: 48px; /* 너비 조정 (폰트 크기에 따라 적절한 값 설정) */
    text-align: center; /* 텍스트를 중앙 정렬하여 시각적 균형 유지 */
}


/* 주소 텍스트 스타일 */
.address-modal-main-address {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
    font-weight: 400;
}

.address-modal-sub-address {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
    font-weight: 400;
}

/* --- 4. 페이징 영역 --- */
.address-modal-pagination-area {
    text-align: center;
    margin-top: 15px;
}

.address-modal-page-btn {
    padding: 8px 13px;
    margin: 0 3px;
    border: 1px solid #ddd;
    background-color: #fff;
    color: #555;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;
    font-size: 14px;
}

.address-modal-page-btn:hover {
    background-color: #f0f0f0;
}

.address-modal-page-btn.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
    font-weight: 600;
}
.address-modal-page-edge {
    font-size: 14px;
    padding: 8px 11px;
}

/* 기타 메시지 스타일 */
.address-modal-initial-message, .address-modal-no-results, .address-modal-loading, .address-modal-error {
    padding: 15px;
    text-align: center;
    font-size: 15px;
    color: #666;
    border-radius: 4px;
    margin-bottom: 15px;
}
.address-modal-loading { 
    color: #007bff; 
    font-weight: 500;
}
.address-modal-error { 
    color: #dc3545; 
    background-color: #ffebeb;
    border: 1px solid #dc3545;
}
</style>
</head>
<body>

<button onclick="openAddressModal()">주소 검색</button>

<div id="addressSearchModal" class="address-modal">
  <div class="address-modal-content">
    <span class="address-modal-close" onclick="closeAddressModal()">&times;</span>
    <h2 class="address-modal-title">주소 검색</h2>

    <div class="address-modal-search-form">
      <input type="text" id="searchQuery" placeholder="예: 경상북도 김천시 율곡동 1213" required>
      <button onclick="searchAddress(1)">검색</button>
    </div>

    <div id="searchResults">
      <p id="initialMessage">검색어를 입력하고 검색 버튼을 눌러주세요.</p>
    </div>
    
    <div id="pagination" class="address-modal-pagination-area">
    </div>

  </div>
</div>

<script>
// VWorld API 설정
var VWORLD_API_URL = "https://api.vworld.kr/req/search";
var VWORLD_API_KEY = "F0529714-44EF-31EC-BCD3-9BB544307DDB";
var RESULT_SIZE = 10;

// 모달 열기/닫기 함수
function openAddressModal() {
    document.getElementById('addressSearchModal').style.display = 'block';
    $('#searchResults').html('<p class="address-modal-initial-message">검색어를 입력하고 검색 버튼을 눌러주세요.</p>');
    $('#pagination').empty();
    // 모달을 열 때 검색어 입력 필드에 포커스
    $('#searchQuery').focus(); 
}

function closeAddressModal() {
    document.getElementById('addressSearchModal').style.display = 'none';
}

// 주소 검색 함수
function searchAddress(page) {
    var query = $('#searchQuery').val().trim();
    if (!query) {
        alert('검색어를 입력해주세요.');
        return;
    }

    $('#searchResults').html('<p class="address-modal-loading">검색 중입니다... 🔍</p>');
    $('#pagination').empty();

    // VWorld API 파라미터 설정
    var apiUrl = VWORLD_API_URL + 
        "?service=search" +
        "&request=search" +
        "&version=2.0" +
        "&crs=EPSG:900913" +
        "&size=" + RESULT_SIZE +
        "&page=" + page +
        "&query=" + encodeURIComponent(query) +
        "&type=address" +
        "&category=parcel" +
        "&format=json" +
        "&errorformat=json" +
        "&key=" + VWORLD_API_KEY;
    
    $.ajax({
        url: apiUrl,
        method: 'GET',
        dataType: 'jsonp',
        success: function(response) {
            var currentPage = parseInt(page || 1);
            handleSearchResults(response, currentPage, query);
        },
        error: function(xhr, status, error) {
            console.error("API 호출 실패:", status, error);
            $('#searchResults').html('<p class="address-modal-error">주소 검색에 실패했습니다.</p>');
            $('#pagination').empty();
        }
    });
}

// 검색 결과를 처리하고 화면에 표시하는 함수
function handleSearchResults(response, currentPage, searchQuery) {
    var resultElement = $('#searchResults');
    resultElement.empty();
    $('#pagination').empty(); 

    // API 응답 구조 확인
    if (!response || !response.response || !response.response.result) {
        resultElement.html('<p class="address-modal-no-results">검색 결과를 가져올 수 없습니다. 🤔</p>');
        return;
    }

    var result = response.response.result;
    var items = result.items || [];
    var totalCount = parseInt(response.response.record ? response.response.record.total : 0);

    if (response.response.status !== 'OK' || totalCount === 0 || !items || items.length === 0) {
        resultElement.html('<p class="address-modal-no-results">검색어에 해당하는 주소가 없거나 오류가 발생했습니다. 🤔</p>');
        return;
    }

    // 결과 목록 표시
    var html = '<ul class="address-modal-list">';
    $.each(items, function(index, item) {
        // API 응답에서 주소 정보 추출
        var roadName = item.address ? item.address.road || '' : '';
        var parcelAddress = item.address ? item.address.parcel || '' : '';
        var bldnm = (item.address && item.address.bldnm) ? ' (' + item.address.bldnm + ')' : '';
        var zipcode = item.address ? item.address.zipcode || '' : '';

        // 도로명 주소 표시 문자열 (값이 없으면 빈 문자열)
        var roadDisplay = '';
        if (roadName.length > 0) {
            roadDisplay = '<span class="address-modal-type-label">도로명</span> ' + roadName + bldnm;
        }

        // 지번 주소 표시 문자열 (값이 없으면 빈 문자열)
        var parcelDisplay = '';
        if (parcelAddress.length > 0) {
            parcelDisplay = '<span class="address-modal-type-label">지번</span> ' + parcelAddress;
        }

        // API 응답 형식에 맞게 item 객체 재구성
        var formattedItem = {
            id: item.id || '',
            address: {
                zipcode: zipcode,
                road: roadName,
                parcel: parcelAddress,
                bldnm: item.address ? item.address.bldnm || '' : ''
            },
            point: {
                x: item.point ? item.point.x || '' : '',
                y: item.point ? item.point.y || '' : ''
            }
        };

        html += '<li onclick="selectAddress(' + JSON.stringify(formattedItem) + ')">';
        
        if (roadDisplay.length > 0) {
            html += '<div class="address-modal-main-address">' + roadDisplay + '</div>';
        }

        if (parcelDisplay.length > 0) {
            html += '<div class="address-modal-sub-address">' + parcelDisplay + '</div>';
        }
        
        html += '</li>';
    });
    html += '</ul>';

    resultElement.html(html);
    resultElement.prepend('<p class="address-modal-result-count">총 <strong>' + totalCount + '</strong>건의 결과가 검색되었습니다.</p>');

    // 페이징 처리
    var totalPages = Math.ceil(totalCount / RESULT_SIZE);
    renderPagination(totalPages, currentPage);
}

// 주소 선택 함수 (item 객체를 통째로 받아서 처리)
function selectAddress(item) {
    // item 객체에서 필요한 정보 추출
    var zipcode = item.address.zipcode || '';
    var roadAddress = item.address.road || '';
    var parcelAddress = item.address.parcel || '';
    var bldnm = item.address.bldnm || '';
    
    // 도로명 주소에 건물명이 있으면 추가
    if (bldnm) {
        roadAddress += ' (' + bldnm + ')';
    }
    
    // 부모 페이지로 주소 정보 전달
    if (window.parent && window.parent.receiveSelectedAddress) {
        window.parent.receiveSelectedAddress({
            id: item.id || '',  // 주소 검색 응답의 ID
            zipcode: zipcode,
            roadAddress: roadAddress,
            parcelAddress: parcelAddress,
            coordinates: {
                x: item.point?.x || '',
                y: item.point?.y || ''
            },
            fullItem: item
        });
    } else {
        alert('선택된 주소:\n우편번호: ' + zipcode + '\n도로명: ' + roadAddress + '\n지번: ' + parcelAddress);
    }
    
    closeAddressModal();
}

// 페이징 버튼 생성 함수
function renderPagination(totalPages, currentPage) {
    if (totalPages < 2) return;
    
    var pageGroupSize = 5;
    var currentGroup = Math.ceil(currentPage / pageGroupSize);
    
    var startPage = (currentGroup - 1) * pageGroupSize + 1;
    var endPage = currentGroup * pageGroupSize;

    if (endPage > totalPages) {
        endPage = totalPages;
    }

    var paginationHtml = '';
    
    if (startPage > 1) {
        paginationHtml += '<button onclick="searchAddress(1)" class="address-modal-page-btn address-modal-page-edge">&lt;&lt;</button>';
        paginationHtml += '<button onclick="searchAddress(' + (startPage - 1) + ')" class="address-modal-page-btn">&lt;</button>';
    }

    for (var i = startPage; i <= endPage; i++) {
        var className = (i === currentPage) ? ' address-modal-page-btn active' : ' address-modal-page-btn';
        paginationHtml += '<button onclick="searchAddress(' + i + ')" class="' + className + '">' + i + '</button>';
    }

    if (endPage < totalPages) {
        paginationHtml += '<button onclick="searchAddress(' + (endPage + 1) + ')" class="address-modal-page-btn">&gt;</button>';
        paginationHtml += '<button onclick="searchAddress(' + totalPages + ')" class="address-modal-page-btn address-modal-page-edge">&gt;&gt;</button>';
    }

    $('#pagination').html(paginationHtml);
}

// ESC 키로 모달 닫기
$(document).keyup(function(e) {
    if (e.key === "Escape") { 
        closeAddressModal();
    }
});
</script>

</body>
</html>