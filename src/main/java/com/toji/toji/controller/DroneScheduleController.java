package com.toji.toji.controller;

import com.toji.toji.service.DroneScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/drone/schedule")
public class DroneScheduleController {

    @Autowired
    private DroneScheduleService droneScheduleService;

    @PostMapping("/sync")
    public void syncSchedule(@RequestBody List<String> dates) {
        droneScheduleService.syncScheduleDates(dates);
    }

    @GetMapping
    public List<String> getSchedule() {
        return droneScheduleService.getAllScheduleDates();
    }
}
