package com.example.dailyreport.controller;

import com.example.dailyreport.dto.DailyReportRequest;
import com.example.dailyreport.dto.DailyReportResponse;
import com.example.dailyreport.dto.DailyReportListResponse;
import com.example.dailyreport.service.DailyReportService;
import com.example.dailyreport.repository.UserRepository;
import com.example.dailyreport.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 日報管理REST APIコントローラー
 * 
 * 機能:
 * - 日報の作成・取得・更新・削除API
 * - 個人日報一覧取得API
 * - 上司用部下日報一覧取得API
 * - OpenAPI/Swagger対応
 * - JWT認証連携
 * 
 * エンドポイント:
 * - POST /api/daily-reports : 日報作成
 * - GET /api/daily-reports/{id} : 日報詳細取得
 * - PUT /api/daily-reports/{id} : 日報更新
 * - DELETE /api/daily-reports/{id} : 日報削除
 * - GET /api/daily-reports/my : 自分の日報一覧
 * - GET /api/daily-reports/subordinates : 部下日報一覧（上司用）
 * 
 * 認証:
 * - JWT認証必須
 * - ユーザーIDは認証情報から取得
 */
@RestController
@RequestMapping("/api/daily-reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Daily Reports", description = "日報管理API")
public class DailyReportController extends BaseController {

    private final DailyReportService dailyReportService;

    /**
     * 日報作成
     */
    @PostMapping
    @Operation(
        summary = "日報作成",
        description = "新しい日報を作成します。1日1件まで作成可能です。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "日報作成成功"),
        @ApiResponse(responseCode = "400", description = "バリデーションエラーまたは1日1件制限違反"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<DailyReportResponse> createDailyReport(
            @Valid @RequestBody DailyReportRequest request,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        log.info("日報作成リクエスト: userId={}, reportDate={}", userId, request.getReportDate());

        try {
            DailyReportResponse response = dailyReportService.createDailyReport(userId, request);
            log.info("日報作成成功: reportId={}", response.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("日報作成失敗: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 日報詳細取得
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "日報詳細取得",
        description = "指定IDの日報詳細を取得します。本人または上司のみアクセス可能です。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "404", description = "日報が見つからない、または権限なし"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<DailyReportResponse> getDailyReport(
            @Parameter(description = "日報ID") @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        log.info("日報詳細取得: reportId={}, userId={}", id, userId);

        Optional<DailyReportResponse> report = dailyReportService.getDailyReportById(id, userId);
        return report
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 日報更新
     */
    @PutMapping("/{id}")
    @Operation(
        summary = "日報更新",
        description = "指定IDの日報を更新します。本人のみ更新可能です。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "400", description = "バリデーションエラー"),
        @ApiResponse(responseCode = "404", description = "日報が見つからない、または権限なし"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<DailyReportResponse> updateDailyReport(
            @Parameter(description = "日報ID") @PathVariable Long id,
            @Valid @RequestBody DailyReportRequest request,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        log.info("日報更新リクエスト: reportId={}, userId={}", id, userId);

        try {
            DailyReportResponse response = dailyReportService.updateDailyReport(id, userId, request);
            log.info("日報更新成功: reportId={}", id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("日報更新失敗: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 日報削除
     */
    @DeleteMapping("/{id}")
    @Operation(
        summary = "日報削除",
        description = "指定IDの日報を削除します。本人のみ削除可能です。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "削除成功"),
        @ApiResponse(responseCode = "404", description = "日報が見つからない、または権限なし"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<Void> deleteDailyReport(
            @Parameter(description = "日報ID") @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        log.info("日報削除リクエスト: reportId={}, userId={}", id, userId);

        try {
            dailyReportService.deleteDailyReport(id, userId);
            log.info("日報削除成功: reportId={}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("日報削除失敗: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 自分の日報一覧取得
     */
    @GetMapping("/my")
    @Operation(
        summary = "自分の日報一覧取得",
        description = "認証ユーザーの日報一覧を取得します。ステータスでフィルタリング可能です。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<List<DailyReportListResponse>> getMyDailyReports(
            @Parameter(description = "ステータスフィルタ (draft/submitted)") 
            @RequestParam(required = false) String status,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        log.info("自分の日報一覧取得: userId={}, status={}", userId, status);

        List<DailyReportListResponse> reports = dailyReportService.getMyDailyReports(userId, status);
        log.info("日報一覧取得成功: userId={}, count={}", userId, reports.size());
        
        return ResponseEntity.ok(reports);
    }

    /**
     * 部下の日報一覧取得（上司用）
     */
    @GetMapping("/subordinates")
    @Operation(
        summary = "部下の日報一覧取得",
        description = "認証ユーザーの部下の日報一覧を取得します。上司・管理者のみアクセス可能です。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "取得成功"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<List<DailyReportListResponse>> getSubordinateReports(
            @Parameter(description = "ステータスフィルタ (draft/submitted)") 
            @RequestParam(required = false) String status,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        log.info("部下日報一覧取得: supervisorId={}, status={}", userId, status);

        List<DailyReportListResponse> reports = dailyReportService.getSubordinateReports(userId, status);
        log.info("部下日報一覧取得成功: supervisorId={}, count={}", userId, reports.size());
        
        return ResponseEntity.ok(reports);
    }

    /**
     * 本日の日報存在チェック
     */
    @GetMapping("/today/exists")
    @Operation(
        summary = "本日の日報存在チェック",
        description = "認証ユーザーが本日の日報を既に作成しているかチェックします。"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "チェック成功"),
        @ApiResponse(responseCode = "401", description = "認証エラー")
    })
    public ResponseEntity<Boolean> hasTodayReport(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        boolean exists = dailyReportService.hasTodayReport(userId);
        log.info("本日日報存在チェック: userId={}, exists={}", userId, exists);
        
        return ResponseEntity.ok(exists);
    }

    // getUserIdFromAuth メソッドはBaseControllerから継承
}