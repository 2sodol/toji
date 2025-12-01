package com.toji.toji.controller;

import com.toji.toji.domain.DroneImageVO;
import com.toji.toji.mapper.DroneImageMapper;
import java.util.List;
import java.util.Map;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/drone")
public class DroneImageController {

    @Resource
    private DroneImageMapper droneImageMapper;

    /**
     * 드론 모니터링 페이지 이동
     * 
     * @return jsp path
     */
    @GetMapping("/monitor.do")
    public String monitor() {
        return "drone/monitor";
    }

    /**
     * 날짜별 수집 현황 조회 (콤보박스용)
     * 
     * @return List of Maps (WORK_DATE, PHOTO_CNT)
     */
    @GetMapping("/api/dates.do")
    @ResponseBody
    public List<Map<String, Object>> getDroneImageDates() {
        return droneImageMapper.selectDroneImageDateList();
    }

    /**
     * 특정 날짜의 이미지 리스트 조회
     * 
     * @param date YYYY-MM-DD
     * @return List of DroneImageVO
     */
    @GetMapping("/api/list.do")
    @ResponseBody
    public List<DroneImageVO> getDroneImageList(@RequestParam("date") String date) {
        return droneImageMapper.selectDroneImageList(date);
    }
}
