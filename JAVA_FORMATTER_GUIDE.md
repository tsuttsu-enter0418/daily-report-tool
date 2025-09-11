# 🎨 Java フォーマッター設定ガイド

## 📋 概要

Javaコードの一貫したフォーマットを自動化するためのガイドです。
Spotlessプラグインを使用してGoogle Java Styleを適用します。

---

## 🔧 1. Spotlessプラグイン設定

### **pom.xml への追加**

`backend/pom.xml` の `<build><plugins>` セクションに以下を追加：

```xml
<build>
    <plugins>
        <!-- 既存のSpring Boot plugin -->
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>

        <!-- Spotless フォーマッタープラグイン -->
        <plugin>
            <groupId>com.diffplug.spotless</groupId>
            <artifactId>spotless-maven-plugin</artifactId>
            <version>2.43.0</version>
            <configuration>
                <java>
                    <!-- Java ファイルの対象指定 -->
                    <includes>
                        <include>src/main/java/**/*.java</include>
                        <include>src/test/java/**/*.java</include>
                    </includes>

                    <!-- Google Java Style 適用 -->
                    <googleJavaFormat>
                        <version>1.19.2</version>
                        <style>GOOGLE</style>
                        <reflowLongStrings>true</reflowLongStrings>
                    </googleJavaFormat>

                    <!-- 不要なインポートを削除 -->
                    <removeUnusedImports />

                    <!-- インポートの順序を統一 -->
                    <importOrder>
                        <order>java,javax,org,com</order>
                    </importOrder>

                    <!-- ファイル末尾の改行を統一 */
                    <endWithNewline />
                </java>
            </configuration>
            <executions>
                <!-- テスト実行前に自動フォーマット -->
                <execution>
                    <goals>
                        <goal>check</goal>
                    </goals>
                    <phase>test</phase>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

---

## 🚀 2. 使用方法

### **基本コマンド**

```bash
cd backend

# 1. フォーマットをチェック（違反があれば失敗）
./mvnw spotless:check

# 2. フォーマットを自動適用
./mvnw spotless:apply

# 3. 特定のファイルのみフォーマット
./mvnw spotless:apply -Dspotless.ratchet.from=origin/main
```

### **開発ワークフロー統合**

```bash
# 開発時の推奨フロー
./mvnw spotless:apply  # フォーマット適用
./mvnw test           # テスト実行
git add .
git commit -m "feat: 新機能実装"
```

---

## 📏 3. フォーマットルール

### **適用されるスタイル**

| 項目 | ルール | 例 |
|------|--------|-----|
| **インデント** | 2スペース | `if (condition) {\\n  return true;\\n}` |
| **行の長さ** | 最大100文字 | 自動改行 |
| **インポート順序** | `java` → `javax` → `org` → `com` | 自動ソート |
| **メソッド間隔** | 1行空行 | 自動調整 |
| **不要インポート** | 自動削除 | unused import削除 |

### **コメント・Javadoc**

```java
/**
 * クラスの説明
 * 
 * <p>詳細な説明がある場合は
 * このように記述します。
 * 
 * @author 作成者
 * @since 1.0.0
 */
public class ExampleController {
  
  /**
   * メソッドの説明
   * 
   * @param request リクエストパラメータ
   * @return レスポンスオブジェクト
   * @throws IllegalArgumentException 無効な引数の場合
   */
  public ResponseEntity<?> handleRequest(RequestDto request) {
    // 実装
  }
}
```

---

## 🛠️ 4. IDE統合

### **IntelliJ IDEA**

1. **Google Java Format プラグインインストール**：
   - `File` > `Settings` > `Plugins`
   - "google-java-format" を検索・インストール

2. **設定有効化**：
   - `File` > `Settings` > `google-java-format Settings`
   - "Enable google-java-format" にチェック

3. **保存時自動フォーマット**：
   - `File` > `Settings` > `Tools` > `Actions on Save`
   - "Reformat code" にチェック

### **VSCode**

1. **Extension Pack for Java インストール**

2. **settings.json 設定**：
```json
{
  "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml",
  "java.format.settings.profile": "GoogleStyle",
  "editor.formatOnSave": true
}
```

---

## 🎯 5. CI/CD統合

### **GitHub Actions**

`.github/workflows/java-format-check.yml`:

```yaml
name: Java Format Check

on:
  pull_request:
    paths:
      - 'backend/src/**/*.java'

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          
      - name: Check Java formatting
        run: |
          cd backend
          ./mvnw spotless:check
          
      - name: Comment on PR if format issues
        if: failure()
        run: |
          echo "コードフォーマットエラーが検出されました。"
          echo "修正するには: ./mvnw spotless:apply を実行してください。"
```

---

## 🔍 6. トラブルシューティング

### **よくある問題と解決法**

#### **問題1: 長い文字列のフォーマット**

```java
// ❌ フォーマットで改行されすぎる
String longMessage = "これは非常に長いメッセージで、"
    + "複数行にわたって記述される内容です";

// ✅ Text Blocks使用
String longMessage = """
    これは非常に長いメッセージで、
    複数行にわたって記述される内容です
    """;
```

#### **問題2: アノテーションのフォーマット**

```java
// ✅ 推奨: 1行1アノテーション
@RestController
@RequestMapping("/api/auth")
@Tag(name = "認証 API")
public class AuthController {
  
  // ✅ 複雑なアノテーションは改行して整理
  @Operation(
      summary = "ユーザーログイン",
      description = "認証処理"
  )
  @PostMapping("/login")
  public ResponseEntity<?> login() {
    // 実装
  }
}
```

#### **問題3: Maven実行時のエラー**

```bash
# エラー: Plugin not found
./mvnw spotless:check

# 解決: Maven依存関係を更新
./mvnw clean install
./mvnw spotless:check
```

---

## 📈 7. フォーマット品質の測定

### **品質指標**

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| **フォーマット準拠率** | 100% | `spotless:check` |
| **インポート最適化** | 100% | unused import 0件 |
| **行の長さ違反** | 0件 | 100文字以内 |
| **一貫性スコア** | 100% | Google Style準拠 |

### **測定コマンド**

```bash
# フォーマット違反の詳細表示
./mvnw spotless:check -X

# 修正前後の差分表示
git diff --name-only | xargs ./mvnw spotless:check
```

---

## 🎯 8. 実装推奨手順

### **Step 1: プラグイン追加**
1. `pom.xml` に Spotless プラグイン追加
2. `./mvnw clean install` で依存関係更新

### **Step 2: 既存コードのフォーマット**
```bash
cd backend
./mvnw spotless:apply
```

### **Step 3: IDE設定**
- IntelliJ IDEA または VSCode でプラグイン設定

### **Step 4: CI/CD統合**
- GitHub Actions に format check 追加

### **Step 5: チーム周知**
- 開発チームにフォーマットルール共有
- コミット前の `spotless:apply` 実行を徹底

---

**作成日**: 2025-09-11  
**対象プロジェクト**: daily-report-tool  
**Java バージョン**: 17  
**フォーマッター**: Google Java Style