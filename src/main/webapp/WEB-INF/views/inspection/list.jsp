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
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap4.min.css">
    <style>
        .container { padding: 20px; max-width: 1200px; }
        .table-hover tbody tr { cursor: pointer; }
    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap4.min.js"></script>
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

        <table id="inspectionTable" class="table table-bordered table-hover">
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
                <!-- DataTables가 Ajax로 데이터를 로드하므로 비워둠 -->
            </tbody>
        </table>
    </div>

    <!-- 모달 Include -->
    <jsp:include page="modal/detailModal.jsp" />
    <jsp:include page="modal/uploadModal.jsp" />

    <script>
        $(document).ready(function() {
            $('#inspectionTable').DataTable({
                "serverSide": true, // 서버 사이드 처리 활성화
                "processing": true,
                "ajax": {
                    "url": "/inspection/api/list",
                    "type": "GET",
                    "data": function(d) {
                        // 필요한 경우 추가 파라미터 전송 가능
                    }
                },
                "columns": [
                    { "data": null, "render": function(data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1; // 순번 계산
                    }, "className": "text-center" },
                    { "data": "routeDrnm" },
                    { "data": "fcltsNm" },
                    { "data": "ispcDttm", "className": "text-center", "render": function(data) {
                        if(!data) return "";
                        var date = new Date(data);
                        return '<div style="font-weight: bold; color: #333;">' + 
                               date.getFullYear() + "-" + 
                               String(date.getMonth() + 1).padStart(2, '0') + "-" + 
                               String(date.getDate()).padStart(2, '0') + '</div>' +
                               '<small class="text-muted">' + 
                               String(date.getHours()).padStart(2, '0') + ":" + 
                               String(date.getMinutes()).padStart(2, '0') + '</small>';
                    }},
                    { "data": "fsttmRgstDttm", "className": "text-center", "render": function(data) {
                        if(!data) return "";
                        var date = new Date(data);
                        return date.getFullYear() + "-" + 
                               String(date.getMonth() + 1).padStart(2, '0') + "-" + 
                               String(date.getDate()).padStart(2, '0');
                    }}
                ],
                "createdRow": function(row, data, dataIndex) {
                    $(row).attr('onclick', "openInspectionDetailModal('" + data.ispcId + "')");
                    $(row).css('cursor', 'pointer');
                },
                "language": {
                    "emptyTable": "데이터가 없습니다.",
                    "lengthMenu": "_MENU_ 개씩 보기",
                    "info": "전체 _TOTAL_건 중 _START_ - _END_",
                    "infoEmpty": "데이터가 없습니다.",
                    "infoFiltered": "(전체 _MAX_건 중 검색결과)",
                    "search": "검색:",
                    "zeroRecords": "검색된 데이터가 없습니다.",
                    "loadingRecords": "로딩중...",
                    "processing": "처리중...",
                    "paginate": {
                        "first": "첫 페이지",
                        "last": "마지막 페이지",
                        "next": "다음",
                        "previous": "이전"
                    }
                },
                "order": [[3, "desc"]], // 점검일시 기준 내림차순
                "columnDefs": [
                    { "orderable": false, "targets": 0 } // 순번 정렬 비활성화
                ]
            });
        });
    </script>
</body>
</html>
