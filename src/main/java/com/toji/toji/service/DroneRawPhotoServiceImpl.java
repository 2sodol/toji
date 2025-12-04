package com.toji.toji.service;

import com.toji.toji.domain.DroneRawPhotoVO;
import com.toji.toji.mapper.DroneRawPhotoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DroneRawPhotoServiceImpl implements DroneRawPhotoService {

    @Autowired
    private DroneRawPhotoMapper droneRawPhotoMapper;

    @Override
    public List<String> getAvailableDates() {
        return droneRawPhotoMapper.selectDistinctDates();
    }

    @Override
    public List<DroneRawPhotoVO> getPhotosByDate(String date) {
        return droneRawPhotoMapper.selectRawPhotosByDate(date);
    }

    @Override
    public DroneRawPhotoVO getPhotoById(Long photoSeq) {
        return droneRawPhotoMapper.selectRawPhotoById(photoSeq);
    }
}
