import {
  Box,
  HStack,
  VStack,
  Input,
  Card,
  Field,
  Stack,
  Text,
  IconButton,
  Collapsible,
  useDisclosure,
} from "@chakra-ui/react";

import { MdSearch, MdClose } from "react-icons/md";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState, useCallback, useMemo, memo } from "react";
import { Button } from "../atoms";
import type { CommonComponentProps } from "../../types";

/**
 * 日報検索フォームコンポーネント (Molecule)
 *
 * 機能:
 * - タイトル検索
 * - 内容検索
 * - 日付範囲検索
 * - 検索条件クリア
 * - 折りたたみ可能なインターフェース
 *
 * 使用場面:
 * - 日報一覧画面での検索・フィルタリング
 */

/**
 * 検索条件の型定義
 */
export type SearchCriteria = {
  /** タイトル検索キーワード */
  title: string;
  /** 内容検索キーワード */
  content: string;
  /** 検索開始日 */
  startDate: string;
  /** 検索終了日 */
  endDate: string;
};

/**
 * SearchFormコンポーネントのProps型定義
 */
type SearchFormProps = CommonComponentProps & {
  /** 検索条件変更時のコールバック */
  onSearchChange: (criteria: SearchCriteria) => void;
  /** 検索条件クリア時のコールバック */
  onClearSearch: () => void;
  /** 初期検索条件 */
  initialCriteria?: Partial<SearchCriteria>;
  /** 検索フォームの表示状態 */
  isVisible?: boolean;
};

/**
 * 空の検索条件
 */
const EMPTY_CRITERIA: SearchCriteria = {
  title: "",
  content: "",
  startDate: "",
  endDate: "",
};

const SearchFormComponent = ({
  onSearchChange,
  onClearSearch,
  initialCriteria,
  isVisible = true,
}: SearchFormProps) => {
  const { open: isOpen, onToggle } = useDisclosure({ defaultOpen: false });

  // 検索条件の状態管理
  const [criteria, setCriteria] = useState<SearchCriteria>({
    ...EMPTY_CRITERIA,
    ...initialCriteria,
  });

  // 検索条件が空かどうかの判定（メモ化）
  const isEmpty = useMemo(() => {
    return !criteria.title && !criteria.content && !criteria.startDate && !criteria.endDate;
  }, [criteria]);

  // 検索条件変更ハンドラー
  const handleCriteriaChange = useCallback(
    (field: keyof SearchCriteria, value: string) => {
      const newCriteria = {
        ...criteria,
        [field]: value,
      };
      setCriteria(newCriteria);
      onSearchChange(newCriteria);
    },
    [criteria, onSearchChange],
  );

  // 検索条件クリアハンドラー
  const handleClearSearch = useCallback(() => {
    setCriteria(EMPTY_CRITERIA);
    onClearSearch();
  }, [onClearSearch]);

  if (!isVisible) return null;

  return (
    <Box w="full">
      {/* 検索フォーム切り替えボタン */}
      <HStack justify="space-between" mb={4}>
        <Button variant="secondary" onClick={onToggle}>
          <MdSearch />
          検索・フィルター
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </Button>

        {!isEmpty && (
          <HStack gap={2}>
            <Text fontSize="sm" color="gray.600">
              検索条件が設定されています
            </Text>
            <IconButton
              aria-label="検索条件をクリア"
              size="sm"
              variant="ghost"
              onClick={handleClearSearch}
            >
              <MdClose />
            </IconButton>
          </HStack>
        )}
      </HStack>

      {/* 検索フォーム */}
      <Collapsible.Root open={isOpen}>
        <Card.Root
          variant="elevated"
          bg="rgba(255, 251, 235, 0.9)"
          borderRadius="xl"
          border="2px"
          borderColor="orange.200"
          mb={6}
        >
          <Card.Body p={6}>
            <VStack gap={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                検索条件
              </Text>

              <Stack direction={{ base: "column", lg: "row" }} gap={4} align="stretch">
                {/* タイトル検索 */}
                <Field.Root flex={1}>
                  <Field.Label fontSize="md" color="gray.700">
                    タイトル
                  </Field.Label>
                  <Input
                    placeholder="日報タイトルで検索"
                    value={criteria.title}
                    onChange={(e) => handleCriteriaChange("title", e.target.value)}
                    bg="white"
                    borderRadius="md"
                    borderColor="orange.200"
                    _focus={{
                      borderColor: "orange.400",
                      boxShadow: "0 0 0 1px rgb(251, 146, 60)",
                    }}
                  />
                </Field.Root>

                {/* 内容検索 */}
                <Field.Root flex={1}>
                  <Field.Label fontSize="md" color="gray.700">
                    内容
                  </Field.Label>
                  <Input
                    placeholder="作業内容で検索"
                    value={criteria.content}
                    onChange={(e) => handleCriteriaChange("content", e.target.value)}
                    bg="white"
                    borderRadius="md"
                    borderColor="orange.200"
                    _focus={{
                      borderColor: "orange.400",
                      boxShadow: "0 0 0 1px rgb(251, 146, 60)",
                    }}
                  />
                </Field.Root>
              </Stack>

              <Stack direction={{ base: "column", md: "row" }} gap={4} align="stretch">
                {/* 開始日 */}
                <Field.Root flex={1}>
                  <Field.Label fontSize="md" color="gray.700">
                    開始日
                  </Field.Label>
                  <Input
                    type="date"
                    value={criteria.startDate}
                    onChange={(e) => handleCriteriaChange("startDate", e.target.value)}
                    bg="white"
                    borderRadius="md"
                    borderColor="orange.200"
                    _focus={{
                      borderColor: "orange.400",
                      boxShadow: "0 0 0 1px rgb(251, 146, 60)",
                    }}
                  />
                  <Field.HelperText color="gray.600" fontSize="sm">
                    この日付以降の日報を検索
                  </Field.HelperText>
                </Field.Root>

                {/* 終了日 */}
                <Field.Root flex={1}>
                  <Field.Label fontSize="md" color="gray.700">
                    終了日
                  </Field.Label>
                  <Input
                    type="date"
                    value={criteria.endDate}
                    onChange={(e) => handleCriteriaChange("endDate", e.target.value)}
                    bg="white"
                    borderRadius="md"
                    borderColor="orange.200"
                    _focus={{
                      borderColor: "orange.400",
                      boxShadow: "0 0 0 1px rgb(251, 146, 60)",
                    }}
                  />
                  <Field.HelperText color="gray.600" fontSize="sm">
                    この日付以前の日報を検索
                  </Field.HelperText>
                </Field.Root>
              </Stack>

              {/* アクションボタン */}
              <HStack gap={3} justify="flex-end">
                <Button variant="secondary" onClick={handleClearSearch} disabled={isEmpty}>
                  <MdClose />
                  クリア
                </Button>
                <Button variant="primary" onClick={onToggle}>
                  <MdSearch />
                  検索
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Collapsible.Root>
    </Box>
  );
};

// メモ化による再レンダリング最適化
export const SearchForm = memo(SearchFormComponent);
