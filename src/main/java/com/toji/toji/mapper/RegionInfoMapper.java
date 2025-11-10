package com.toji.toji.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.toji.toji.domain.RegionInfo;

@Mapper
public interface RegionInfoMapper {

    int insert(RegionInfo regionInfo);

    List<RegionInfo> selectRecent(@Param("limit") int limit);
}

