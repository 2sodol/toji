<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Spring/JSP VWorld 지도</title>
    
    <!-- OpenLayers 지도 렌더링 관련 CSS / JS -->
    <link rel="stylesheet" href="https://openlayers.org/en/v3.20.1/css/ol.css" type="text/css">
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>
    
    <!-- UI 구성 및 아이콘 사용을 위한 외부 라이브러리 -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="<%=request.getContextPath()%>/resources/css/index.css">
</head>
 <body>
    <!-- 지도 렌더링 컨테이너 -->
    <div id="map"></div>

    <!-- 줌 안내 토스트 메시지 -->
    <div id="toast-message" class="toast-message">
        <i class="fas fa-search-plus"></i> 지도를 더 확대하여 영역을 선택해주세요.
    </div>

    <!-- 지도 선택 결과를 보여주는 팝업 -->
    <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content"></div>
        <button id="popup-register-btn" class="map-register-btn">
            <i class="fas fa-plus"></i>이 위치 등록
        </button>
    </div>

    <!-- 등록 모달 JSP 포함 -->
    <jsp:include page="register-modal.jsp" />
    <script src="<%=request.getContextPath()%>/resources/js/register.js"></script>
    
    <script type="text/javascript">
        // 지도에서 선택된 피처 및 속성 정보 저장용 전역 변수
        var selectedProperties = null;
        var selectedFeature = null;
        var selectedRegionData = null;

        // props 객체에서 사용할 수 있는 첫 번째 키 값을 반환
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

        // 좌표값 반올림 처리 (소수점 6자리)
        function roundCoord(value) {
            var num = Number(value);
            if (isNaN(num)) {
                return null;
            }
            return Math.round(num * 1000000) / 1000000;
        }

        // 팝업 및 등록 폼에서 사용될 주소 데이터 구성
        function buildRegionData(props, feature) {
            var region = {};
            region.address = getFirstAvailable(props, ['addr', 'address', 'full_addr', 'fullname']);
            region.jibunAddress = getFirstAvailable(props, ['jibun', 'jibun_address', 'land_address']);

            return region;
        }

        // 팝업에 표시할 내용을 HTML 템플릿으로 반환
        function buildPopupContent(region) {
            if (!region) {
                return '<span>선택된 정보를 불러올 수 없습니다.</span>';
            }
            return escapeHtml(region.address || '-') + '</div>';
        }

        // 등록 모달 폼에 선택된 지역 데이터를 채움
        function fillRegisterForm(region) {
            if (!region) {
                return;
            }
            var resolvedAddress = region.address || region.jibunAddress || '';
            $('#detailAddressInput').val(resolvedAddress);
        }

        // 모달 폼을 초기 상태로 리셋
        window.onload = function() {
            // VWorld API 키 (임시 키 - 실제 서비스에서는 환경 변수로 관리 권장)
            var VWORLD_API_KEY = "B13ADD16-4164-347A-A733-CD9022E8FB3B";

            // 서울 시청 좌표를 기본 중심으로 하는 맵 뷰 설정
            var view = new ol.View({
                center: ol.proj.transform([126.9780, 37.5665], 'EPSG:4326', 'EPSG:3857'),
                zoom: 17
            });
            // 기본 지도 레이어
            var baseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({ url: 'https://api.vworld.kr/req/wmts/1.0.0/' + VWORLD_API_KEY + '/Base/{z}/{y}/{x}.png' })
            });
            // 지적편집도 레이어
            var cadastralLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://api.vworld.kr/req/wms',
                    params: { 'LAYERS': 'lp_pa_cbnd_bubun', 'STYLES': 'lp_pa_cbnd_bubun', 'CRS': 'EPSG:3857', 'FORMAT': 'image/png', 'TRANSPARENT': true, 'KEY': VWORLD_API_KEY }
                })
            });
            // 선택 영역 하이라이트 스타일
            var highlightStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(0, 153, 255, 0.8)', width: 3 }),
                fill: new ol.style.Fill({ color: 'rgba(0, 153, 255, 0.1)' })
            });
            var highlightSource = new ol.source.Vector();
            var highlightLayer = new ol.layer.Vector({
                source: highlightSource, style: highlightStyle, zIndex: 1
            });

            // 지도 객체 생성
            var map = new ol.Map({
                target: 'map', layers: [baseLayer, cadastralLayer, highlightLayer], view: view
            });

            // 팝업 관련 DOM 요소 레퍼런스
            var container = document.getElementById('popup');
            var content = document.getElementById('popup-content');
            var closer = document.getElementById('popup-closer');
            var overlay = new ol.Overlay({
                element: container, autoPan: true, autoPanAnimation: { duration: 250 }
            });
            map.addOverlay(overlay);
            
            // 팝업 닫기 버튼 이벤트
            closer.onclick = function() {
                overlay.setPosition(undefined);
                closer.blur();
                selectedProperties = null;
                selectedFeature = null;
                selectedRegionData = null;
                return false;
            };

            // 단일 클릭 시 지적 정보 조회
            map.on('singleclick', function(evt) {
                var currentZoom = view.getZoom();

                // 너무 낮은 줌 레벨에서는 토스트 메시지만 노출
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

                // WMS GetFeatureInfo 호출 URL 생성
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

            // 팝업 내 등록 버튼 클릭 시 모달 띄우기
            $('#popup-register-btn').on('click', function() {
                if (selectedRegionData) {
                    if (window.RegisterModule && typeof window.RegisterModule.fillForm === 'function') {
                        window.RegisterModule.fillForm(selectedRegionData);
                    }
                    if (window.RegisterModule && typeof window.RegisterModule.clearAlert === 'function') {
                        window.RegisterModule.clearAlert();
                    }
                    $('#registerModal').modal('show');
                } else {
                    alert('등록할 정보가 없습니다. 지도를 다시 클릭해주세요.');
                }
            });
        };
    </script>
</body>
</html>