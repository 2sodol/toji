package com.toji.toji.mapper;

import com.toji.toji.domain.ActionHistory;
import com.toji.toji.domain.BasicInfo;
import com.toji.toji.domain.PhotoMetadata;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RegionMapper {

  int insertBasicInfo(BasicInfo basicInfo);

  int insertActionHistory(ActionHistory actionHistory);

  int insertPhotoMetadata(PhotoMetadata photoMetadata);

  BasicInfo findById(Long id);

  List<BasicInfo> findAll();

  int updateBasicInfo(BasicInfo basicInfo);

  int deleteBasicInfo(Long id);

  List<ActionHistory> findActionHistoriesByBasicInfoId(Long basicInfoId);

  List<PhotoMetadata> findPhotoMetadataByBasicInfoId(Long basicInfoId);

  int deleteActionHistoriesByBasicInfoId(Long basicInfoId);

  int deletePhotoMetadataByBasicInfoId(Long basicInfoId);
}

