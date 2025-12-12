<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
  <!DOCTYPE html>
  <html lang="ko">

  <head>
    <meta charset="UTF-8" />
    <title>Spring/JSP VWorld 지도</title>

    <!-- OpenLayers 지도 렌더링 관련 CSS / JS -->
    <link rel="stylesheet" href="https://openlayers.org/en/v3.20.1/css/ol.css" type="text/css" />
    <script src="https://openlayers.org/en/v3.20.1/build/ol.js"></script>

    <!-- UI 구성 및 아이콘 사용을 위한 외부 라이브러리 -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    <link rel="stylesheet" href="<%=request.getContextPath()%>/resources/css/index.css" />
    <link rel="stylesheet" href="<%=request.getContextPath()%>/resources/css/slide-panel.css" />
    <link rel="stylesheet" href="<%=request.getContextPath()%>/resources/css/inquiry-modal.css" />
  </head>

  <body>
    <!-- 슬라이드 패널 JSP 포함 -->
    <jsp:include page="slide-panel.jsp" />

    <!-- 주소 검색 버튼 (예시) -->
    <button onclick="openAddressSearchModal()"
      style="position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
      <i class="fas fa-search"></i> 주소 검색
    </button>

    <!-- 지도 렌더링 컨테이너 -->
    <div id="map"></div>

    <!-- 줌 안내 토스트 메시지 -->
    <div id="toast-message" class="toast-message">
      <i class="fas fa-search-plus"></i> 지도를 더 확대하여 영역을 선택해주세요.
    </div>

    <!-- 지도 선택 결과를 보여주는 팝업 -->
    <div id="ilgl-popup" class="ilgl-popup">
      <a href="#" id="ilgl-popup-closer" class="ilgl-popup-closer"></a>
      <div id="ilgl-popup-header" class="ilgl-popup-header">
        <h3 class="ilgl-popup-title">불법점용점검</h3>
      </div>
      <div id="ilgl-popup-content"></div>
      <div id="ilgl-popup-buttons">
        <button id="ilgl-popup-register-btn" class="ilgl-map-register-btn">
          <i class="fas fa-plus"></i>등록
        </button>
        <button id="ilgl-popup-inquiry-btn" class="ilgl-map-inquiry-btn" style="display: none">
          <i class="fas fa-search"></i>조회
        </button>
      </div>
    </div>

    <!-- 등록 모달 JSP 포함 -->
    <jsp:include page="register-modal.jsp" />

    <!-- 수정 모달 JSP 포함 -->
    <jsp:include page="modify-modal.jsp" />

    <!-- 조회 모달 JSP 포함 -->
    <jsp:include page="inquiry-modal.jsp" />

    <!-- 드론 원본 사진 탐색 모달 JSP 포함 -->
    <jsp:include page="drone_explorer_modal.jsp" />

    <!-- 주소 검색 모달 iframe -->
    <iframe id="addressSearchModalFrame" src="<%=request.getContextPath()%>/address-search-modal"
      style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 9999; background-color: rgba(0,0,0,0.4);">
    </iframe>

    <!-- ZIP 다운로드 및 파일 저장을 위한 라이브러리 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js"></script>

    <script src="<%=request.getContextPath()%>/resources/js/register.js"></script>
    <script src="<%=request.getContextPath()%>/resources/js/modify.js"></script>
    <script src="<%=request.getContextPath()%>/resources/js/slide-panel.js"></script>
    <script src="<%=request.getContextPath()%>/resources/js/inquiry-modal.js"></script>

    <script type="text/javascript">
      // ============================================
      // 상수 정의
      // ============================================
      var VWORLD_API_KEY = "B13ADD16-4164-347A-A733-CD9022E8FB3B";
      var LAYER_NAME = "lp_pa_cbnd_bubun";
      var MIN_ZOOM_LEVEL = 18;
      var DEFAULT_CENTER = [126.978, 37.5665]; // 서울 시청
      var DEFAULT_ZOOM = 17;

      // ============================================
      // 전역 변수
      // ============================================
      var selectedFeature = null;
      var selectedRegionData = null;

      // props 객체에서 사용할 수 있는 첫 번째 키 값을 반환
      function getFirstAvailable(props, keys) {
        if (!props) {
          return null;
        }
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

      // 폴리곤의 내부점을 계산하는 함수
      function getPolygonInteriorPoint(geometry) {
        try {
          var type = geometry.getType();
          if (type === "Polygon") {
            var coordinates = geometry.getCoordinates();
            if (coordinates && coordinates.length > 0) {
              // 첫 번째 링(외곽선)의 좌표들
              var ring = coordinates[0];
              if (ring && ring.length > 0) {
                // 폴리곤의 좌표들의 평균점 계산
                var sumX = 0;
                var sumY = 0;
                var count = 0;
                for (var i = 0; i < ring.length - 1; i++) {
                  // 마지막 점은 첫 번째 점과 같으므로 제외
                  sumX += ring[i][0];
                  sumY += ring[i][1];
                  count++;
                }
                if (count > 0) {
                  var avgX = sumX / count;
                  var avgY = sumY / count;

                  // extent 중심점과의 중간점을 사용하여 더 안전한 내부점 찾기
                  var extent = geometry.getExtent();
                  if (extent && extent.length >= 4) {
                    var center = ol.extent.getCenter(extent);
                    // 평균점과 중심점의 중간점 사용
                    var interiorX = (avgX + center[0]) / 2;
                    var interiorY = (avgY + center[1]) / 2;
                    return [interiorX, interiorY];
                  }
                  return [avgX, avgY];
                }
              }
            }
          } else if (type === "MultiPolygon") {
            // MultiPolygon의 경우 첫 번째 폴리곤 사용
            var coordinates = geometry.getCoordinates();
            if (coordinates && coordinates.length > 0) {
              return getPolygonInteriorPoint(
                new ol.geom.Polygon(coordinates[0])
              );
            }
          }
        } catch (e) {
          // 폴리곤 내부점 계산 실패
        }
        return null;
      }

      // 팝업 및 등록 폼에서 사용될 주소 데이터 구성
      // @param {Object} props - feature 속성
      // @param {ol.Feature} feature - OpenLayers feature 객체
      // @param {Array} coordinate - 좌표 [x, y]
      // @param {Boolean} useOriginalCoordinate - 원본 좌표를 그대로 사용할지 여부 (패널 호출 시 true)
      function buildRegionData(
        props,
        feature,
        coordinate,
        useOriginalCoordinate
      ) {
        var region = {};
        region.address = getFirstAvailable(props, [
          "addr",
          "address",
          "full_addr",
          "fullname",
        ]);
        region.jibunAddress = getFirstAvailable(props, [
          "jibun",
          "jibun_address",
          "land_address",
        ]);
        // PNU 값 추출
        region.pnu = getFirstAvailable(props, ["pnu", "PNU", "pnu_code"]);

        // 좌표 정보: feature의 geometry에서 폴리곤 내부점 계산하여 사용
        // 경계선 근처 클릭 시 인접 용지가 선택되는 문제 방지
        // 영역 등록 시 폴리곤 내부 좌표를 저장하기 위함
        // 단, useOriginalCoordinate가 true인 경우(패널 호출) 원본 좌표를 그대로 사용
        var safeCoordinate = coordinate;
        if (!useOriginalCoordinate && feature) {
          try {
            var geometry = feature.getGeometry();
            if (geometry) {
              // 폴리곤의 내부점 계산
              var interiorPoint = getPolygonInteriorPoint(geometry);
              if (
                interiorPoint &&
                Array.isArray(interiorPoint) &&
                interiorPoint.length >= 2
              ) {
                safeCoordinate = interiorPoint;
              } else {
                // 내부점 계산 실패 시 extent 중심점 사용
                var extent = geometry.getExtent();
                if (extent && extent.length >= 4) {
                  var center = ol.extent.getCenter(extent);
                  if (center && Array.isArray(center) && center.length >= 2) {
                    safeCoordinate = center;
                  }
                }
              }
            }
          } catch (e) {
            // 실패 시 원본 coordinate 사용
          }
        }

        // 좌표 저장
        if (
          safeCoordinate &&
          Array.isArray(safeCoordinate) &&
          safeCoordinate.length >= 2
        ) {
          region.coordinateX = safeCoordinate[0];
          region.coordinateY = safeCoordinate[1];
        }

        return region;
      }

      // 데이터 존재 여부 확인 후 팝업 버튼 업데이트 및 스타일 적용
      function checkDataExistenceAndUpdateButtons(pnu, feature) {
        if (!pnu) {
          resetPopupButtons();
          // feature에 데이터 없음 표시
          if (feature) {
            feature.set("hasData", false);
          }
          return;
        }

        // 캐시에 데이터가 있으면 즉시 UI 업데이트 (깜빡임 방지)
        if (window.dataExistenceCache.hasOwnProperty(pnu)) {
          var hasData = window.dataExistenceCache[pnu];
          updateUIWithDataExistence(hasData, feature);
          return;
        }

        // 캐시에 없으면 API 호출
        $.ajax({
          url: "/regions/dates",
          method: "GET",
          data: {
            lndsUnqNo: pnu,
            type: "detail",
          },
          dataType: "json",
        })
          .done(function (response) {
            var hasData = false;
            if (response.success && response.data && response.data.dates) {
              var dates = response.data.dates;
              hasData = Array.isArray(dates) && dates.length > 0;
            }

            // 캐시에 저장
            window.dataExistenceCache[pnu] = hasData;

            // UI 업데이트
            updateUIWithDataExistence(hasData, feature);
          })
          .fail(function (xhr, status, error) {
            console.warn("데이터 존재 여부 확인 실패:", status, error);
            // 실패 시에는 데이터 없음으로 처리하고 캐시에 저장하지 않음
            updateUIWithDataExistence(false, feature);
          });
      }

      // 데이터 존재 여부에 따라 UI 업데이트 (공통 함수)
      function updateUIWithDataExistence(hasData, feature) {
        if (hasData) {
          // 데이터가 존재하는 경우 - 등록 버튼과 조회 버튼 모두 표시
          showBothButtons();
          // feature에 데이터 있음 표시 (붉은색 테두리)
          if (feature) {
            feature.set("hasData", true);
            feature.changed(); // 지도 다시 렌더링
          }
        } else {
          // 데이터가 없는 경우 - 등록 버튼만 표시
          resetPopupButtons();
          // feature에 데이터 없음 표시 (파란색 기본 스타일)
          if (feature) {
            feature.set("hasData", false);
            feature.changed(); // 지도 다시 렌더링
          }
        }
      }

      // 팝업 버튼을 기본 상태로 리셋 (등록 버튼만 표시)
      function resetPopupButtons() {
        $("#ilgl-popup-register-btn").show();
        $("#ilgl-popup-inquiry-btn").hide();
      }

      // 등록 버튼과 조회 버튼 모두 표시
      function showBothButtons() {
        $("#ilgl-popup-register-btn").show();
        $("#ilgl-popup-inquiry-btn").show();
      }

      // HTML 이스케이프 함수 (전역에 등록)
      window.escapeHtml = function (value) {
        if (value === undefined || value === null) {
          return "";
        }
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      };

      // ============================================
      // Feature 처리 함수
      // ============================================

      /**
       * 공통 feature 처리 함수
       * @param {Object} featureData - GeoJSON feature 데이터
       * @param {Array} coordinate - 좌표 [x, y]
       * @param {String} pnu - 필지번호 (선택)
       * @param {Boolean} useOriginalCoordinate - 원본 좌표 사용 여부
       * @param {Boolean} checkDataExistence - 데이터 존재 여부 확인 여부
       * @param {Boolean} hasData - 미리 알려진 데이터 존재 여부 (선택적)
       */
      function processFeatureData(featureData, coordinate, pnu, useOriginalCoordinate, checkDataExistence, hasData) {
        // 기존 선택 정보 초기화
        clearSelection();

        if (!featureData) {
          showNoDataPopup(coordinate);
          return;
        }

        var properties = featureData.properties || {};
        var format = new ol.format.GeoJSON();
        selectedFeature = format.readFeature(featureData, {
          dataProjection: "EPSG:3857",
          featureProjection: "EPSG:3857",
        });

        // regionData 구성
        selectedRegionData = buildRegionData(
          properties,
          selectedFeature,
          coordinate,
          useOriginalCoordinate
        );

        // PNU가 파라미터로 전달된 경우 사용 (패널에서 클릭한 경우)
        if (pnu && !selectedRegionData.pnu) {
          selectedRegionData.pnu = pnu;
        }

        // 미리 알려진 hasData 값이 있으면 즉시 적용, 없으면 false로 초기화
        var initialHasData = hasData === true || hasData === "true" || hasData === 1;
        selectedFeature.set("hasData", initialHasData);

        // 영역 하이라이트 표시
        window.highlightSource.addFeature(selectedFeature);

        // 팝업 내용 생성
        window.popupContent.innerHTML = buildPopupContent(selectedRegionData);

        // 데이터 존재 여부 확인 후 버튼 표시 및 스타일 업데이트
        // 미리 알려진 hasData가 있으면 캐시에 저장하고 즉시 UI 업데이트
        if (hasData !== undefined && hasData !== null && pnu) {
          if (window.dataExistenceCache) {
            window.dataExistenceCache[pnu] = initialHasData;
          }
          updateUIWithDataExistence(initialHasData, selectedFeature);
        } else {
          updatePopupButtons(checkDataExistence, selectedRegionData.pnu || pnu);
        }

        // 팝업 위치 결정 및 표시
        var popupCoordinate = getPopupCoordinate(coordinate, useOriginalCoordinate);
        window.popupOverlay.setPosition(popupCoordinate);
      }

      /**
       * 선택 정보 초기화
       */
      function clearSelection() {
        window.popupOverlay.setPosition(undefined);
        selectedFeature = null;
        selectedRegionData = null;
        window.highlightSource.clear();
      }

      /**
       * 데이터 없음 팝업 표시
       * @param {Array} coordinate - 좌표
       */
      function showNoDataPopup(coordinate) {
        window.popupContent.innerHTML = "<span>선택한 위치의 지적 정보가 없습니다.</span>";
        resetPopupButtons();
        window.popupOverlay.setPosition(coordinate);
      }

      /**
       * 팝업 버튼 업데이트
       * @param {Boolean} checkDataExistence - 데이터 존재 여부 확인 여부
       * @param {String} pnu - 필지번호
       */
      function updatePopupButtons(checkDataExistence, pnu) {
        if (checkDataExistence && pnu) {
          checkDataExistenceAndUpdateButtons(pnu, selectedFeature);
        } else {
          resetPopupButtons();
          if (selectedFeature) {
            selectedFeature.set("hasData", false);
          }
        }
      }

      /**
       * 팝업 좌표 결정
       * @param {Array} coordinate - 기본 좌표
       * @param {Boolean} useOriginalCoordinate - 원본 좌표 사용 여부
       * @returns {Array} 팝업 좌표
       */
      function getPopupCoordinate(coordinate, useOriginalCoordinate) {
        if (
          useOriginalCoordinate &&
          selectedRegionData &&
          selectedRegionData.coordinateX &&
          selectedRegionData.coordinateY
        ) {
          return [selectedRegionData.coordinateX, selectedRegionData.coordinateY];
        }
        return coordinate;
      }

      /**
       * WMS GetFeatureInfo로 받아온 정보를 사용하여 영역 표시 + 팝업 표출 (지도 클릭 시 사용)
       * @param {Object} options - 옵션 객체
       * @param {Object} options.featureData - WMS GetFeatureInfo로 받아온 GeoJSON feature 데이터
       * @param {Array} options.coordinate - 클릭한 좌표 [x, y] (EPSG:3857)
       * @param {Boolean} options.checkDataExistence - 데이터 존재 여부 확인 여부 (기본값: true)
       */
      window.showMapPopupFromWMS = function (options) {
        var featureData = options.featureData;
        var coordinate = options.coordinate;
        var checkDataExistence = options.checkDataExistence !== false; // 기본값: true

        if (
          !coordinate ||
          !Array.isArray(coordinate) ||
          coordinate.length < 2
        ) {
          console.error(
            "showMapPopupFromWMS: 유효하지 않은 좌표입니다.",
            coordinate
          );
          return;
        }

        if (!window.popupOverlay || !window.popupContent) {
          console.error(
            "showMapPopupFromWMS: 팝업 오버레이가 초기화되지 않았습니다."
          );
          return;
        }

        // WMS로 받아온 featureData에서 PNU 추출
        var pnu = null;
        if (featureData && featureData.properties) {
          var props = featureData.properties;
          pnu = props.pnu || props.PNU || props.pnu_code;
        }

        // WMS로 받아온 featureData 직접 처리
        processFeatureData(featureData, coordinate, pnu, false, checkDataExistence);
      };

      // ============================================
      // 지도 팝업 표시 함수
      // ============================================

      /**
       * WMS GetFeatureInfo로 받아온 정보를 사용하여 영역 표시 + 팝업 표출 (지도 클릭 시 사용)
       * @param {Object} options - 옵션 객체
       * @param {Object} options.featureData - WMS GetFeatureInfo로 받아온 GeoJSON feature 데이터
       * @param {Array} options.coordinate - 클릭한 좌표 [x, y] (EPSG:3857)
       * @param {Boolean} options.checkDataExistence - 데이터 존재 여부 확인 여부 (기본값: true)
       */
      window.showMapPopupFromWMS = function (options) {
        var featureData = options.featureData;
        var coordinate = options.coordinate;
        var checkDataExistence = options.checkDataExistence !== false;

        if (!isValidCoordinate(coordinate)) {
          console.error("showMapPopupFromWMS: 유효하지 않은 좌표입니다.", coordinate);
          return;
        }

        if (!isPopupInitialized()) {
          return;
        }

        // WMS로 받아온 featureData에서 PNU 추출
        var pnu = extractPnuFromFeature(featureData);

        // WMS로 받아온 featureData 직접 처리
        processFeatureData(featureData, coordinate, pnu, false, checkDataExistence);
      };

      /**
       * WFS + PNU로 조회하여 영역 표시 + 팝업 표출 (패널 클릭 시 사용)
       * @param {Object} options - 옵션 객체
       * @param {Array} options.coordinate - 클릭한 좌표 [x, y] (EPSG:3857)
       * @param {ol.layer.Tile} options.layer - 조회할 레이어 객체 (기본값: window.cadastralLayer)
       * @param {String} options.layerName - 레이어명 (기본값: LAYER_NAME)
       * @param {Boolean} options.checkDataExistence - 데이터 존재 여부 확인 여부 (기본값: true)
       * @param {String} options.pnu - 필지번호 (필수)
       * @param {Boolean} options.useOriginalCoordinate - 원본 좌표를 그대로 사용할지 여부 (패널 호출 시 true)
       */
      window.showMapPopupAndHighlight = function (options) {
        var coordinate = options.coordinate;
        var layer = options.layer || window.cadastralLayer;
        var layerName = options.layerName || LAYER_NAME;
        var checkDataExistence = options.checkDataExistence !== false;
        var pnu = options.pnu || null;
        var useOriginalCoordinate = options.useOriginalCoordinate === true;
        var hasData = options.hasData; // 미리 알려진 hasData 정보 (선택적)

        if (!isValidCoordinate(coordinate)) {
          console.error("showMapPopupAndHighlight: 유효하지 않은 좌표입니다.", coordinate);
          return;
        }

        if (!layer) {
          console.error("showMapPopupAndHighlight: 레이어가 초기화되지 않았습니다.");
          return;
        }

        if (!isPopupInitialized()) {
          return;
        }

        if (!pnu) {
          console.error("showMapPopupAndHighlight: PNU가 필요합니다.", pnu);
          return;
        }

        // WFS 요청으로 featureData 조회
        var wfsUrl = buildWfsUrl(pnu, layerName);
        $.ajax({
          url: wfsUrl,
          dataType: "jsonp",
          jsonpCallback: "parseResponse",
          info_format: "text/javascript",
        })
          .done(function (json) {
            var featureData = parseVWorldFeatureResponse(json);
            processFeatureData(featureData, coordinate, pnu, useOriginalCoordinate, checkDataExistence, hasData);
          })
          .fail(function (err) {
            console.error("WFS GetFeature Error:", err);
            clearSelection();
            resetPopupButtons();
          });
      };

      /**
       * 좌표 유효성 검사
       * @param {Array} coordinate - 좌표
       * @returns {Boolean} 유효 여부
       */
      function isValidCoordinate(coordinate) {
        return coordinate && Array.isArray(coordinate) && coordinate.length >= 2;
      }

      /**
       * 팝업 초기화 여부 확인
       * @returns {Boolean} 초기화 여부
       */
      function isPopupInitialized() {
        if (!window.popupOverlay || !window.popupContent) {
          console.error("팝업 오버레이가 초기화되지 않았습니다.");
          return false;
        }
        return true;
      }

      /**
       * Feature에서 PNU 추출
       * @param {Object} featureData - Feature 데이터
       * @returns {String|null} PNU 또는 null
       */
      function extractPnuFromFeature(featureData) {
        if (!featureData || !featureData.properties) {
          return null;
        }
        var props = featureData.properties;
        return props.pnu || props.PNU || props.pnu_code || null;
      }

      // ============================================
      // 유틸리티 함수
      // ============================================

      /**
       * 팝업에 표시할 내용을 HTML 템플릿으로 반환
       * @param {Object} region - 지역 데이터 객체
       * @returns {String} HTML 문자열
       */
      function buildPopupContent(region) {
        if (!region) {
          return "<span>선택된 정보를 불러올 수 없습니다.</span>";
        }
        return window.escapeHtml(region.address || "-");
      }

      /**
       * VWorld API 응답에서 featureData 추출
       * @param {Object} json - API 응답 JSON
       * @returns {Object|null} featureData 또는 null
       */
      function parseVWorldFeatureResponse(json) {
        if (!json) {
          return null;
        }

        // 응답 형식 1: json.features
        if (json.features && json.features.length > 0) {
          return json.features[0];
        }

        // 응답 형식 2: json.response.result.featureCollection.features
        if (json.response && json.response.result) {
          var result = json.response.result;
          if (result.featureCollection && result.featureCollection.features) {
            var features = result.featureCollection.features;
            if (features.length > 0) {
              return features[0];
            }
          }
        }

        return null;
      }

      /**
       * WFS GetFeature URL 생성
       * @param {String} pnu - 필지번호
       * @param {String} layerName - 레이어명
       * @returns {String} WFS URL
       */
      function buildWfsUrl(pnu, layerName) {
        var filterXml =
          "<Filter><PropertyIsEqualTo><PropertyName>pnu</PropertyName><Literal>" +
          String(pnu).trim() +
          "</Literal></PropertyIsEqualTo></Filter>";

        return (
          "https://api.vworld.kr/req/wfs?" +
          "SERVICE=WFS" +
          "&VERSION=1.1.0" +
          "&REQUEST=GetFeature" +
          "&KEY=" + VWORLD_API_KEY +
          "&TYPENAME=" + layerName +
          "&OUTPUT=text/javascript" +
          "&srsname=EPSG:3857" +
          "&maxfeatures=10" +
          "&filter=" + encodeURIComponent(filterXml) +
          "&format_options=parseResponse"
          //"&domain=http://localhost"
        );
      }

      // ============================================
      // 지도 초기화
      // ============================================

      // PNU별 데이터 존재 여부 캐시 (깜빡임 방지용)
      window.dataExistenceCache = {};

      window.onload = function () {
        // 서울 시청 좌표를 기본 중심으로 하는 맵 뷰 설정
        var view = new ol.View({
          center: ol.proj.transform(
            DEFAULT_CENTER,
            "EPSG:4326",
            "EPSG:3857"
          ),
          zoom: DEFAULT_ZOOM,
        });
        // 기본 지도 레이어
        var baseLayer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url:
              "https://api.vworld.kr/req/wmts/1.0.0/" +
              VWORLD_API_KEY +
              "/Base/{z}/{y}/{x}.png",
          }),
        });
        // 지적편집도 레이어 (전역 변수로 등록)
        window.cadastralLayer = new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: "https://api.vworld.kr/req/wms",
            params: {
              LAYERS: LAYER_NAME,
              STYLES: LAYER_NAME,
              CRS: "EPSG:3857",
              FORMAT: "image/png",
              TRANSPARENT: true,
              KEY: VWORLD_API_KEY,
            },
          }),
          zIndex: 5,
        });
        // register.js와의 호환성을 위해 wmsLayer 별칭 설정
        window.wmsLayer = window.cadastralLayer;

        /**
         * 지도 상태 갱신 (WMS 레이어 및 현재 선택된 팝업/하이라이트 갱신)
         * - 등록/수정 후 호출됨
         */
        window.refreshMapState = function () {
          console.log("refreshMapState 호출됨");

          // 1. WMS 레이어 갱신
          if (window.cadastralLayer) {
            var source = window.cadastralLayer.getSource();
            if (source && source.updateParams) {
              source.updateParams({ TIME: Date.now() });
              console.log("WMS 레이어 갱신 완료");
            }
          }

          // 2. 이미지 레이어 초기화 (삭제된 이미지 제거를 위해)
          if (typeof window.clearImageLayer === "function") {
            window.clearImageLayer();
          }

          // 3. 이미지 데이터 다시 로드
          if (typeof window.SlidePanel !== 'undefined' && typeof window.SlidePanel.loadList === 'function') {
            // 슬라이드 패널의 리스트를 다시 로드하면서 이미지 레이어도 함께 갱신됨
            // 단, 1페이지를 다시 로드하여 최신 상태 반영
            window.SlidePanel.loadList(1);
          }

          // 4. 현재 선택된 Feature가 있다면 상태(데이터 존재 여부) 재확인
          if (selectedFeature && selectedRegionData && selectedRegionData.pnu) {
            var pnu = selectedRegionData.pnu;
            console.log("현재 선택된 PNU 갱신:", pnu);

            // 캐시 초기화 (새로 데이터를 가져오기 위해)
            if (window.dataExistenceCache) {
              delete window.dataExistenceCache[pnu];
            }

            // 데이터 존재 여부 재확인 및 UI 업데이트
            checkDataExistenceAndUpdateButtons(pnu, selectedFeature);
          }
        };

        // 선택 영역 하이라이트 스타일 (동적 스타일 함수)
        // 데이터 없을 때: 파란색 + fill (기본 스타일)
        var defaultHighlightStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(0, 153, 255, 0.8)",
            width: 3,
          }),
          fill: new ol.style.Fill({ color: "rgba(0, 153, 255, 0.1)" }),
        });

        // 데이터 있을 때: 붉은색 테두리만 (fill 없음)
        var dataExistsHighlightStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(255, 0, 0, 0.8)",
            width: 3,
          }),
          // fill 없음
        });

        // 하이라이트 소스를 전역 변수로 선언
        window.highlightSource = new ol.source.Vector();
        var highlightLayer = new ol.layer.Vector({
          source: window.highlightSource,
          style: function (feature) {
            // feature의 hasData 속성에 따라 스타일 반환
            var hasData = feature.get("hasData");
            if (hasData === true) {
              return dataExistsHighlightStyle;
            } else {
              return defaultHighlightStyle;
            }
          },
          zIndex: 10, // 이미지 위에 표시되도록 높은 zIndex
        });

        // 지도 객체 생성 (전역 변수로 선언)
        window.map = new ol.Map({
          target: "map",
          layers: [baseLayer, window.cadastralLayer, highlightLayer],
          view: view,
          pixelRatio: window.devicePixelRatio || 1,
        });

        // 등록된 이미지 레이어 관리 (다중 이미지 지원)
        window.imageLayers = [];
        window.loadedImages = {}; // imageUrl -> { centerX, centerY, layer }

        /**
         * 이미지 레이어 업데이트 (추가)
         * @param {Number} centerX - 중심 X 좌표 (EPSG:3857)
         * @param {Number} centerY - 중심 Y 좌표 (EPSG:3857)
         * @param {String} imagePath - 이미지 파일 경로 (상대 경로 또는 URL)
         */
        /**
         * 이미지 경로를 절대 경로로 변환
         */
        function resolveImageUrl(path) {
          if (
            !path.startsWith("http://") &&
            !path.startsWith("https://") &&
            !path.startsWith("/")
          ) {
            return "/" + path.replace(/^\/+/, "");
          }
          return path;
        }

        /**
         * 이미지 표시 영역 계산 (중심점 기준 +/- 29m)
         */
        function calculateImageExtent(cx, cy) {
          var HALF_SIZE = 29; // 미터 단위
          return [
            cx - HALF_SIZE,
            cy - HALF_SIZE,
            cx + HALF_SIZE,
            cy + HALF_SIZE,
          ];
        }

        /**
         * 이미지 레이어 생성
         */
        function createImageLayer(url, extent) {
          var source = new ol.source.ImageStatic({
            url: url,
            imageExtent: extent,
            projection: "EPSG:3857",
            crossOrigin: "anonymous",
          });

          source.on("imageloaderror", function (error) {
            console.error("이미지 로드 실패:", url, error);
          });

          return new ol.layer.Image({
            source: source,
            zIndex: 6,
          });
        }

        /**
         * 이미지 레이어 업데이트 (추가)
         * @param {Number} centerX - 중심 X 좌표 (EPSG:3857)
         * @param {Number} centerY - 중심 Y 좌표 (EPSG:3857)
         * @param {String} imagePath - 이미지 파일 경로 (상대 경로 또는 URL)
         */
        window.updateImageLayer = function (centerX, centerY, imagePath) {
          if (!centerX || !centerY || !imagePath) {
            console.warn("updateImageLayer: 필수 파라미터 누락", {
              centerX,
              centerY,
              imagePath,
            });
            return;
          }

          var imageUrl = resolveImageUrl(imagePath);

          // 이미 로드된 이미지인지 확인 (캐싱)
          if (window.loadedImages[imageUrl]) {
            return;
          }

          // 레이어 생성 및 추가
          var imageExtent = calculateImageExtent(centerX, centerY);
          var newImageLayer = createImageLayer(imageUrl, imageExtent);

          window.imageLayers.push(newImageLayer);
          window.loadedImages[imageUrl] = {
            centerX: centerX,
            centerY: centerY,
            layer: newImageLayer,
          };

          // 체크박스 상태 확인하여 레이어 표시 여부 결정
          var $imageToggle = $("#slide-panel-image-toggle");
          var isChecked =
            $imageToggle.length > 0 ? $imageToggle.is(":checked") : true;

          if (isChecked) {
            window.map.addLayer(newImageLayer);
          }
        };

        /**
         * 이미지 레이어 표시/숨김 토글
         * @param {Boolean} show - true면 표시, false면 숨김
         */
        window.toggleImageLayer = function (show) {
          if (window.imageLayers && window.imageLayers.length > 0) {
            window.imageLayers.forEach(function (layer) {
              if (show) {
                // 레이어가 이미 맵에 있는지 확인
                var layers = window.map.getLayers();
                var found = false;
                layers.forEach(function (mapLayer) {
                  if (mapLayer === layer) {
                    found = true;
                  }
                });
                if (!found) {
                  window.map.addLayer(layer);
                }
              } else {
                window.map.removeLayer(layer);
              }
            });
          }
        };

        /**
         * 이미지 레이어 제거 (전체 초기화)
         */
        window.clearImageLayer = function () {
          if (window.imageLayers && window.imageLayers.length > 0) {
            window.imageLayers.forEach(function (layer) {
              window.map.removeLayer(layer);
            });
          }
          window.imageLayers = [];
          window.loadedImages = {};
        };

        // 팝업 관련 DOM 요소 레퍼런스 (전역 변수로 등록)
        var container = document.getElementById("ilgl-popup");
        window.popupContent = document.getElementById("ilgl-popup-content");
        var closer = document.getElementById("ilgl-popup-closer");
        window.popupOverlay = new ol.Overlay({
          element: container,
          autoPan: true,
          autoPanAnimation: { duration: 250 },
        });
        window.map.addOverlay(window.popupOverlay);

        // 팝업 닫기 버튼 이벤트
        closer.onclick = function () {
          window.popupOverlay.setPosition(undefined);
          resetPopupButtons();
          closer.blur();
          return false;
        };

        // ============================================
        // 이벤트 핸들러
        // ============================================

        // 단일 클릭 시 지적 정보 조회
        window.map.on("singleclick", function (evt) {
          // 불법용지 이미지 보기 체크박스가 켜져있을 때만 실행
          var $imageToggle = $("#slide-panel-image-toggle");
          var isImageToggleChecked = $imageToggle.length > 0 ? $imageToggle.is(":checked") : false;
          if (!isImageToggleChecked) {
            return;
          }

          var currentZoom = view.getZoom();

          // 너무 낮은 줌 레벨에서는 토스트 메시지만 노출
          if (currentZoom < MIN_ZOOM_LEVEL) {
            clearSelection();
            showToastMessage();
            return;
          }

          var coordinate = evt.coordinate;

          // WMS GetFeatureInfo로 지적 정보 조회
          var viewResolution = view.getResolution();
          var source = window.cadastralLayer.getSource();
          var getFeatureInfoUrl = source.getGetFeatureInfoUrl(
            coordinate,
            viewResolution,
            "EPSG:3857",
            {
              INFO_FORMAT: "application/json",
              QUERY_LAYERS: LAYER_NAME,
              FEATURE_COUNT: 1,
              info_format: "text/javascript",
            }
          );

          if (!getFeatureInfoUrl) {
            console.error("GetFeatureInfo URL을 생성할 수 없습니다.");
            return;
          }

          $.ajax({
            url: getFeatureInfoUrl,
            dataType: "jsonp",
            jsonpCallback: "parseResponse",
          })
            .done(function (json) {
              var featureData = parseVWorldFeatureResponse(json);

              if (!featureData) {
                console.warn("지적 정보를 찾을 수 없습니다.");
                clearSelection();
                return;
              }

              // WMS로 받아온 정보를 직접 사용하여 영역 표시
              window.showMapPopupFromWMS({
                featureData: featureData,
                coordinate: coordinate,
                checkDataExistence: true,
              });
            })
            .fail(function (err) {
              console.error("GetFeatureInfo Error:", err);
              clearSelection();
            });
        });

        /**
         * 토스트 메시지 표시
         */
        function showToastMessage() {
          var toast = $("#toast-message");
          toast.stop().fadeIn(400, function () {
            setTimeout(function () {
              toast.fadeOut(400);
            }, 2000);
          });
        }

        // 팝업 내 등록 버튼 클릭 시 모달 띄우기
        $("#ilgl-popup-register-btn").on("click", function () {
          if (selectedRegionData) {
            if (
              window.IllegalRegisterModal &&
              typeof window.IllegalRegisterModal.open === "function"
            ) {
              window.IllegalRegisterModal.open(selectedRegionData);
            } else {
              console.warn("IllegalRegisterModal이 초기화되지 않았습니다.");
            }
          } else {
            alert("등록할 정보가 없습니다. 지도를 다시 클릭해주세요.");
          }
        });

        // 팝업 내 조회 버튼 클릭 시 조회 모달 띄우기
        $("#ilgl-popup-inquiry-btn").on("click", function () {
          if (selectedRegionData && selectedRegionData.pnu) {
            if (
              window.illegalInquiryModal &&
              typeof window.illegalInquiryModal.open === "function"
            ) {
              window.illegalInquiryModal.open(selectedRegionData.pnu);
            } else {
              console.warn("IllegalInquiryModal이 초기화되지 않았습니다.");
            }
          } else {
            alert("조회할 정보가 없습니다. 지도를 다시 클릭해주세요.");
          }
        });

        // 조회 모달 초기화
        if (typeof IllegalInquiryModal === "function") {
          illegalInquiryModal = new IllegalInquiryModal();
        }

        // 페이지 로드 시 패널 데이터 조회
        if (
          window.SlidePanel &&
          typeof window.SlidePanel.loadList === "function"
        ) {
          window.SlidePanel.loadList(1);
        }


        // ============================================
        // 주소 검색 모달 관련 함수
        // ============================================

        /**
         * 주소 검색 모달 열기
         */
        window.openAddressSearchModal = function () {
          var iframe = document.getElementById('addressSearchModalFrame');
          if (iframe) {
            iframe.style.display = 'block';
            // iframe 내부의 openAddressModal 함수 호출
            try {
              var iframeWindow = iframe.contentWindow;
              if (iframeWindow && typeof iframeWindow.openAddressModal === 'function') {
                iframeWindow.openAddressModal();
              }
            } catch (e) {
              console.warn('iframe 접근 실패:', e);
            }
          }
        };

        /**
         * 주소 검색 모달 닫기
         */
        window.closeAddressSearchModal = function () {
          var iframe = document.getElementById('addressSearchModalFrame');
          if (iframe) {
            iframe.style.display = 'none';
          }
        };

        /**
         * 주소 검색 모달에서 선택한 주소를 받는 함수
         * @param {Object} addressData - 선택된 주소 정보
           */
        window.clearImageLayer = function () {
          if (window.imageLayers && window.imageLayers.length > 0) {
            window.imageLayers.forEach(function (layer) {
              window.map.removeLayer(layer);
            });
          }
          window.imageLayers = [];
          window.loadedImages = {};
        };

        // 팝업 관련 DOM 요소 레퍼런스 (전역 변수로 등록)
        var container = document.getElementById("ilgl-popup");
        window.popupContent = document.getElementById("ilgl-popup-content");
        var closer = document.getElementById("ilgl-popup-closer");
        window.popupOverlay = new ol.Overlay({
          element: container,
          autoPan: true,
          autoPanAnimation: { duration: 250 },
        });
        window.map.addOverlay(window.popupOverlay);

        // 팝업 닫기 버튼 이벤트
        closer.onclick = function () {
          clearSelection();
          resetPopupButtons();
          closer.blur();
          return false;
        };

        // ============================================
        // 이벤트 핸들러
        // ============================================

        // 단일 클릭 시 지적 정보 조회
        window.map.on("singleclick", function (evt) {
          // 불법용지 이미지 보기 체크박스가 켜져있을 때만 실행
          var $imageToggle = $("#slide-panel-image-toggle");
          var isImageToggleChecked = $imageToggle.length > 0 ? $imageToggle.is(":checked") : false;
          if (!isImageToggleChecked) {
            return;
          }

          var currentZoom = view.getZoom();

          // 너무 낮은 줌 레벨에서는 토스트 메시지만 노출
          if (currentZoom < MIN_ZOOM_LEVEL) {
            clearSelection();
            showToastMessage();
            return;
          }

          var coordinate = evt.coordinate;

          // WMS GetFeatureInfo로 지적 정보 조회
          var viewResolution = view.getResolution();
          var source = window.cadastralLayer.getSource();
          var getFeatureInfoUrl = source.getGetFeatureInfoUrl(
            coordinate,
            viewResolution,
            "EPSG:3857",
            {
              INFO_FORMAT: "application/json",
              QUERY_LAYERS: LAYER_NAME,
              FEATURE_COUNT: 1,
              info_format: "text/javascript",
            }
          );

          if (!getFeatureInfoUrl) {
            console.error("GetFeatureInfo URL을 생성할 수 없습니다.");
            return;
          }

          $.ajax({
            url: getFeatureInfoUrl,
            dataType: "jsonp",
            jsonpCallback: "parseResponse",
          })
            .done(function (json) {
              var featureData = parseVWorldFeatureResponse(json);

              if (!featureData) {
                console.warn("지적 정보를 찾을 수 없습니다.");
                clearSelection();
                return;
              }

              // WMS로 받아온 정보를 직접 사용하여 영역 표시
              window.showMapPopupFromWMS({
                featureData: featureData,
                coordinate: coordinate,
                checkDataExistence: true,
              });
            })
            .fail(function (err) {
              console.error("GetFeatureInfo Error:", err);
              clearSelection();
            });
        });

        /**
         * 토스트 메시지 표시
         */
        function showToastMessage() {
          var toast = $("#toast-message");
          toast.stop().fadeIn(400, function () {
            setTimeout(function () {
              toast.fadeOut(400);
            }, 2000);
          });
        }

        // 팝업 내 등록 버튼 클릭 시 모달 띄우기
        $("#ilgl-popup-register-btn").on("click", function () {
          if (selectedRegionData) {
            if (
              window.IllegalRegisterModal &&
              typeof window.IllegalRegisterModal.open === "function"
            ) {
              window.IllegalRegisterModal.open(selectedRegionData);
            } else {
              console.warn("IllegalRegisterModal이 초기화되지 않았습니다.");
            }
          } else {
            alert("등록할 정보가 없습니다. 지도를 다시 클릭해주세요.");
          }
        });

        // 팝업 내 조회 버튼 클릭 시 조회 모달 띄우기
        $("#ilgl-popup-inquiry-btn").on("click", function () {
          if (selectedRegionData && selectedRegionData.pnu) {
            if (
              window.illegalInquiryModal &&
              typeof window.illegalInquiryModal.open === "function"
            ) {
              window.illegalInquiryModal.open(selectedRegionData.pnu);
            } else {
              console.warn("IllegalInquiryModal이 초기화되지 않았습니다.");
            }
          } else {
            alert("조회할 정보가 없습니다. 지도를 다시 클릭해주세요.");
          }
        });

        // 조회 모달 초기화
        if (typeof IllegalInquiryModal === "function") {
          illegalInquiryModal = new IllegalInquiryModal();
        }

        // 페이지 로드 시 패널 데이터 조회
        if (
          window.SlidePanel &&
          typeof window.SlidePanel.loadList === "function"
        ) {
          window.SlidePanel.loadList(1);
        }
      };

      // ============================================
      // 주소 검색 모달 관련 함수
      // ============================================

      /**
       * 주소 검색 모달 열기
       */
      window.openAddressSearchModal = function () {
        var iframe = document.getElementById('addressSearchModalFrame');
        if (iframe) {
          iframe.style.display = 'block';
          // iframe 내부의 openAddressModal 함수 호출
          try {
            var iframeWindow = iframe.contentWindow;
            if (iframeWindow && typeof iframeWindow.openAddressModal === 'function') {
              iframeWindow.openAddressModal();
            }
          } catch (e) {
            console.warn('iframe 접근 실패:', e);
          }
        }
      };

      /**
       * 주소 검색 모달 닫기
       */
      window.closeAddressSearchModal = function () {
        var iframe = document.getElementById('addressSearchModalFrame');
        if (iframe) {
          iframe.style.display = 'none';
        }
      };

      /**
       * 주소 검색 모달에서 선택한 주소를 받는 함수
       * @param {Object} addressData - 선택된 주소 정보
       * @param {String} addressData.zipcode - 우편번호
       * @param {String} addressData.roadAddress - 도로명 주소
       * @param {String} addressData.parcelAddress - 지번 주소
       * @param {Object} addressData.coordinates - 좌표 정보 {x, y}
       */
      window.receiveSelectedAddress = function (addressData) {
        console.log('선택된 주소:', addressData);

        if (addressData) {
          var fullAddress = addressData.roadAddress || addressData.parcelAddress || "";

          // 전역 변수 window.currentAddressTargetId가 설정되어 있다면 해당 입력 필드에 값 설정
          if (window.currentAddressTargetId) {
            var $targetInput = $("#" + window.currentAddressTargetId);
            if ($targetInput.length > 0) {
              $targetInput.val(fullAddress);
              // 필요한 경우 change 이벤트 트리거
              $targetInput.trigger("change");
            }
            // 사용 후 초기화
            window.currentAddressTargetId = null;
          } else {
            // 타겟이 없는 경우 (기존 로직 유지 또는 알림)
            // alert('선택된 주소:\n' + fullAddress);
          }

          // 좌표가 있고, 지도 이동이 필요한 경우 (옵션)
          /*
          if (addressData.coordinates && addressData.coordinates.x && addressData.coordinates.y) {
            var x = parseFloat(addressData.coordinates.x);
            var y = parseFloat(addressData.coordinates.y);
            if (window.map && window.map.getView()) {
              window.map.getView().setCenter([x, y]);
            }
          }
          */
        }

        // 모달 닫기
        window.closeAddressSearchModal();
      };
    </script>
  </body>

  </html>