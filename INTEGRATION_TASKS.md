# 🔧 フロントエンド・バックエンド整合性修正タスク

## 📋 タスク概要

フロントエンドのAPI通信処理とバックエンド実装の整合性問題を段階的に修正するためのタスクリストです。
優先度順に実装することで、システムの安定性とユーザーエクスペリエンスを向上させます。

---

## 🚨 最優先タスク（P0）- システム動作に必須

### Task-01: `/api/auth/validate` エンドポイント実装

**問題**: フロントエンドが自動ログイン時に呼び出すJWTトークン検証APIが未実装

**影響範囲**:
- 自動ログイン機能が動作しない
- ページリロード時にログアウトされる
- apiService.ts:163-181行で500エラー発生

**実装ファイル**: `backend/src/main/java/com/example/dailyreport/controller/AuthController.java`

**実装内容**:
```java
/**
 * JWTトークンの有効性検証
 */
@GetMapping("/validate")
public ResponseEntity<Void> validateToken(Authentication authentication) {
    try {
        // BaseControllerのgetUserIdFromAuthでユーザー存在チェック
        getUserIdFromAuth(authentication);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        return ResponseEntity.status(401).build();
    }
}
```

**必要なインポート**:
- `org.springframework.security.core.Authentication`

**テスト方法**:
1. 有効なJWTトークンでリクエスト → 200 OK
2. 無効なトークンでリクエスト → 401 Unauthorized
3. フロントエンドからの自動ログイン動作確認

---

### Task-02: `/api/auth/me` エンドポイント実装

**問題**: フロントエンドが認証ユーザー情報取得時に呼び出すAPIが未実装

**影響範囲**:
- ユーザー情報取得機能が動作しない
- apiService.ts:188-210行で500エラー発生
- Jotaiでのユーザー状態管理に影響

**実装ファイル**: `backend/src/main/java/com/example/dailyreport/controller/AuthController.java`

**実装内容**:
```java
/**
 * 現在のユーザー情報取得
 */
@GetMapping("/me")
public ResponseEntity<LoginResponse> getCurrentUser(Authentication authentication) {
    try {
        User user = getUserFromAuth(authentication);
        
        LoginResponse response = LoginResponse.builder()
            .token("") // /meエンドポイントではトークンは空
            .id(user.getId().toString())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .displayName(user.getDisplayName())
            .build();
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(401).build();
    }
}
```

**必要なインポート**:
- `com.example.dailyreport.entity.User`

**テスト方法**:
1. 認証済みユーザーでリクエスト → 200 OK + ユーザー情報
2. 未認証でリクエスト → 401 Unauthorized
3. フロントエンドでのユーザー情報表示確認

---

## 🟡 高優先タスク（P1）- UX向上・安定性

### Task-03: AuthController エラーレスポンス形式統一

**問題**: ログインエラー時の文字列レスポンスがフロントエンドのJSON期待と不整合

**影響範囲**:
- ログイン失敗時のエラーメッセージが適切に表示されない
- handleApiError関数での処理が不適切

**実装ファイル**: `backend/src/main/java/com/example/dailyreport/controller/AuthController.java`

**修正箇所**: 112-113行目

**修正前**:
```java
return ResponseEntity.badRequest().body("ログインに失敗しました: " + e.getMessage());
```

**修正後**:
```java
Map<String, String> errorResponse = new HashMap<>();
errorResponse.put("message", "ログインに失敗しました: " + e.getMessage());
errorResponse.put("status", "400");
return ResponseEntity.badRequest().body(errorResponse);
```

**必要なインポート**:
- `java.util.Map`
- `java.util.HashMap`

**テスト方法**:
1. 無効な認証情報でログイン → JSON形式エラーレスポンス確認
2. フロントエンドでのエラーメッセージ表示確認

---

### Task-04: データ型安全性向上

**問題**: Long→String変換が暗黙的で型安全性に問題

**影響範囲**:
- TypeScript型チェックの効果が薄れる
- 将来的なデータ型変更時の影響範囲が不明確

**実装ファイル**: 
- `backend/src/main/java/com/example/dailyreport/service/AuthService.java`
- `backend/src/main/java/com/example/dailyreport/dto/DailyReportResponse.java`

