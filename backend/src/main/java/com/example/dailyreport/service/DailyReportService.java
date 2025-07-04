package com.example.dailyreport.service;

import com.example.dailyreport.dto.DailyReportRequest;
import com.example.dailyreport.dto.DailyReportResponse;
import com.example.dailyreport.dto.DailyReportListResponse;
import com.example.dailyreport.entity.DailyReport;
import com.example.dailyreport.entity.User;
import com.example.dailyreport.repository.DailyReportRepository;
import com.example.dailyreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 日報ビジネスロジックサービス
 * 
 * 機能:
 * - 日報の作成・取得・更新・削除
 * - ユーザー別日報管理
 * - 上司による部下日報管理
 * - ステータス別フィルタリング
 * - エンティティ⇔DTO変換
 * - ビジネスルール適用
 * 
 * ビジネスルール:
 * - 1日1件制限の確認
 * - 本人または上司のみアクセス可能
 * - 提出済み日報の編集制限
 * - 作業内容文字数制限
 * 
 * トランザクション:
 * - 読み取り専用操作: @Transactional(readOnly = true)
 * - 更新操作: @Transactional
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DailyReportService {

    private final DailyReportRepository dailyReportRepository;
    private final UserRepository userRepository;

    /**
     * 新規日報作成
     * @param userId 作成者ID
     * @param request 日報作成リクエスト
     * @return 作成された日報
     * @throws IllegalArgumentException 1日1件制限違反の場合
     */
    @Transactional
    public DailyReportResponse createDailyReport(Long userId, DailyReportRequest request) {
        log.info("日報作成開始: userId={}, reportDate={}", userId, request.getReportDate());

        // 1日1件制限チェック
        if (dailyReportRepository.existsByUserIdAndReportDate(userId, request.getReportDate())) {
            throw new IllegalArgumentException("指定日の日報は既に存在します");
        }

        // ユーザー存在確認
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません"));

        // エンティティ作成
        DailyReport dailyReport = DailyReport.builder()
            .userId(userId)
            .title(request.getTitle())
            .workContent(request.getWorkContent())
            .status(request.getStatus())
            .reportDate(request.getReportDate())
            .submittedAt(request.isSubmitted() ? LocalDateTime.now() : null)
            .build();

        // 保存
        DailyReport saved = dailyReportRepository.save(dailyReport);
        log.info("日報作成完了: id={}", saved.getId());

        return convertToResponse(saved, user);
    }

    /**
     * 日報更新
     * @param reportId 日報ID
     * @param userId 更新者ID
     * @param request 日報更新リクエスト
     * @return 更新された日報
     * @throws IllegalArgumentException 権限がない場合
     */
    @Transactional
    public DailyReportResponse updateDailyReport(Long reportId, Long userId, DailyReportRequest request) {
        log.info("日報更新開始: reportId={}, userId={}", reportId, userId);

        // 日報取得・権限チェック
        DailyReport dailyReport = dailyReportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("日報が見つかりません"));

        if (!dailyReport.getUserId().equals(userId)) {
            throw new IllegalArgumentException("権限がありません");
        }

        // ユーザー取得
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません"));

        // 更新
        dailyReport.setTitle(request.getTitle());
        dailyReport.setWorkContent(request.getWorkContent());
        dailyReport.setStatus(request.getStatus());
        dailyReport.setReportDate(request.getReportDate());

        // ステータス変更時の提出日時管理
        if (request.isSubmitted() && dailyReport.getSubmittedAt() == null) {
            dailyReport.setSubmittedAt(LocalDateTime.now());
        } else if (request.isDraft()) {
            dailyReport.setSubmittedAt(null);
        }

        DailyReport saved = dailyReportRepository.save(dailyReport);
        log.info("日報更新完了: id={}", saved.getId());

        return convertToResponse(saved, user);
    }

    /**
     * 日報詳細取得
     * @param reportId 日報ID
     * @param userId 取得者ID
     * @return 日報詳細
     */
    @Transactional(readOnly = true)
    public Optional<DailyReportResponse> getDailyReportById(Long reportId, Long userId) {
        return dailyReportRepository.findById(reportId)
            .filter(report -> canAccessReport(report, userId))
            .map(report -> {
                User user = userRepository.findById(report.getUserId()).orElse(null);
                return convertToResponse(report, user);
            });
    }

    /**
     * 自分の日報一覧取得
     * @param userId ユーザーID
     * @param status ステータスフィルタ（nullの場合は全件）
     * @return 日報一覧
     */
    @Transactional(readOnly = true)
    public List<DailyReportListResponse> getMyDailyReports(Long userId, String status) {
        List<DailyReport> reports;
        
        if (status != null && !status.trim().isEmpty()) {
            reports = dailyReportRepository.findByUserIdAndStatusOrderByReportDateDesc(userId, status);
        } else {
            reports = dailyReportRepository.findByUserIdOrderByReportDateDesc(userId);
        }

        User user = userRepository.findById(userId).orElse(null);
        return reports.stream()
            .map(report -> convertToListResponse(report, user))
            .collect(Collectors.toList());
    }

    /**
     * 部下の日報一覧取得（上司用）
     * @param supervisorId 上司ID
     * @param status ステータスフィルタ（nullの場合は全件）
     * @return 部下の日報一覧
     */
    @Transactional(readOnly = true)
    public List<DailyReportListResponse> getSubordinateReports(Long supervisorId, String status) {
        // 部下一覧取得
        List<User> subordinates = userRepository.findBySupervisorId(supervisorId);
        List<Long> subordinateIds = subordinates.stream()
            .map(User::getId)
            .collect(Collectors.toList());

        if (subordinateIds.isEmpty()) {
            return List.of();
        }

        // 部下の日報取得
        List<DailyReport> reports;
        if (status != null && !status.trim().isEmpty()) {
            reports = dailyReportRepository.findByUserIdInAndStatusOrderByReportDateDescUserIdAsc(subordinateIds, status);
        } else {
            reports = dailyReportRepository.findByUserIdInOrderByReportDateDescUserIdAsc(subordinateIds);
        }

        // ユーザー情報マップ作成
        var userMap = subordinates.stream()
            .collect(Collectors.toMap(User::getId, user -> user));

        return reports.stream()
            .map(report -> convertToListResponse(report, userMap.get(report.getUserId())))
            .collect(Collectors.toList());
    }

    /**
     * 日報削除
     * @param reportId 日報ID
     * @param userId 削除者ID
     * @throws IllegalArgumentException 権限がない場合
     */
    @Transactional
    public void deleteDailyReport(Long reportId, Long userId) {
        log.info("日報削除開始: reportId={}, userId={}", reportId, userId);

        DailyReport dailyReport = dailyReportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("日報が見つかりません"));

        if (!dailyReport.getUserId().equals(userId)) {
            throw new IllegalArgumentException("権限がありません");
        }

        dailyReportRepository.delete(dailyReport);
        log.info("日報削除完了: reportId={}", reportId);
    }

    /**
     * 本日の日報存在チェック
     * @param userId ユーザーID
     * @return 存在する場合true
     */
    @Transactional(readOnly = true)
    public boolean hasTodayReport(Long userId) {
        return dailyReportRepository.existsByUserIdAndReportDate(userId, LocalDate.now());
    }

    /**
     * アクセス権限チェック
     * @param report 日報
     * @param userId アクセス者ID
     * @return アクセス可能な場合true
     */
    private boolean canAccessReport(DailyReport report, Long userId) {
        // 本人の場合
        if (report.getUserId().equals(userId)) {
            return true;
        }

        // 上司の場合
        User reportUser = userRepository.findById(report.getUserId()).orElse(null);
        return reportUser != null && userId.equals(reportUser.getSupervisorId());
    }

    /**
     * エンティティ→レスポンスDTO変換
     */
    private DailyReportResponse convertToResponse(DailyReport report, User user) {
        return DailyReportResponse.builder()
            .id(report.getId())
            .userId(report.getUserId())
            .username(user != null ? user.getUsername() : null)
            .displayName(user != null ? user.getDisplayName() : null)
            .title(report.getTitle())
            .workContent(report.getWorkContent())
            .status(report.getStatus())
            .reportDate(report.getReportDate())
            .submittedAt(report.getSubmittedAt())
            .createdAt(report.getCreatedAt())
            .updatedAt(report.getUpdatedAt())
            .build();
    }

    /**
     * エンティティ→リストレスポンスDTO変換
     */
    private DailyReportListResponse convertToListResponse(DailyReport report, User user) {
        String preview = report.getWorkContent() != null && report.getWorkContent().length() > 100
            ? report.getWorkContent().substring(0, 100) + "..."
            : report.getWorkContent();

        return DailyReportListResponse.builder()
            .id(report.getId())
            .userId(report.getUserId())
            .username(user != null ? user.getUsername() : null)
            .displayName(user != null ? user.getDisplayName() : null)
            .title(report.getTitle())
            .workContentPreview(preview)
            .status(report.getStatus())
            .reportDate(report.getReportDate())
            .submittedAt(report.getSubmittedAt())
            .createdAt(report.getCreatedAt())
            .build();
    }
}