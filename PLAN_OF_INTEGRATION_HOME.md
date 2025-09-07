左画面は常にホーム情報を表示し、右ペインに日報の投稿や履歴を確認できるようにする

以下、Claude から Issue
Phase 1: 状態管理のセットアップ

- 右ペインの状態を表す RightPaneView 型定義を作成
- 右ペイン状態管理用の Jotai atom 実装（rightPaneViewAtom）
- すべての表示タイプ用の状態構造定義（create/edit/list/detail/supervisor）

Phase 2: Home コンポーネントのリファクタリング

- Home コンポーネントに状態管理を統合
- switch 文を使った renderRightPane()関数の実装
- 状態に基づいて動的にコンポーネントをレンダリングするよう右ペインを更新

Phase 3: ActionSection コンポーネントの更新

- navigate()呼び出しを状態更新（setRightPaneView）に変更
- すべてのアクションボタンハンドラーを更新：
  - 「日報を作成」→ { type: 'create' }
  - 「自分の日報履歴」→ { type: 'list' }
  - 「チーム日報を確認」→ { type: 'supervisor' }

Phase 4: コンポーネントの右ペイン最適化

- DailyReportForm が右ペインコンテキストで適切に動作することを確認
- フォーム送信フローをナビゲーションから状態更新に変更
- 右ペイン表示用の DailyReportList コンポーネント作成/最適化
- SupervisorDashboard を右ペインレイアウトに適応

Phase 5: URL 同期（オプション）

- 現在の右ペイン状態を URL に反映する実装
- ブラウザの戻る/進むナビゲーションサポート追加
- 特定の状態のブックマーク機能を有効化

---

🔧 技術詳細

状態構造

type RightPaneView =
| { type: 'create' } // 新規作成
| { type: 'edit', reportId: number } // 編集
| { type: 'list' } // 一覧表示
| { type: 'detail', reportId: number } // 詳細表示
| { type: 'supervisor' } // 上司ダッシュボード

修正対象ファイル

- src/pages/Home.tsx - メインレイアウトと状態管理
- src/components/organisms/ActionSection.tsx - ボタンアクションハンドラー
- src/pages/DailyReportForm.tsx - フォーム送信動作
- src/atoms/rightPaneAtom.ts - 新規状態管理 atom

---

✅ 受け入れ基準

- 左ペインが常に表示され、機能し続ける
- 「日報を作成」ボタンでページリロードなしに右ペインに作成フォームが表示される
- 「自分の日報履歴」ボタンで右ペインに日報一覧が表示される
- 「チーム日報を確認」ボタンで右ペインに上司ダッシュボードが表示される
- フォーム送信時に適切に右ペインコンテンツが更新される
- 日報関連アクションで画面全体のナビゲーションが発生しない
- 既存の機能がすべて保持される
- ブラウザパフォーマンスが維持または改善される（不要な再レンダリングなし）

---

🎨 UI/UX への影響

メリット

- ⚡ 高速ナビゲーション: ページリロードではなく状態更新
- 🧭 コンテキスト保持の向上: ユーザー情報とアクションが常に表示
- 📱 一貫したエクスペリエンス: すべての日報機能が統一レイアウト内で完結
- 🔄 シームレスな遷移: スムーズなコンテンツ切り替え

潜在的な課題

- コンポーネント再レンダリング最適化
- 状態管理の複雑性
- URL 同期実装時の考慮事項