**修正内容**:

1. **AuthServiceでの明示的な型変換**:
```java
// LoginResponse生成時
.id(user.getId().toString()) // 明示的にLong→String変換
```

2. **DailyReportResponseでのフィールドコメント追加**:
```java
/** 作成者ID（フロントエンド側ではnumber型として扱われる） */
private Long userId;
```

**テスト方法**:
1. APIレスポンスの型情報確認
2. フロントエンドでの型エラーがないことを確認

---

## 🟢 中優先タスク（P2）- 保守性向上

### Task-05: 日付フォーマット設定の明示化

**問題**: 日付形式がSpring Bootの自動変換に依存、明示的な設定がない

**影響範囲**:
- 将来的なタイムゾーン問題
- 日付フォーマットの不整合リスク

**実装ファイル**: `backend/src/main/java/com/example/dailyreport/dto/DailyReportRequest.java`, `DailyReportResponse.java`

**修正内容**:
```java
@JsonFormat(pattern = "yyyy-MM-dd")
@NotNull(message = "対象日は必須です")
private LocalDate reportDate;
```

**必要なインポート**:
- `com.fasterxml.jackson.annotation.JsonFormat`

**テスト方法**:
1. 日付形式でのAPIリクエスト・レスポンス確認
2. 無効な日付フォーマットでのエラー確認

---

### Task-06: OpenAPI/Swagger文書更新

**問題**: 新規追加APIの文書化が不足

**影響範囲**:
- 開発効率の低下
- API仕様の不明確化

**実装ファイル**: `backend/src/main/java/com/example/dailyreport/controller/AuthController.java`

**修正内容**:
- Task-01, Task-02で追加するエンドポイントに`@Operation`アノテーション追加
- `@ApiResponse`でのレスポンス例追加
- Swagger UIでの動作確認

**テスト方法**:
1. http://localhost:8080/swagger-ui.html でAPI文書確認
2. 新規エンドポイントのテスト実行

---

### Task-07: デバッグモード時の整合性検証

**問題**: JWT認証スキップ時のフロント・バック連携が未検証

**影響範囲**:
- 開発環境での動作不整合
- トークンレス開発時の問題

**実装ファイル**: `backend/src/main/resources/application.properties`

**検証内容**:
1. `jwt.auth.enabled=false`設定でのAPI動作確認
2. フロントエンドからの認証ヘッダーなしでのAPI呼び出し
3. デフォルトユーザー（user1）での各種API動作確認

**テスト方法**:
1. 設定変更後のSpring Boot再起動
2. フロントエンドからの各種API呼び出しテスト
3. 認証系APIの動作確認

---

## 📊 実装スケジュール推奨

| 週 | タスク | 所要時間 | 成果物 |
|----|--------|----------|--------|
| Week 1 | Task-01, Task-02 | 4時間 | 認証API完全実装 |
| Week 2 | Task-03, Task-04 | 3時間 | エラー処理・型安全性向上 |
| Week 3 | Task-05, Task-06, Task-07 | 2時間 | 保守性・文書化完成 |

## 🧪 統合テスト計画

### 各タスク完了後のテスト項目

1. **認証フロー**: ログイン → トークン検証 → ユーザー情報取得
2. **日報CRUD**: 作成 → 取得 → 更新 → 削除の完全フロー
3. **エラーハンドリング**: 各種エラーケースでの適切なレスポンス
4. **型安全性**: TypeScriptでの型エラーがないことを確認

### 最終統合テスト

- フロントエンド `npm run dev:api` での実API連携
- 全機能の動作確認
- レスポンス時間・エラー率の測定

---

## 📚 関連ドキュメント

- [CLAUDE.md](./CLAUDE.md) - プロジェクト全体のガイドライン
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) - データベース設計
- [frontend/src/services/apiService.ts](./frontend/src/services/apiService.ts) - API通信実装
- [backend/src/main/java/com/example/dailyreport/controller/](./backend/src/main/java/com/example/dailyreport/controller/) - バックエンドController群

---

**作成日**: 2025-09-11  
**更新日**: 2025-09-11  
**作成者**: Claude Code Analysis