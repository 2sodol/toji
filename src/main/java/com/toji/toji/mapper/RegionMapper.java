package com.toji.toji.mapper;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.BasicInfo;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RegionMapper {

  int insertBasicInfo(BasicInfo basicInfo);

  int insertActionHistory(ActionHistory actionHistory);

  BasicInfo findById(Long id);

  List<BasicInfo> findAll();

  List<BasicInfo> findAllWithPaging(int offset, int limit);

  int countAll();

  int updateBasicInfo(BasicInfo basicInfo);

  int deleteBasicInfo(Long id);

  List<ActionHistory> findActionHistoriesByBasicInfoId(Long basicInfoId);

  int deleteActionHistoriesByBasicInfoId(Long basicInfoId);
}

