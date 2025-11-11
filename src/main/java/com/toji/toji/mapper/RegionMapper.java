package com.toji.toji.mapper;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.BasicInfo;
import com.toji.toji.domain.PhotoMetadata;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RegionMapper {

  int insertBasicInfo(BasicInfo basicInfo);

  int insertActionHistory(ActionHistory actionHistory);

  int insertPhotoMetadata(PhotoMetadata photoMetadata);
}

