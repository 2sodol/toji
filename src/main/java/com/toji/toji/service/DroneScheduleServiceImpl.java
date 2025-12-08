package com.toji.toji.service;

import com.toji.toji.mapper.DroneScheduleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DroneScheduleServiceImpl implements DroneScheduleService {

    @Autowired
    private DroneScheduleMapper droneScheduleMapper;

    @Override
    @Transactional
    public void syncScheduleDates(List<String> dates) {
        if (dates != null && !dates.isEmpty()) {
            for (String date : dates) {
                droneScheduleMapper.mergeScheduleDate(date);
            }
        }
    }

    @Override
    public List<String> getAllScheduleDates() {
        return droneScheduleMapper.selectAllScheduleDates();
    }
}
