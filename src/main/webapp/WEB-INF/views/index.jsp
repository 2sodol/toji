<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Spring/JSP VWorld 지도</title>
    
    <link rel="stylesheet" href="https://openlayers.org/en/v3.20.1/css/ol.css" type="text/css">
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>
    
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
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
        .ol-popup-closer { text-decoration: none; position: absolute; top: 2px; right: 8px; color: #333; }
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
        .map-register-btn .fa-plus { margin-right: 6px; }

        /* 모달 스타일 */
        .modal-content { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .modal-header { border-bottom: 1px solid #f0f0f0; }
        #submit-btn { border-radius: 8px; font-weight: bold; background-color: #1a73e8; border-color: #1a73e8; }
        
        /* ✅ 토스트 메시지 스타일 */
        .toast-message {
            display: none; position: absolute; top: 20px; left: 50%;
            transform: translateX(-50%); z-index: 1002;
            background-color: rgba(0, 0, 0, 0.75); color: white;
            padding: 12px 20px; border-radius: 20px; font-size: 14px;
            font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .toast-message .fa-magnifying-glass-plus { margin-right: 8px; }
    </style>
</head>
<body>
    <div id="map"></div>

    <div id="toast-message" class="toast-message">
        <i class="fa-solid fa-magnifying-glass-plus"></i> 지도를 더 확대하여 영역을 선택해주세요.
    </div>

    <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content"></div>
        <button id="popup-register-btn" class="map-register-btn">
            <i class="fa-solid fa-plus"></i>이 위치 등록
        </button>
    </div>

    <div class="modal fade" id="registerModal" tabindex="-1">
         <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">선택 지역 정보 등록</h5>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="addressInput">주소</label>
                            <input type="text" class="form-control" id="addressInput" readonly>
                        </div>
                        <div class="form-group">
                            <label for="memoInput">메모</label>
                            <textarea class="form-control" id="memoInput" rows="3" placeholder="추가 정보를 입력하세요"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
                    <button type="button" id="submit-btn" class="btn btn-primary">저장하기</button>
                </div>
            </div>
        </div>
    </div>
    
    <script type="text/javascript">
        var selectedProperties = null;

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
                    params: { 'LAYERS': 'lp_pa_cbnd_bubun', 'STYLES': 'lp_pa_cbnd_bubun', 'CRS': 'EPSG:3857', 'FORMAT': 'image/png', 'TRANSPARENT': true, 'KEY': VWORLD_API_KEY },
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
                overlay.setPosition(undefined); closer.blur(); return false;
            };

            // 지도 클릭 이벤트
            map.on('singleclick', function (evt) {
                // ✅ 줌 레벨 확인 기능 추가
                var currentZoom = view.getZoom();
                
                if (currentZoom < 18) {
                    highlightSource.clear();
                    overlay.setPosition(undefined);

                    var toast = $('#toast-message');
                    toast.stop().fadeIn(400, function() {
                        setTimeout(function() { toast.fadeOut(400); }, 2000);
                    });
                    return; // 함수 종료
                }

                var coordinate = evt.coordinate;
                overlay.setPosition(undefined);
                selectedProperties = null;
                
                var viewResolution = map.getView().getResolution();
                var source = cadastralLayer.getSource();
                var url = source.getGetFeatureInfoUrl(
                    coordinate, viewResolution, 'EPSG:3857',
                    { 'INFO_FORMAT': 'application/json', 'QUERY_LAYERS': 'lp_pa_cbnd_bubun', 'FEATURE_COUNT': 1, "domain" : "http://localhost", "info_format" : "text/javascript" }
                );

                if (url) {
                    $.ajax({
                        url: url, dataType: 'jsonp', jsonpCallback: 'parseResponse',
                        success: function (json) {
                            highlightSource.clear();
                            if (json.features && json.features.length > 0) {
                                var featureData = json.features[0];
                                selectedProperties = featureData.properties;
                                content.innerHTML = '<strong>주소:</strong> ' + selectedProperties.addr;
                                overlay.setPosition(coordinate);
                                var format = new ol.format.GeoJSON();
                                var feature = format.readFeature(featureData, {
                                    dataProjection: 'EPSG:3857', featureProjection: 'EPSG:3857'
                                });
                                highlightSource.addFeature(feature);
                            }
                        },
                        error: function (err) { 
                            console.error("GetFeatureInfo Error:", err); 
                        }
                    });
                }
            });
            
            // 팝업 등록 및 모달 저장 버튼 이벤트
            $('#popup-register-btn').on('click', function() {
                if (selectedProperties) {
                    $('#addressInput').val(selectedProperties.addr);
                    $('#memoInput').val('');
                    $('#registerModal').modal('show');
                } else {
                    alert('등록할 정보가 없습니다. 지도를 다시 클릭해주세요.');
                }
            });
            $('#submit-btn').on('click', function() {
                var formData = { address: $('#addressInput').val(), memo: $('#memoInput').val() };
                console.log("서버로 전송할 데이터:", formData);
                alert('저장되었습니다.');
                $('#registerModal').modal('hide');
            });
        };
    </script>
</body>
</html>