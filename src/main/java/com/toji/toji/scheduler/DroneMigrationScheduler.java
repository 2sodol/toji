package com.toji.toji.scheduler;

import com.toji.toji.service.DroneMigrationService;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * 드론 원본 사진 이관 작업을 주기적으로 실행하는 스케줄러
 *
 * <p>
 * 내부 설정(CRON_EXPRESSION, IS_ENABLED, EXECUTION_CYCLE_DAYS)에 따라 주기적으로 실행되며,
 * 실제 마이그레이션 로직(DroneMigrationService)을 호출합니다.
 * </p>
 */
@Component
public class DroneMigrationScheduler {

    // 스케줄러 설정 상수
    private static final boolean IS_ENABLED = false; // 기능 활성화 여부
    private static final int EXECUTION_CYCLE_DAYS = 2; // 실행 주기 (일 단위)
    private static final String CRON_EXPRESSION = "0 0 3 * * *"; // 실행 시간 (매일 새벽 3시)

    @Autowired
    private DroneMigrationService droneMigrationService;

    // @PostConstruct
    // public void testRunOnStartup() {
    // // 별도 스레드에서 실행하여 서버 부팅 지연 방지
    // new Thread(() -> {
    // System.out.println(">> [TEST] 서버 시작 감지: 드론 데이터 이관 작업 즉시 실행");
    // try {
    // // 서버가 완전히 뜰 시간을 3초 정도 벌어줌 (선택사항)
    // Thread.sleep(3000);

    // // 서비스 호출
    // droneMigrationService.executeMigration();

    // } catch (Exception e) {
    // e.printStackTrace();
    // }
    // }).start();
    // }

    /**
     * 스케줄링된 마이그레이션 작업을 수행합니다.
     *
     * <p>
     * 1. 기능 활성화 여부(IS_ENABLED) 확인: false일 경우 중단
     * 2. 실행 주기 체크: 오늘 날짜(일)가 설정된 주기(EXECUTION_CYCLE_DAYS)로 나누어 떨어지는지 확인
     * 3. 조건 만족 시 서비스 로직 실행
     * </p>
     */
    @Scheduled(cron = CRON_EXPRESSION)
    public void runMigration() {
        if (!IS_ENABLED) {
            return;
        }

        // 오늘 날짜(일) 조회
        int dayOfMonth = LocalDate.now().getDayOfMonth();

        // 실행 주기(예: 2일 간격)에 해당하는 날인지 확인 (예: 짝수 날짜에만 실행)
        if (dayOfMonth % EXECUTION_CYCLE_DAYS == 0) {
            try {
                droneMigrationService.executeMigration();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
