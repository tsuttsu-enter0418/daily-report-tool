package com.example.dailyreport.repository;

import com.example.dailyreport.entity.DailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 日報データアクセス層
 * 
 * 機能:
 * - 日報の基本CRUD操作
 * - ユーザー別日報検索
 * - ステータス別フィルタリング
 * - 日付範囲での検索
 * - 上司による部下日報検索
 * 
 * 主要メソッド:
 * - findByUserId: 特定ユーザーの日報一覧取得
 * - findByUserIdAndReportDate: 特定ユーザーの特定日日報取得
 * - findByUserIdAndStatus: ステータス別日報検索
 * - findBySupervisorId: 上司による部下日報一覧取得
 * - findByReportDateBetween: 日付範囲検索
 */
@Repository
public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {

    /**
     * 特定ユーザーの日報一覧を取得（新しい順）
     * @param userId ユーザーID
     * @return 日報一覧
     */
    List<DailyReport> findByUserIdOrderByReportDateDesc(Long userId);

    /**
     * 特定ユーザーの特定日の日報を取得
     * @param userId ユーザーID
     * @param reportDate 対象日
     * @return 日報（存在しない場合はEmpty）
     */
    Optional<DailyReport> findByUserIdAndReportDate(Long userId, LocalDate reportDate);

    /**
     * 特定ユーザーの特定ステータスの日報一覧を取得
     * @param userId ユーザーID
     * @param status ステータス（draft/submitted）
     * @return 日報一覧
     */
    List<DailyReport> findByUserIdAndStatusOrderByReportDateDesc(Long userId, String status);

    /**
     * 特定ユーザーの日付範囲内の日報一覧を取得
     * @param userId ユーザーID
     * @param startDate 開始日
     * @param endDate 終了日
     * @return 日報一覧
     */
    List<DailyReport> findByUserIdAndReportDateBetweenOrderByReportDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 上司の部下全員の日報一覧を取得
     * 部下のユーザーIDを指定して、その部下たちの日報を取得
     * @param subordinateUserIds 部下のユーザーIDリスト
     * @return 部下の日報一覧
     */
    @Query("SELECT dr FROM DailyReport dr WHERE dr.userId IN :subordinateUserIds ORDER BY dr.reportDate DESC, dr.userId")
    List<DailyReport> findByUserIdInOrderByReportDateDescUserIdAsc(@Param("subordinateUserIds") List<Long> subordinateUserIds);

    /**
     * 上司の部下全員の特定ステータスの日報一覧を取得
     * @param subordinateUserIds 部下のユーザーIDリスト
     * @param status ステータス
     * @return 部下の日報一覧
     */
    @Query("SELECT dr FROM DailyReport dr WHERE dr.userId IN :subordinateUserIds AND dr.status = :status ORDER BY dr.reportDate DESC, dr.userId")
    List<DailyReport> findByUserIdInAndStatusOrderByReportDateDescUserIdAsc(
        @Param("subordinateUserIds") List<Long> subordinateUserIds, 
        @Param("status") String status);

    /**
     * 全ユーザーの特定日の日報一覧を取得（管理者用）
     * @param reportDate 対象日
     * @return 日報一覧
     */
    List<DailyReport> findByReportDateOrderByUserIdAsc(LocalDate reportDate);

    /**
     * 全ユーザーの日付範囲内の日報一覧を取得（管理者用）
     * @param startDate 開始日
     * @param endDate 終了日
     * @return 日報一覧
     */
    List<DailyReport> findByReportDateBetweenOrderByReportDateDescUserIdAsc(LocalDate startDate, LocalDate endDate);

    /**
     * 特定ユーザーの日報件数を取得
     * @param userId ユーザーID
     * @return 日報件数
     */
    long countByUserId(Long userId);

    /**
     * 特定ユーザーの特定ステータスの日報件数を取得
     * @param userId ユーザーID
     * @param status ステータス
     * @return 日報件数
     */
    long countByUserIdAndStatus(Long userId, String status);

    /**
     * 特定ユーザーが本日の日報を既に作成しているかチェック
     * @param userId ユーザーID
     * @param today 今日の日付
     * @return 存在する場合true
     */
    boolean existsByUserIdAndReportDate(Long userId, LocalDate today);
}