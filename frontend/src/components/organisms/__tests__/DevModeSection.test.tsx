import { describe, it, expect } from "vitest";
import { render } from "@/test/utils";
import { DevModeSection } from "../DevModeSection";

/**
 * DevModeSection コンポーネントのテスト
 * 
 * テスト対象:
 * - 開発モードでない場合の非表示
 * - Mock API モードでの表示
 * - Real API モードでの表示
 * - 本番モードでの非表示
 */
describe("DevModeSection", () => {
  it("開発モードでない場合は何も表示されない", () => {
    const { queryByText } = render(
      <DevModeSection isDevelopment={false} useRealAPI={false} />
    );
    
    expect(queryByText(/開発モード/)).not.toBeInTheDocument();
  });

  it("Mock APIモードで正しい情報が表示される", () => {
    const { getByText } = render(
      <DevModeSection isDevelopment={true} useRealAPI={false} />
    );
    
    expect(getByText(/開発モード.*モックAPI使用中/)).toBeInTheDocument();
    expect(getByText(/モックAPIを使用しています/)).toBeInTheDocument();
    expect(getByText(/npm run dev:api/)).toBeInTheDocument();
  });

  it("Real APIモードでバッジのみ表示される", () => {
    const { getByText, queryByText } = render(
      <DevModeSection isDevelopment={true} useRealAPI={true} />
    );
    
    expect(getByText(/開発モード.*実際のAPI使用中/)).toBeInTheDocument();
    // Mock API の説明は表示されない
    expect(queryByText(/モックAPIを使用しています/)).not.toBeInTheDocument();
  });

  it("本番モードでは何も表示されない", () => {
    const { queryByText } = render(
      <DevModeSection isDevelopment={false} useRealAPI={true} />
    );
    
    expect(queryByText(/開発モード/)).not.toBeInTheDocument();
  });
});