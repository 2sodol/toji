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
    // 부모 페이지의 모달 닫기 함수 호출
    if (window.parent && typeof window.parent.closeAddressSearchModal === 'function') {
        window.parent.closeAddressSearchModal();
    }
}

// 주소 검색 함수
function searchAddress(page) {
    var query = $('#searchQuery').val().trim();
    if (!query) {
        alert('검색어를 입력해주세요.');
        return;
    }

    var resultElement = $('#searchResults');
    var paginationElement = $('#pagination');

    // 버튼 비활성화
    paginationElement.find('button').prop('disabled', true);

    // 로딩 인디케이터 지연 표시 (300ms)
    // 짧은 요청에는 로딩을 표시하지 않아 깜빡임 방지
    var loadingTimer = setTimeout(function () {
        if (resultElement.find('.address-modal-list').length > 0 || resultElement.find('.address-modal-no-results').length > 0) {
            // 기존 결과가 있는 경우 오버레이 방식으로 로딩 표시
            resultElement.addClass('loading');
            if (resultElement.find('.address-modal-loading-overlay').length === 0) {
                resultElement.append('<div class="address-modal-loading-overlay"><div class="address-modal-spinner"></div></div>');
            }
        } else {
            // 초기 상태인 경우 로딩 스피너로 교체
            resultElement.html('<div class="address-modal-loading"><div class="address-modal-spinner"></div></div>');
        }
    }, 300);

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
        success: function (response) {
            // 로딩 타이머 취소 (빠른 응답 시 로딩 표시 안함)
            clearTimeout(loadingTimer);

            var currentPage = parseInt(page || 1);
            handleSearchResults(response, currentPage, query);
        },
        error: function (xhr, status, error) {
            // 로딩 타이머 취소
            clearTimeout(loadingTimer);

            console.error("API 호출 실패:", status, error);
            var resultElement = $('#searchResults');
            resultElement.removeClass('loading');
            resultElement.find('.address-modal-loading-overlay').remove();

            // 즉시 업데이트 (깜빡임 방지)
            resultElement.html('<p class="address-modal-error">주소 검색에 실패했습니다.</p>');
            resultElement.show();
            $('#pagination').empty();
        }
    });
}

// 검색 결과를 처리하고 화면에 표시하는 함수
function handleSearchResults(response, currentPage, searchQuery) {
    var resultElement = $('#searchResults');
    var paginationElement = $('#pagination');

    // 로딩 상태 제거
    resultElement.removeClass('loading');
    resultElement.find('.address-modal-loading-overlay').remove();

    // API 응답 구조 확인
    if (!response || !response.response || !response.response.result) {
        resultElement.html('<p class="address-modal-no-results">검색 결과를 가져올 수 없습니다. 🤔</p>');
        paginationElement.empty();
        return;
    }

    var result = response.response.result;
    var items = result.items || [];
    var totalCount = parseInt(response.response.record ? response.response.record.total : 0);

    if (response.response.status !== 'OK' || totalCount === 0 || !items || items.length === 0) {
        resultElement.html('<p class="address-modal-no-results">검색어에 해당하는 주소가 없거나 오류가 발생했습니다. 🤔</p>');
        paginationElement.empty();
        return;
    }

    // 결과 목록 표시
    var html = '<p class="address-modal-result-count">총 <strong>' + totalCount + '</strong>건의 결과가 검색되었습니다.</p>';
    html += '<ul class="address-modal-list">';
    $.each(items, function (index, item) {
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

        // data-item 속성에 JSON 문자열을 저장 (따옴표 충돌 방지를 위해 single quote 사용 및 내부 single quote escape 처리 필요하지만,
        // jQuery data()는 자동으로 처리해주지 않으므로, 여기서는 data-item에 넣을 때 escape 처리를 하거나,
        // 더 안전하게는 click 이벤트를 동적으로 바인딩하는 것이 좋음.
        // 하지만 문자열 연결 방식이므로, data-item에 넣을 때 single quote를 escape 처리하여 넣음.
        var jsonString = JSON.stringify(formattedItem).replace(/'/g, "&#39;");

        html += '<li class="address-item" data-item=\'' + jsonString + '\'>';

        if (roadDisplay.length > 0) {
            html += '<div class="address-modal-main-address">' + roadDisplay + '</div>';
        }

        if (parcelDisplay.length > 0) {
            html += '<div class="address-modal-sub-address">' + parcelDisplay + '</div>';
        }

        html += '</li>';
    });
    html += '</ul>';

    // 즉시 DOM 업데이트 (깜빡임 방지)
    resultElement.html(html);
    resultElement.show();

    // 동적으로 생성된 요소에 대한 클릭 이벤트 바인딩 (이벤트 위임 사용)
    // 기존에 바인딩된 이벤트가 있다면 제거 후 다시 바인딩 (중복 방지)
    resultElement.off('click', '.address-item').on('click', '.address-item', function () {
        var itemData = $(this).data('item');
        selectAddress(itemData);
    });

    // 페이징 처리
    var totalPages = Math.ceil(totalCount / RESULT_SIZE);
    renderPagination(totalPages, currentPage);
    paginationElement.show();
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
        paginationHtml += '<button onclick="searchAddress(1)" class="address-modal-page-btn address-modal-page-edge"><i class="fas fa-angle-double-left"></i></button>';
        paginationHtml += '<button onclick="searchAddress(' + (startPage - 1) + ')" class="address-modal-page-btn"><i class="fas fa-angle-left"></i></button>';
    }

    for (var i = startPage; i <= endPage; i++) {
        var className = (i === currentPage) ? ' address-modal-page-btn active' : ' address-modal-page-btn';
        paginationHtml += '<button onclick="searchAddress(' + i + ')" class="' + className + '">' + i + '</button>';
    }

    if (endPage < totalPages) {
        paginationHtml += '<button onclick="searchAddress(' + (endPage + 1) + ')" class="address-modal-page-btn"><i class="fas fa-angle-right"></i></button>';
        paginationHtml += '<button onclick="searchAddress(' + totalPages + ')" class="address-modal-page-btn address-modal-page-edge"><i class="fas fa-angle-double-right"></i></button>';
    }

    $('#pagination').html(paginationHtml);
}

// ESC 키로 모달 닫기
$(document).keyup(function (e) {
    if (e.key === "Escape") {
        closeAddressModal();
    }
});
