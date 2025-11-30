<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>VWorld 주소 검색 모달</title>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/addressSearchModal.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    </head>

    <body>

        <div id="addressSearchModal" class="address-modal" style="display: block;">
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

        <script src="${pageContext.request.contextPath}/resources/js/addressSearchModal.js"></script>

    </body>

    </html>