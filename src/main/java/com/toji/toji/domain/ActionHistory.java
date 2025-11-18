package com.toji.toji.domain;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActionHistory {

  private Long ilglActnCtntSeq; // ILGL_ACTN_CTNT_SEQ
  private Long ilglPrvuInfoSeq; // ILGL_PRVU_INFO_SEQ (NOT NULL)
  private LocalDateTime actnDttm; // ACTN_DTTM (NOT NULL, DATE)
  private String actnCtnt; // ACTN_CTNT (NOT NULL)
  private String fsttmRgsrId; // FSTTM_RGSR_ID (NOT NULL)
  private LocalDateTime fsttmRgstDttm; // FSTTM_RGST_DTTM (NOT NULL)
  private String lsttmModfrId; // LSTTM_MODFR_ID (NOT NULL)
  private LocalDateTime lsttmAltrDttm; // LSTTM_ALTR_DTTM (NOT NULL)
  private String useYn; // USE_YN (NOT NULL)
}
