<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Spring/JSP VWorld 지도</title>
    
    <link rel="stylesheet" href="https://openlayers.org/en/v3.20.1/css/ol.css" type="text/css">
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>
    
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    
    <style>
        html, body { margin: 0; height: 100%; width: 100%; overflow: hidden; font-family: 'Malgun Gothic', sans-serif; }
        #map { width: 100%; height: 100%; }
        
        /* 팝업(오버레이) 스타일 */
        .ol-popup {
            position: absolute; background-color: white; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            padding: 15px; border-radius: 10px; border: 1px solid #cccccc;
            bottom: 12px; left: -50px; min-width: 280px; user-select: none;
        }
        .ol-popup:after, .ol-popup:before {
            top: 100%; border: solid transparent; content: " "; height: 0; width: 0;
            position: absolute; pointer-events: none;
        }
        .ol-popup:after { border-top-color: white; border-width: 10px; left: 48px; margin-left: -10px; }
        .ol-popup:before { border-top-color: #cccccc; border-width: 11px; left: 48px; margin-left: -11px; }
        .ol-popup-closer {
            text-decoration: none;
            position: absolute;
            top: 2px;
            right: 8px;
            color: #1a73e8;
            font-weight: bold;
            transition: color 0.2s;
        }
        .ol-popup-closer:hover { color: #1557b0; }
        .ol-popup-closer:focus,
        .ol-popup-closer:active {
            color: #1557b0;
            outline: none;
            box-shadow: none;
        }
        .ol-popup-closer:after { content: "✖"; }
        #popup-content { font-size: 14px; margin-bottom: 10px; }

        /* 팝업 내 등록 버튼 스타일 */
        .map-register-btn {
            display: flex; align-items: center; justify-content: center; width: 100%; 
            padding: 8px 10px; font-size: 14px; font-weight: bold; color: #1a73e8; 
            background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; 
            cursor: pointer; transition: background-color 0.2s;
        }
        .map-register-btn:hover { background-color: #f8f9fa; }
        .map-register-btn:focus,
        .map-register-btn:active {
            background-color: #e8f0fe;
            border-color: #1a73e8;
            color: #1557b0;
            outline: none;
            box-shadow: none;
        }
        .map-register-btn .fas { margin-right: 6px; }

        /* 모달 스타일 */
        .modal-content { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .modal-header { border-bottom: 1px solid #f0f0f0; }
        #submit-btn { border-radius: 8px; font-weight: bold; background-color: #1a73e8; border-color: #1a73e8; }
        #submit-btn[disabled] { cursor: not-allowed; opacity: 0.75; }
        .readonly-field { background-color: #f8f9fa; }
        .form-section-title { font-size: 13px; font-weight: 600; color: #5f6368; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
        .recent-table-wrapper { max-height: 220px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; }
        #register-alert { border-radius: 8px; font-size: 13px; }
        
        /* ✅ 토스트 메시지 스타일 */
        .toast-message {
            display: none; position: absolute; top: 20px; left: 50%;
            transform: translateX(-50%); z-index: 1002;
            background-color: rgba(0, 0, 0, 0.75); color: white;
            padding: 12px 20px; border-radius: 20px; font-size: 14px;
            font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: none;
        }
        .toast-message .fas { margin-right: 8px; }
    </style>
</head>
<body>
    <div id="map"></div>

    <div id="toast-message" class="toast-message">
        <i class="fas fa-search-plus"></i> 지도를 더 확대하여 영역을 선택해주세요.
    </div>

    <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content"></div>
        <button id="popup-register-btn" class="map-register-btn">
            <i class="fas fa-plus"></i>이 위치 등록
        </button>
    </div>

    <jsp:include page="register-modal.jsp" />
    
    <script type="text/javascript">
        var selectedProperties = null;
        var selectedFeature = null;
        var selectedRegionData = null;

        function getFirstAvailable(props, keys) {
            if (!props) { return null; }
            for (var i = 0; i < keys.length; i++) {
                var value = props[keys[i]];
                if (value !== undefined && value !== null) {
                    var trimmed = String(value).trim();
                    if (trimmed.length > 0) {
                        return trimmed;
                    }
                }
            }
            return null;
        }

        function roundCoord(value) {
            var num = Number(value);
            if (isNaN(num)) {
                return null;
            }
            return Math.round(num * 1000000) / 1000000;
        }

        function computeGeometryCenter(feature) {
            if (!feature) { return null; }
            var geometry = feature.getGeometry();
            if (!geometry) { return null; }
            var type = geometry.getType();
            if (type === 'Point') {
                return geometry.getCoordinates();
            }
            if (geometry.getInteriorPoint) {
                return geometry.getInteriorPoint().getCoordinates();
            }
            if (ol.extent && geometry.getExtent) {
                return ol.extent.getCenter(geometry.getExtent());
            }
            return null;
        }

        function buildRegionData(props, feature) {
            var region = {};
            region.address = getFirstAvailable(props, ['addr', 'address', 'full_addr', 'fullname']);
            region.roadAddress = getFirstAvailable(props, ['road_address', 'roadAddr', 'road_address_name']);
            region.jibunAddress = getFirstAvailable(props, ['jibun', 'jibun_address', 'land_address']);
            region.pnu = getFirstAvailable(props, ['pnu', 'PNU']);
            region.sido = getFirstAvailable(props, ['sido', 'sidoNm', 'sido_nm', 'sido_name']);
            region.sigungu = getFirstAvailable(props, ['sigungu', 'sigunguNm', 'sigungu_nm', 'sgg_nm']);
            region.eupmyeondong = getFirstAvailable(props, ['eupmyeondong', 'emd', 'emdNm', 'emd_nm', 'dong_nm']);
            region.ri = getFirstAvailable(props, ['ri', 'riNm', 'ri_nm']);

            var center = computeGeometryCenter(feature);
            if (center) {
                var wgs84 = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
                region.longitude = roundCoord(wgs84[0]);
                region.latitude = roundCoord(wgs84[1]);
            } else {
                region.longitude = roundCoord(getFirstAvailable(props, ['x', 'lon', 'longitude']));
                region.latitude = roundCoord(getFirstAvailable(props, ['y', 'lat', 'latitude']));
            }

            return region;
        }

        function escapeHtml(value) {
            if (value === undefined || value === null) {
                return '';
            }
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function buildPopupContent(region) {
            if (!region) {
                return '<span>선택된 정보를 불러올 수 없습니다.</span>';
            }
            var admin = [region.sido, region.sigungu, region.eupmyeondong].filter(Boolean).join(' ');
            var html = '<div><strong>주소:</strong> ' + escapeHtml(region.address || '-') + '</div>';
            if (region.pnu) {
                html += '<div><strong>PNU:</strong> ' + escapeHtml(region.pnu) + '</div>';
            }
            if (admin) {
                html += '<div><strong>행정 구역:</strong> ' + escapeHtml(admin) + '</div>';
            }
            if (region.latitude && region.longitude) {
                html += '<div><strong>좌표:</strong> ' + region.latitude + ', ' + region.longitude + '</div>';
            }
            return html;
        }

        function fillRegisterForm(region) {
            $('#addressInput').val(region.address || '');
            $('#roadAddressInput').val(region.roadAddress || '');
            $('#jibunAddressInput').val(region.jibunAddress || '');
            $('#pnuInput').val(region.pnu || '');
            $('#sidoInput').val(region.sido || '');
            $('#sigunguInput').val(region.sigungu || '');
            $('#eupmyeondongInput').val(region.eupmyeondong || '');
            $('#riInput').val(region.ri || '');
            $('#latitudeInput').val(region.latitude != null ? region.latitude : '');
            $('#longitudeInput').val(region.longitude != null ? region.longitude : '');
        }

        function resetRegisterForm() {
            $('#registerForm')[0].reset();
            $('#latitudeInput').val('');
            $('#longitudeInput').val('');
            clearRegisterAlert();
        }

        function toggleSubmitLoading(isLoading) {
            var $btn = $('#submit-btn');
            if (isLoading) {
                $btn.data('original-text', $btn.text());
                $btn.prop('disabled', true).text('저장 중...');
            } else {
                var original = $btn.data('original-text') || '저장하기';
                $btn.prop('disabled', false).text(original);
            }
        }

        function showRegisterAlert(type, message) {
            var $alert = $('#register-alert');
            $alert.removeClass('alert-success alert-danger alert-warning alert-info');
            $alert.addClass('alert alert-' + type).text(message).fadeIn(150);
        }

        function clearRegisterAlert() {
            $('#register-alert').hide().text('').removeClass('alert alert-success alert-danger alert-warning alert-info');
        }

        function formatDateTime(value) {
            if (!value) {
                return '';
            }
            try {
                var date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleString('ko-KR', { hour12: false });
                }
            } catch (e) {
                console.warn('날짜 포매팅 실패', e);
            }
            return value;
        }

        function renderRecentTable(items) {
            var $tbody = $('#recentRegionBody');
            $tbody.empty();
            if (!items || items.length === 0) {
                $tbody.append('<tr><td colspan="4" class="text-center text-muted">등록된 지역이 없습니다.</td></tr>');
                return;
            }
            items.forEach(function(item) {
                var adminLabel = [item.sido, item.sigungu, item.eupmyeondong].filter(Boolean).join(' ');
                var latValue = parseFloat(item.latitude);
                var lonValue = parseFloat(item.longitude);
                var hasCoords = !isNaN(latValue) && !isNaN(lonValue);
                var coord = hasCoords ? latValue.toFixed(5) + ', ' + lonValue.toFixed(5) : '-';
                var rowHtml = '<tr>' +
                    '<td>' + escapeHtml(item.address || '-') + '</td>' +
                    '<td>' + escapeHtml(adminLabel || '-') + '</td>' +
                    '<td>' + escapeHtml(coord) + '</td>' +
                    '<td>' + escapeHtml(formatDateTime(item.createdAt)) + '</td>' +
                    '</tr>';
                $tbody.append(rowHtml);
            });
        }

        function loadRecentRegions() {
            var $tbody = $('#recentRegionBody');
            $tbody.html('<tr><td colspan="4" class="text-center text-muted">불러오는 중...</td></tr>');
            $.ajax({
                url: '/regions/recent',
                method: 'GET',
                dataType: 'json',
                data: { limit: 5 }
            }).done(function(data) {
                renderRecentTable(data);
            }).fail(function() {
                $tbody.html('<tr><td colspan="4" class="text-center text-danger">최근 데이터를 불러오지 못했습니다.</td></tr>');
            });
        }

        function registerModalEvents() {
            $('#registerModal').on('shown.bs.modal', function() {
                loadRecentRegions();
                $('#memoInput').trigger('focus');
            });
            $('#registerModal').on('hidden.bs.modal', function() {
                resetRegisterForm();
                $('#recentRegionBody').html('<tr><td colspan="4" class="text-center text-muted">등록된 지역이 없습니다.</td></tr>');
            });
        }

        window.onload = function() {
            var VWORLD_API_KEY = "B13ADD16-4164-347A-A733-CD9022E8FB3B";

            var view = new ol.View({
                center: ol.proj.transform([126.9780, 37.5665], 'EPSG:4326', 'EPSG:3857'),
                zoom: 17
            });
            var baseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({ url: 'https://api.vworld.kr/req/wmts/1.0.0/' + VWORLD_API_KEY + '/Base/{z}/{y}/{x}.png' })
            });
            var cadastralLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://api.vworld.kr/req/wms',
                    params: { 'LAYERS': 'lp_pa_cbnd_bubun', 'STYLES': 'lp_pa_cbnd_bubun', 'CRS': 'EPSG:3857', 'FORMAT': 'image/png', 'TRANSPARENT': true, 'KEY': VWORLD_API_KEY }
                })
            });
            var highlightStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(0, 153, 255, 0.8)', width: 3 }),
                fill: new ol.style.Fill({ color: 'rgba(0, 153, 255, 0.1)' })
            });
            var highlightSource = new ol.source.Vector();
            var highlightLayer = new ol.layer.Vector({
                source: highlightSource, style: highlightStyle, zIndex: 1
            });

            var map = new ol.Map({
                target: 'map', layers: [baseLayer, cadastralLayer, highlightLayer], view: view
            });

            var container = document.getElementById('popup');
            var content = document.getElementById('popup-content');
            var closer = document.getElementById('popup-closer');
            var overlay = new ol.Overlay({
                element: container, autoPan: true, autoPanAnimation: { duration: 250 }
            });
            map.addOverlay(overlay);
            closer.onclick = function() {
                overlay.setPosition(undefined);
                closer.blur();
                selectedProperties = null;
                selectedFeature = null;
                selectedRegionData = null;
                return false;
            };

            map.on('singleclick', function(evt) {
                var currentZoom = view.getZoom();

                if (currentZoom < 18) {
                    highlightSource.clear();
                    overlay.setPosition(undefined);

                    var toast = $('#toast-message');
                    toast.stop().fadeIn(400, function() {
                        setTimeout(function() { toast.fadeOut(400); }, 2000);
                    });
                    return;
                }

                var coordinate = evt.coordinate;
                overlay.setPosition(undefined);
                selectedProperties = null;
                selectedFeature = null;
                selectedRegionData = null;

                var viewResolution = map.getView().getResolution();
                var source = cadastralLayer.getSource();
                var url = source.getGetFeatureInfoUrl(
                    coordinate,
                    viewResolution,
                    'EPSG:3857',
                    { 'INFO_FORMAT': 'application/json', 'QUERY_LAYERS': 'lp_pa_cbnd_bubun', 'FEATURE_COUNT': 1, 'domain': 'http://localhost', 'info_format': 'text/javascript' }
                );

                if (url) {
                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        jsonpCallback: 'parseResponse'
                    }).done(function(json) {
                        highlightSource.clear();
                        if (json.features && json.features.length > 0) {
                            var featureData = json.features[0];
                            selectedProperties = featureData.properties || {};
                            var format = new ol.format.GeoJSON();
                            selectedFeature = format.readFeature(featureData, {
                                dataProjection: 'EPSG:3857',
                                featureProjection: 'EPSG:3857'
                            });
                            highlightSource.addFeature(selectedFeature);
                            selectedRegionData = buildRegionData(selectedProperties, selectedFeature);
                            content.innerHTML = buildPopupContent(selectedRegionData);
                            overlay.setPosition(coordinate);
                        } else {
                            selectedProperties = null;
                            selectedFeature = null;
                            selectedRegionData = null;
                            content.innerHTML = '<span>선택한 위치의 지적 정보가 없습니다.</span>';
                            overlay.setPosition(coordinate);
                        }
                    }).fail(function(err) {
                        console.error('GetFeatureInfo Error:', err);
                        highlightSource.clear();
                        overlay.setPosition(undefined);
                    });
                }
            });

            $('#popup-register-btn').on('click', function() {
                if (selectedRegionData) {
                    fillRegisterForm(selectedRegionData);
                    $('#memoInput').val('');
                    clearRegisterAlert();
                    $('#registerModal').modal('show');
                } else {
                    alert('등록할 정보가 없습니다. 지도를 다시 클릭해주세요.');
                }
            });

            $('#submit-btn').on('click', function() {
                var payload = {
                    address: $('#addressInput').val(),
                    roadAddress: $('#roadAddressInput').val(),
                    jibunAddress: $('#jibunAddressInput').val(),
                    pnu: $('#pnuInput').val(),
                    sido: $('#sidoInput').val(),
                    sigungu: $('#sigunguInput').val(),
                    eupmyeondong: $('#eupmyeondongInput').val(),
                    ri: $('#riInput').val(),
                    latitude: $('#latitudeInput').val() ? Number($('#latitudeInput').val()) : null,
                    longitude: $('#longitudeInput').val() ? Number($('#longitudeInput').val()) : null,
                    memo: $('#memoInput').val()
                };

                if (!payload.address) {
                    showRegisterAlert('warning', '주소 정보가 없습니다. 지도를 다시 선택해주세요.');
                    return;
                }

                toggleSubmitLoading(true);
                $.ajax({
                    url: '/regions',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload)
                }).done(function() {
                    showRegisterAlert('success', '선택 지역 정보가 저장되었습니다.');
                    loadRecentRegions();
                    $('#memoInput').val('');
                }).fail(function(xhr) {
                    var message = '저장 중 오류가 발생했습니다.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        message = xhr.responseJSON.message;
                    }
                    showRegisterAlert('danger', message);
                }).always(function() {
                    toggleSubmitLoading(false);
                });
            });

            registerModalEvents();
        };
    </script>
</body>
</html>