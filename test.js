// map.js (VWorld 지도/위성 전환 및 이미지 오버레이 제어 최종 버전)

// --------------------------------------------------------------------
// 1. 지도 구성 요소 설정
// --------------------------------------------------------------------

// 이미지 경계 및 중심 좌표 (EPSG:3857)
const GEOTIFF_CENTER_X = 14239470.615841;
const GEOTIFF_CENTER_Y = 4331333.304951 + 1;

// 1103-1.png 파일이 지도상에 표시될 지리적 경계를 수동으로 설정합니다.
// 표시 크기를 절반으로 줄이기 위해 중심에서 +/- 300m로 설정 (기존 600m)
const IMAGE_HALF_SIZE_RANGE = 29;

const IMAGE_EXTENT = [
    GEOTIFF_CENTER_X - IMAGE_HALF_SIZE_RANGE, // Xmin
    GEOTIFF_CENTER_Y - IMAGE_HALF_SIZE_RANGE, // Ymin
    GEOTIFF_CENTER_X + IMAGE_HALF_SIZE_RANGE, // Xmax
    GEOTIFF_CENTER_Y + IMAGE_HALF_SIZE_RANGE  // Ymax
];

// --------------------------------------------------------------------
// 2. 레이어 및 소스 정의
// --------------------------------------------------------------------

// A. VWorld 배경 지도 (Base) Source
const vworldBaseSource = new ol.source.XYZ({
    // VWorld 일반 배경 지도 공개 URL (CORS 우회용)
    url: 'http://xdworld.vworld.kr:8080/2d/Base/201802/{z}/{x}/{y}.png',
    crossOrigin: 'anonymous',
    attributions: 'VWorld (Base)',
});

// VWorld 배경 지도 레이어
const vworldBaseLayer = new ol.layer.Tile({
    source: vworldBaseSource,
    title: 'VWorld Base Map',
    visible: true, // 초기에는 배경 지도를 표시
});

// B. VWorld 위성 지도 (Satellite) Source
const vworldSatelliteSource = new ol.source.XYZ({
    // VWorld 위성 지도 공개 URL (최신 연도를 시도하거나 공식 API 사용을 권장)
    url: 'http://xdworld.vworld.kr:8080/2d/Satellite/202012/{z}/{x}/{y}.png', // 202012로 변경 시도
    crossOrigin: 'anonymous',
    attributions: 'VWorld (Satellite)',
});

// VWorld 위성 지도 레이어
const vworldSatelliteLayer = new ol.layer.Tile({
    source: vworldSatelliteSource,
    title: 'VWorld Satellite Map',
    visible: false, // 초기에는 위성 지도를 숨김
});

// C. 일반 이미지 Source (ImageStatic) - 메인 지도용
const imageSource = new ol.source.ImageStatic({
    url: '1103-1.png', // 메인 지도에 표시될 이미지 파일명
    imageExtent: IMAGE_EXTENT,
    projection: 'EPSG:3857',
    crossOrigin: 'anonymous',
});

// 일반 이미지 레이어 - 메인 지도용
const imageLayer = new ol.layer.Image({
    source: imageSource,
    title: 'Image Overlay',
    opacity: 0.8, // 초기 투명도
});

// --------------------------------------------------------------------
// 3. 메인 지도 초기화
// --------------------------------------------------------------------

// 지도 뷰 설정 (메인 지도용)
const view = new ol.View({
    center: [GEOTIFF_CENTER_X, GEOTIFF_CENTER_Y],
    zoom: 14,
    projection: 'EPSG:3857', // Web Mercator
    minZoom: 5,
    maxZoom: 24,
});

// 메인 지도 객체 생성 및 레이어 추가
const map = new ol.Map({
    target: 'map',
    layers: [
        vworldBaseLayer,
        vworldSatelliteLayer,
        imageLayer,
    ],
    view: view,
    controls: [
        new ol.control.Zoom(),
        new ol.control.Rotate(),
        new ol.control.Attribution(),
        new ol.control.ZoomSlider()
    ]
});

// 4. 지도 뷰를 이미지 범위에 맞춥니다. (메인 지도용)
imageSource.on('imageloadend', function () {
    map.getView().fit(IMAGE_EXTENT, {
        size: map.getSize(),
        padding: [50, 50, 50, 50],
        duration: 1000
    });
    console.log("✅ 메인 지도 이미지 로드 및 뷰 이동 완료.");
});


// --------------------------------------------------------------------
// 5. 메인 지도 UI 제어 로직
// --------------------------------------------------------------------

// UI 요소 가져오기
const toggleMapType = document.getElementById('toggleMapType');
const toggleCheckbox = document.getElementById('toggleOpacity');
const opacity50Button = document.getElementById('setOpacity05');
const opacity100Button = document.getElementById('setOpacity10');
const compareImagesBtn = document.getElementById('compareImagesBtn'); // 비교 버튼

