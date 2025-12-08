
const urls = ['http://172.16.164.220:9630/flight/1731653711981/images/20241115_155843.png', 'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204271518.png', 'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204273122.png', 'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204275793.png', 'http://172.16.164.220:9630/flight/1733204329466/images/capture_image_1733204277380.png', 'http://172.16.164.220:9630/flight/1733206081751/images/capture_image_1733206168700.png', 'http://172.16.164.220:9630/flight/1733206081751/images/capture_image_1733206171736.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206858540.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206862304.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206868753.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206872216.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206874346.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206914025.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206930353.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206932607.png', 'http://172.16.164.220:9630/flight/1733206910987/images/capture_image_1733206934746.png', 'http://172.16.164.220:9630/flight/1735192803061/images/capture_image_1735192729406.png', 'http://172.16.164.220:9630/flight/1735192803061/images/capture_image_1735192731221.png', 'http://172.16.164.220:9630/flight/1735192803061/images/capture_image_1735192733439.png', 'http://172.16.164.220:9630/flight/1735195345041/images/capture_image_1735195501447.png', 'http://172.16.164.220:9630/flight/1735195345041/images/capture_image_1735195502848.png', 'http://172.16.164.220:9630/flight/1735195345041/images/capture_image_1735195504024.png', 'https://dsc.ex.co.kr:9630/flight/1761109100226/images/20251022_135903.png', 'https://dsc.ex.co.kr:9630/flight/1761109100226/images/20251022_135903.png', 'https://dsc.ex.co.kr:9630/flight/1761110212221/images/20251022_141720.png', 'https://dsc.ex.co.kr:9630/flight/1761110614433/images/20251022_142402.png', 'https://dsc.ex.co.kr:9630/flight/1761110614433/images/20251022_142419.png', 'https://dsc.ex.co.kr:9630/flight/1761115259689/images/20251022_154127.png', 'https://dsc.ex.co.kr:9630/flight/1761115259689/images/20251022_154143.png', 'https://dsc.ex.co.kr:9630/flight/1761115886857/images/20251022_155155.png', 'https://dsc.ex.co.kr:9630/flight/1761115886857/images/20251022_155207.png', 'https://dsc.ex.co.kr:9630/flight/1761116155313/images/20251022_155622.png', 'https://dsc.ex.co.kr:9630/flight/1761116155313/images/20251022_155634.png', 'https://dsc.ex.co.kr:9630/flight/1761116273952/images/20251022_155828.png', 'https://dsc.ex.co.kr:9630/flight/1761616951155/images/camera_110336.png'];

// Logic from drone_explorer_modal.js
const uniqueDates = new Set();
const debugLogs = [];

urls.forEach(function (url) {
    // 패턴 2: 경로 내 타임스탬프 .../flight/1731653711981/...
    var tsMatch = url.match(/\/flight\/(\d+)\//);
    if (tsMatch && tsMatch[1]) {
        var date = new Date(parseInt(tsMatch[1]));
        var yyyy = date.getFullYear();
        var mm = String(date.getMonth() + 1).padStart(2, '0');
        var dd = String(date.getDate()).padStart(2, '0');
        var ymd = yyyy + mm + dd;

        uniqueDates.add(ymd);
        debugLogs.push({ url: url, timestamp: tsMatch[1], converted: ymd });
    }
});

console.log("Unique Dates Found:", Array.from(uniqueDates));
console.log("Sample Conversions:");
debugLogs.slice(0, 5).forEach(log => console.log(log));
