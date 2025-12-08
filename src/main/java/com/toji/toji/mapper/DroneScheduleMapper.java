package com.toji.toji.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DroneScheduleMapper {
    /**
     * Merge a schedule date. Inserts if not exists.
     * 
     * @param schedYmd The date string (YYYYMMDD)
     */
    void mergeScheduleDate(String schedYmd);

    /**
     * Select all schedule dates.
     * 
     * @return List of date strings
     */
    List<String> selectAllScheduleDates();
}
