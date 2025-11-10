package com.toji.toji.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.toji.toji.domain.RegionInfo;
import com.toji.toji.dto.RegionInfoRequest;
import com.toji.toji.mapper.RegionInfoMapper;

@Service
public class RegionInfoService {

    private static final int DEFAULT_RECENT_LIMIT = 10;

    private final RegionInfoMapper regionInfoMapper;

    public RegionInfoService(RegionInfoMapper regionInfoMapper) {
        this.regionInfoMapper = regionInfoMapper;
    }

    public Long saveRegionInfo(RegionInfoRequest request) {
        RegionInfo regionInfo = toDomain(request);
        regionInfo.setCreatedAt(LocalDateTime.now());
        regionInfoMapper.insert(regionInfo);
        return regionInfo.getId();
    }

    public List<RegionInfo> getRecentRegionInfos(Integer limit) {
        int resolvedLimit = (limit == null || limit <= 0) ? DEFAULT_RECENT_LIMIT : Math.min(limit, 50);
        return regionInfoMapper.selectRecent(resolvedLimit);
    }

    private RegionInfo toDomain(RegionInfoRequest request) {
        RegionInfo regionInfo = new RegionInfo();
        regionInfo.setAddress(request.getAddress());
        regionInfo.setRoadAddress(request.getRoadAddress());
        regionInfo.setJibunAddress(request.getJibunAddress());
        regionInfo.setPnu(StringUtils.hasText(request.getPnu()) ? request.getPnu() : null);
        regionInfo.setSido(request.getSido());
        regionInfo.setSigungu(request.getSigungu());
        regionInfo.setEupmyeondong(request.getEupmyeondong());
        regionInfo.setRi(request.getRi());
        regionInfo.setLatitude(request.getLatitude());
        regionInfo.setLongitude(request.getLongitude());
        regionInfo.setMemo(request.getMemo());
        return regionInfo;
    }
}