// A. 지도 스타일 전환 (배경 <-> 위성)
toggleMapType.addEventListener('change', function () {
    if (this.checked) {
        vworldSatelliteLayer.setVisible(true);
        vworldBaseLayer.setVisible(false);
    } else {
        vworldSatelliteLayer.setVisible(false);
        vworldBaseLayer.setVisible(true);
    }
});

// B. 체크박스를 이용한 오버레이 표시/숨김 토글
toggleCheckbox.addEventListener('change', function () {
    const opacityValue = this.checked ? 1.0 : 0.0;
    imageLayer.setOpacity(opacityValue);
});

// C. 버튼을 이용한 투명도 조절
opacity50Button.addEventListener('click', function () {
    imageLayer.setOpacity(0.5);
    toggleCheckbox.checked = true;
});

opacity100Button.addEventListener('click', function () {
    imageLayer.setOpacity(1.0);
    toggleCheckbox.checked = true;
});

// --------------------------------------------------------------------
// 6. ✨ 이미지 비교 팝업 기능 (새로운 로직)
// --------------------------------------------------------------------

const comparePopup = document.getElementById('compare-popup');
const closePopupBtn = document.getElementById('close-popup-btn');

let compareMaps = []; // 팝업 내 OpenLayers Map 객체들을 저장할 배열

compareImagesBtn.addEventListener('click', function () {
    comparePopup.style.display = 'block'; // 팝업 표시
    initializeCompareMaps(); // 팝업 내 지도 초기화
});

closePopupBtn.addEventListener('click', function () {
    comparePopup.style.display = 'none'; // 팝업 숨김
    // 팝업 닫을 때 지도 리소스 정리 (선택 사항)
    compareMaps.forEach(m => m.setTarget(undefined));
    compareMaps = [];
});

function initializeCompareMaps() {
    // 팝업 내 3개의 지도를 위한 **공유 View** 생성
    // 메인 지도의 현재 뷰 상태를 복사하여 동일하게 시작합니다.
    const sharedView = new ol.View({
        center: map.getView().getCenter(), // 메인 지도의 현재 중심
        zoom: map.getView().getZoom(),     // 메인 지도의 현재 줌 레벨
        projection: 'EPSG:3857',
        minZoom: 5,
        maxZoom: 24,
    });

    // 촬영이미지는 3개의 지도 위에 날짜를 선택할 수 있도록하고 등록되어 있는 사진 날짜 리스트를 가져와서
    // 날짜에 맞는 사진을 보여준다
    //const imageFiles = ['1103-1.png', '1103-2.png', '1103-3.png'];

    for (let i = 0; i < imageFiles.length; i++) {
        const imageFileName = imageFiles[i];
        const mapTargetId = `compare-map-${i + 1}`; // HTML에 정의된 ID: compare-map-1, compare-map-2, compare-map-3

        // 각 이미지에 대한 ImageStatic Source 생성
        const currentImageSource = new ol.source.ImageStatic({
            url: imageFileName,
            imageExtent: IMAGE_EXTENT, // 메인 지도와 동일한 Extent 사용
            projection: 'EPSG:3857',
            crossOrigin: 'anonymous',
        });

        // 각 이미지에 대한 Image Layer 생성
        const currentImageLayer = new ol.layer.Image({
            source: currentImageSource,
            title: imageFileName,
            opacity: 1.0, // 비교 팝업에서는 불투명하게 시작
        });

        // VWorld 배경 레이어 (팝업 지도에도 동일하게 적용)
        const compareBaseLayer = new ol.layer.Tile({
            source: vworldBaseSource, // 메인 지도와 동일한 VWorld 소스 사용
            visible: true,
        });

        // OpenLayers Map 객체 생성
        const compareMap = new ol.Map({
            target: mapTargetId,
            layers: [
                compareBaseLayer,       // 팝업 지도에도 VWorld 배경을 깔아줍니다.
                currentImageLayer,
            ],
            view: sharedView, // ✨ 중요: 모든 팝업 지도가 이 공유 View를 사용합니다.
            controls: [] // 팝업 지도에는 별도의 컨트롤을 추가하지 않음 (선택 사항)
        });

        compareMaps.push(compareMap); // 생성된 맵 객체를 배열에 저장

        // 이미지 로드 완료 후 뷰를 해당 이미지 범위에 맞춥니다.
        // 이는 초기 로딩 시 이미지 위치를 확정하기 위함입니다.
        currentImageSource.on('imageloadend', function () {
            compareMap.getView().fit(IMAGE_EXTENT, {
                size: compareMap.getSize(),
                padding: [5, 5, 5, 5],
                duration: 500
            });
            // 팝업이 띄워진 후 지도가 완전히 로드될 때 리사이즈 이벤트를 발생시켜 렌더링 문제를 해결
            compareMap.updateSize();
        });
    }

    // 팝업이 표시된 후 모든 지도의 크기를 업데이트하여 렌더링 문제를 방지합니다.
    // 이는 팝업이 display:none 상태에서 초기화될 때 지도가 제대로 그려지지 않는 문제를 해결합니다.
    setTimeout(() => {
        compareMaps.forEach(m => m.updateSize());
    }, 100);
}