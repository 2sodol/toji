package com.toji.toji.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Attachment {

  private Long ilglAttflSeq; // ILGL_ATTFL_SEQ (PK)
  private Long ilglPrvuAddrSeq; // ILGL_PRVU_ADDR_SEQ (FK - ILGL_PRVU_INFO_SEQ와 연결)
  private String attflNm; // ATTFL_NM (첨부파일명)
  private String attflPath; // ATTFL_PATH (첨부파일경로)
  private Long attflCpct; // ATTFL_CPCT (첨부파일용량)
  private String ocrnDates; // OCRN_DATES (발생일자, VARCHAR2(100))
  private String webPath; // 웹 접근 경로 (DB 컬럼 아님, 응답용)
  private String useYn; // USE_YN (사용여부)
}
