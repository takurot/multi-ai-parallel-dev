# SPEC: AI Multi-Tool Parallel Dev Orchestrator

> **Version**: 1.0  
> **Last Updated**: 2026-01-02

## Abstract

本ツールは、複数のAIコーディングツール（Codex CLI, Claude Code, OpenAI/Anthropic API等）を統合的にオーケストレーションし、タスクリストから依存関係付きの開発計画を自動生成・並列実行するプラットフォームである。

**主な特徴:**
- タスクリスト（YAML/JSON）から依存関係付きDAGを構築し、並列度を制御しながらオーケストレーション
- コスト・トークン上限を考慮した「モデル選択ポリシーエンジン」
- 難易度に応じた動的モデルエスカレーションと自己修復ループによる高い成功率
- 複数LLMを使ったクロスレビュー（Writer/Reviewer分離）

---

## 目次

1. [概要](#1-概要)
2. [スコープ・非スコープ](#2-スコープ非スコープ)
3. [用語定義](#3-用語定義)
4. [ユースケース](#4-ユースケース)
5. [アーキテクチャ概要](#5-アーキテクチャ概要)
6. [タスク定義仕様](#6-タスク定義仕様)
7. [モデル・コストポリシー仕様](#7-モデルコストポリシー仕様)
8. [クロスレビュー機能仕様](#8-クロスレビュー機能仕様)
9. [可視化仕様](#9-可視化仕様)
10. [実行フロー](#10-実行フロー改訂版)
11. [コマンドインターフェース](#11-コマンドインターフェース)
12. [API仕様](#12-api仕様)
13. [設定ファイル仕様](#13-設定ファイル仕様)
14. [エラーハンドリング](#14-エラーハンドリング)
15. [ログ・監査仕様](#15-ログ監査仕様)
16. [セキュリティ・ガバナンス](#16-セキュリティガバナンス)
17. [非機能要件](#17-非機能要件)
18. [テスト・品質保証](#18-テスト品質保証)
19. [拡張ポイント](#19-拡張ポイント)
20. [MVP スコープ](#20-mvp-スコープ実装優先)

---

## 1. 概要

本ツールは、複数のAIコーディングツール（例: Codex CLI, Claude Code, OpenAI/Anthropic APIベースのコード生成）を統合的にオーケストレーションし、タスクリストから依存関係付きの開発計画を自動生成・並列実行するプラットフォームである。

### 1.1 主な機能

- タスクDAG（依存関係グラフ）の構築と並列スケジューリング
- Gitブランチ / git worktree を用いたタスク単位の作業空間管理
- **マージコンフリクトの自動検知・Rebase & Retry ループ**
- 各タスクに対するAIコーディングツールの柔軟な割り当て
- コスト・トークン制約を考慮したモデル選択ポリシー
- **動的モデルエスカレーション（失敗時に上位モデルへ自動切り替え）**
- 複数LLMによるクロスレビュー（AI同士のレビュー）
- **Writer → Test/Lint → Reviewer の検証パイプライン**
- **コンテキスト管理（依存タスク成果物の自動収集・注入）**
- タスク実行状態・並列度・依存関係の可視化（CLI / Webダッシュボード）
- タスクごとに PR で止めるか、自動マージするかのポリシー制御
- **Dry-Run によるコスト事前見積もり**
- **Human-in-the-Loop（人間承認ゲート）のサポート**

### 1.2 対象ユーザー

- Codex CLI / Claude Code / その他LLMコーディングツールを日常的に利用している開発者
- モノレポや大規模リポジトリで AI を使った並列開発を行いたいチーム
- 複数のLLMを比較・組み合わせて開発フローを最適化したい技術者

---

## 2. スコープ・非スコープ

### 2.1 スコープ

- タスク定義（YAML/JSON）のロードと検証
- タスクDAGの生成とトポロジカルソート
- 並列実行・再実行・中断/再開
- Gitレイヤの操作：ブランチ作成、git worktree 管理、コミット、差分取得
- **マージコンフリクト検知・自動Rebase・リトライ機構**
- Codex CLI / Claude Code / 任意LLM API のアダプタ設計・実装
- コスト・トークン上限を考慮したモデル選択ポリシーエンジン
- **動的モデルエスカレーション（Escalation Strategy）**
- 複数LLMによるクロスレビュー機能
- **タスク実行前の検証ステップ（Test/Lint実行）**
- **コンテキスト管理と依存タスク成果物の自動収集**
- 実行状態可視化（CLIおよび簡易Web UI）
- GitHub/GitLabへのPR作成とマージポリシーの適用（条件付き）
- **Dry-Run & コスト見積もりコマンド**
- **Human-in-the-Loop（人間承認ゲート）**

### 2.2 非スコープ（当面）

- 任意のCI/CDシステムとの深い統合（Webhook・ステータスチェックは将来拡張）
- AIモデル自体のトレーニング・ホスティング
- 人間のコードレビュー支援のためのWeb IDE提供（閲覧用UIは簡易）

---

## 3. 用語定義

| 用語 | 定義 |
|------|------|
| **タスク** | 開発上の単位作業（機能追加、リファクタ、テスト追加など） |
| **タスクDAG** | タスク同士の依存関係を表す有向非巡回グラフ |
| **ツールアダプタ** | Codex CLI, Claude Code など外部ツールを一元的に呼び出す抽象レイヤ |
| **モデルプロファイル** | LLMモデルの定義（コスト、トークン上限、速度、品質タグなど） |
| **コストポリシー** | タスク属性とモデルプロファイルをマッピングし、最適なモデルを選択するルールセット |
| **クロスレビュー** | あるLLMが生成したコードに対し、別のLLMがレビュー・静的解析・修正提案を行うこと |
| **エスカレーション** | タスク失敗時に、より高品質なモデルへ自動的に切り替えて再試行すること |
| **コンテキスト注入** | 依存タスクの成果物やリポジトリ構造を、後続タスクのプロンプトに自動挿入すること |
| **検証ステップ** | LLMレビュー前に実行する機械的なチェック（テスト、Lint等） |
| **Human Gate** | 人間の承認を必要とするチェックポイント |

---

## 4. ユースケース

1. タスクリストから一括で開発計画を生成し、依存関係を意識した並列開発をAIに任せる
2. 軽量なリファクタやテスト補完は安価なモデルで、重要な設計変更や公開API部分は高品質モデルで処理する
3. Codexで生成したコードを Claude でレビューさせる、またはその逆をタスク単位で設定する
4. 実行中のタスク状況（待機中／実行中／成功／失敗）と依存関係をDAGビューで確認し、詰まり箇所を可視化する
5. タスクごとに「PR作成で停止」「自動テスト通過後に自動マージ」を選択し、チームのワークフローに合わせる
6. **安価なモデルで失敗したタスクを、自動的に高品質モデルにエスカレーションして成功させる**
7. **Dry-Runでコストを事前確認し、予算超過を防ぐ**
8. **重要なタスクには人間の承認ゲートを設け、完全自動化と人間介入のバランスを取る**
9. **並列タスクのマージコンフリクトを自動検知し、Rebase & Retry で解決する**

---

## 5. アーキテクチャ概要

### 5.1 コンポーネント

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLI / Web API レイヤ                          │
├─────────────────────────────────────────────────────────────────┤
│                   オーケストレーターコア                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│  │ DAG管理   │ │ スケジューラ│ │ 状態管理  │ │リトライ/エスカ │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │ Gitマネージャ│ │コンテキスト │ │ 検証パイプライン        │   │
│  │             │ │マネージャ   │ │ (Test/Lint/Self-Heal)  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                  ツールアダプタレイヤ                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐       │
│  │Codex CLI │ │Claude Code│ │OpenAI API│ │汎用HTTP API │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌────────────────┐ ┌─────────────────┐  │
│  │モデル・コストポリシー│ │レビューパイプライン│ │可視化/モニタリング│  │
│  └───────────────────┘ └────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.1.1 CLI / Web API レイヤ

- タスクリストの投入
- 実行開始 / 停止 / ステータス照会
- 実行ログ閲覧
- **Dry-Run & コスト見積もり**

#### 5.1.2 オーケストレーターコア

- タスク定義のロード・バリデーション
- DAG構築／スケジューリング
- 並列度制御・キュー管理
- タスク状態管理（Pending, Running, Succeeded, Failed, Blocked, WaitingReview, **WaitingHuman**）
- **リトライ・エスカレーション制御**

#### 5.1.3 Gitマネージャ

- ブランチ戦略（`feature/<task-id>` など）
- git worktree の作成/削除
- コミット・差分取得
- PR作成・マージ（GitHub/GitLab API）
- **Conflict Resolver（コンフリクト検知・解決）:**
  - タスク開始時: `main` ブランチからの最新化（rebase/merge）
  - 完了時（PR作成/マージ前）: 再度 `main` との差分を確認
  - コンフリクト検知時:
    - Strategy A: 失敗としてマークし、人間に通知
    - Strategy B: コンフリクトマーカーを含むファイルを読み込み、"Resolve Conflict" タスクとしてLLMに修正依頼

#### 5.1.4 ツールアダプタレイヤ

- Codex CLI アダプタ
- Claude Code / その他LLMアダプタ
- 汎用 HTTP API アダプタ

#### 5.1.5 モデル・コストポリシーエンジン

- モデルプロファイル管理（コスト/トークン上限/レイテンシ指標/品質タグ）
- タスク属性に基づいたモデル割り当て
- プロジェクト単位の月間予算・上限トークン管理
- **動的エスカレーション戦略（失敗時の上位モデル切り替え）**
- **Dry-Run時のコスト試算**

#### 5.1.6 コンテキストマネージャ（Context Manager）

- ファイルマップ生成（`tree`相当）
- 依存タスクの成果物特定（`git diff` from dependent tasks）
- 関連ファイルの抽出（import解析または単純なファイル名マッチ）
- プロンプトへのコンテキスト注入最適化（トークン節約のため、無関係なファイルは除外）
- **依存タスク完了時の自動Rebase / マージ**

#### 5.1.7 検証パイプライン（Validation Pipeline）

- タスク完了後、Reviewerに渡す前に機械的チェックを実行
- Test実行・Lint実行・型チェック等
- **Self-Healing Loop:** 検証失敗時、Writerに修正依頼を差し戻す（最大リトライ回数付き）
- 検証結果をReviewerのコンテキストとして渡す

#### 5.1.8 レビューパイプライン

- クロスレビュー設定（Writerモデル / Reviewerモデル）
- レビュー結果の集約・再実行ポリシー
- **Human Gate対応（人間承認待ち状態の管理）**

#### 5.1.9 可視化・モニタリング

- DAGビュー（タスクノードと依存エッジ）
- タイムラインビュー（タスクの開始・終了・実行時間）
- コストビュー（モデル別の推定費用・トークン消費量）
- Web UI（最小限：Read-only）
- **Human Gate通知・承認UI**

### 5.2 データストア

- プロジェクトメタデータ: SQLite または Postgres（プロジェクト単位）
- タスク定義: YAML/JSONファイル＋DBキャッシュ
- 実行ログ: ローカルファイル＋DBへのメタ情報格納
- モデルプロファイル・コスト設定: YAML/JSON + DB
- **エスカレーション履歴: 各タスクのリトライ回数・使用モデル履歴**

---

## 6. タスク定義仕様

### 6.1 タスクYAMLの例

```yaml
# version フィールドでスキーマバージョンを明示
version: "1.0"

project: "sample-monorepo"
defaultRepo: "./app"
defaultTool: "codex-cli"
defaultMergePolicy: "pr-only"

tasks:
  - id: "user-model"
    title: "ユーザーモデル実装"
    repo: "./app"
    tool: "codex-cli"
    dependsOn: []
    mergePolicy: "auto-merge"
    costTier: "medium"          # low / medium / high
    complexityHint: "data-model"

    # 実行・リトライポリシー
    execution:
      maxRetries: 3             # 失敗時の最大リトライ回数
      escalateOnRetry: true     # リトライ時に上位モデルへ切り替えるか
      timeoutMinutes: 30        # タスクタイムアウト

    # 検証ステップ（Reviewer前に実行）
    validation:
      enabled: true
      cmd: "npm test -- --testPathPattern=user-model"
      lintCmd: "npm run lint -- --filter=user-model"
      stopOnFailure: false      # falseなら失敗ログを持ってWriter再試行へ
      maxValidationRetries: 2   # 検証失敗時のWriter差し戻し最大回数

    # レビュー設定
    review:
      enabled: true
      reviewerTool: "claude-api"
      strictness: "normal"      # lenient / normal / strict
      humanGate: false          # 自動マージ前に人間の承認を必須にするか
      autoFix: false            # Reviewerの修正案を自動適用するか

  - id: "user-api"
    title: "ユーザーAPI実装"
    dependsOn: ["user-model"]
    tool: "claude-code"
    mergePolicy: "pr-only"
    costTier: "high"
    complexityHint: "public-api"

    execution:
      maxRetries: 2
      escalateOnRetry: true

    validation:
      enabled: true
      cmd: "npm test -- --testPathPattern=user-api"
      stopOnFailure: false

    review:
      enabled: true
      reviewerTool: "openai-api"
      strictness: "strict"
      humanGate: true           # 重要なAPIは人間承認を必須に

  - id: "user-api-e2e-tests"
    title: "ユーザーAPIのE2Eテスト追加"
    dependsOn: ["user-api"]
    tool: "codex-cli"
    mergePolicy: "pr-only"
    costTier: "low"
    complexityHint: "tests"

    execution:
      maxRetries: 3
      escalateOnRetry: false    # テストタスクはエスカレーションしない

    validation:
      enabled: true
      cmd: "npm run test:e2e"

    review:
      enabled: false
```

### 6.2 フィールド説明

| フィールド | 説明 |
|-----------|------|
| `version` | スキーマバージョン（互換性管理用） |
| `project` | プロジェクト名 |
| `defaultRepo` | デフォルトのリポジトリパス |
| `defaultTool` | デフォルトのツール（省略時） |
| `defaultMergePolicy` | デフォルトのマージポリシー |

#### 各タスクのフィールド

| フィールド | 説明 |
|-----------|------|
| `id` | 一意な識別子 |
| `title` | 説明 |
| `repo` | リポジトリパス（未指定なら defaultRepo） |
| `tool` | 使用するツール名（ツールアダプタのキー） |
| `dependsOn` | 依存タスクIDの配列 |
| `mergePolicy` | `pr-only`: PR作成で停止 / `auto-merge`: テスト/条件を満たせば自動マージ |
| `costTier` | `low` / `medium` / `high`（モデル選択のヒント） |
| `complexityHint` | `tests` / `refactor` / `public-api` / `infra` / `docs` など |

#### execution（実行・リトライポリシー）

| フィールド | 説明 | デフォルト |
|-----------|------|-----------|
| `maxRetries` | タスク失敗時の最大リトライ回数 | 1 |
| `escalateOnRetry` | リトライ時に上位モデルへエスカレーションするか | false |
| `timeoutMinutes` | タスクのタイムアウト時間 | 30 |

#### validation（検証ステップ）

| フィールド | 説明 |
|-----------|------|
| `enabled` | 検証ステップを有効にするか |
| `cmd` | テストコマンド |
| `lintCmd` | Lintコマンド（任意） |
| `stopOnFailure` | 失敗時に即座に失敗とするか、それとも再試行するか |
| `maxValidationRetries` | 検証失敗時にWriterへ差し戻す最大回数 |

#### review（レビュー設定）

| フィールド | 説明 |
|-----------|------|
| `enabled` | クロスレビュー実行有無 |
| `reviewerTool` | レビューに使うLLMツール |
| `strictness` | レビューの厳しさレベル（`lenient` / `normal` / `strict`） |
| `humanGate` | 人間の承認を必須にするか |
| `autoFix` | Reviewerが生成した修正案を適用して再コミットするか |

---

## 7. モデル・コストポリシー仕様

### 7.1 モデルプロファイル定義例

```yaml
version: "1.0"

models:
  - id: "openai-gpt4o-mini"
    provider: "openai"
    model: "gpt-4o-mini"
    costPer1kInputTokens: 0.00015   # USD
    costPer1kOutputTokens: 0.0006   # USD
    maxTokensPerCall: 128000
    qualityTags: ["fast", "cheap", "ok-code"]
    defaultUse: ["tests", "refactor", "docs"]
    tier: 1                   # エスカレーション順序

  - id: "openai-gpt4o"
    provider: "openai"
    model: "gpt-4o"
    costPer1kInputTokens: 0.0025
    costPer1kOutputTokens: 0.01
    maxTokensPerCall: 128000
    qualityTags: ["high-quality-code"]
    defaultUse: ["public-api", "core-domain"]
    tier: 2

  - id: "anthropic-claude-sonnet"
    provider: "anthropic"
    model: "claude-sonnet-4-20250514"
    costPer1kInputTokens: 0.003
    costPer1kOutputTokens: 0.015
    maxTokensPerCall: 200000
    qualityTags: ["very-high-quality", "review-strong"]
    defaultUse: ["critical-review", "complex-logic"]
    tier: 3

  - id: "anthropic-claude-opus"
    provider: "anthropic"
    model: "claude-opus-4-20250514"
    costPer1kInputTokens: 0.015
    costPer1kOutputTokens: 0.075
    maxTokensPerCall: 200000
    qualityTags: ["very-high-quality", "review-strong"]
    defaultUse: ["critical-review"]
    tier: 4                   # 最上位
```

### 7.2 コストポリシー

**プロジェクト単位の制約:**

- 月間予算（例: 100USD）
- 1日あたりの最大トークン数（例: 500k tokens）
- 1タスクあたりの最大トークン数・最大コール数

**タスク属性 → モデル選択のルール例:**

- `costTier: low` + `complexityHint: tests` → cheapモデルを優先
- `costTier: high` + `complexityHint: public-api` → high品質モデル優先
- レビュー用途は `qualityTags` に `review-strong` を持つモデルを優先

### 7.3 動的エスカレーション戦略

**Escalation Strategy:**

- 安価なモデルでタスク実行 → 検証失敗 → 上位tierのモデルで再試行
- エスカレーション順序は `tier` フィールドで定義
- 最上位tierでも失敗した場合は、タスクを Failed としてマーク

**エスカレーションのトリガー条件:**

- テスト/Lint失敗が `maxValidationRetries` を超過
- LLMのレスポンスがパース不可
- タイムアウト

**実装イメージ:**

- タスク開始時に「推定トークン数」を簡易見積もり（ヒューリスティクス）
- 残り予算・残りトークンを考慮してモデルを選択
- 予算超過の可能性が高い場合、実行前に警告 or スキップ
- **エスカレーション時は差分コストを再計算**

---

## 8. クロスレビュー機能仕様

### 8.1 レビューの流れ（改訂版）

1. Writerタスク（例: Codex CLI）がコード生成・修正を完了
2. **検証パイプライン実行（Test/Lint）**
   - 成功 → ステップ3へ
   - 失敗 → Self-Healing Loop:
     - 失敗ログをWriterに渡して修正依頼
     - `maxValidationRetries` まで繰り返し
     - 上限超過時、`escalateOnRetry: true` なら上位モデルで再試行
3. Gitマネージャが diff を取得
4. Reviewerツールに対して以下を入力:
   - diff内容
   - **検証結果（テスト結果、Lintログ）**
   - タスクコンテキスト（title, description, complexityHint）
   - レビューガイドライン（strictnessに応じた指示）
5. Reviewerツールからの出力:
   - 指摘一覧（箇条書き）
   - 必要なら修正版パッチ
6. ポリシー:
   - 「指摘ゼロ」または「軽微な指摘」のみ → タスク成功扱い
   - 「重大な指摘」がある → タスク失敗・再実行 or 人間レビューに回す
7. **Human Gate（humanGate: true の場合）**
   - タスクを `WaitingHuman` 状態に遷移
   - UI/CLI で人間に通知
   - 人間が Approve → マージ処理へ
   - 人間が Reject with Feedback → Writerに差し戻し

### 8.2 設定例

```yaml
review:
  enabled: true
  reviewerTool: "anthropic-claude-opus"
  strictness: "strict"
  autoFix: false     # trueならReviewerが生成した修正案を適用して再コミット
  humanGate: true    # 人間の承認を必須にする
```

---

## 9. 可視化仕様

### 9.1 DAGビュー

- ノード: タスク（id・title・状態）
- エッジ: dependsOn 関係
- 色分け:

| 状態 | 色 |
|------|-----|
| Pending | グレー |
| Running | 青 |
| Succeeded | 緑 |
| Failed | 赤 |
| WaitingReview / Blocked | オレンジ |
| **WaitingHuman** | 紫 |

**表示手段:**

- CLI:
  - ASCIIアートによる簡易DAG表示
  - `orchestrator status --graph`
- Web UI:
  - D3.js等でのインタラクティブグラフ
  - ノードクリックでログ・diff・レビュー結果を表示
  - **Human Gate承認ボタン**

### 9.2 タイムラインビュー

- 各タスクの開始時刻・終了時刻
- 実行時間
- 並列度（時刻tに動いているタスク数）
- **リトライ・エスカレーション履歴の表示**

### 9.3 コストビュー

- モデル別トークン消費量／推定コスト
- タスク別の消費量・コスト
- プロジェクト予算に対する使用率
- **エスカレーションによる追加コストの可視化**

---

## 10. 実行フロー（改訂版）

1. タスクリストYAMLの読み込み
2. スキーマバリデーション・DAG構築・循環依存チェック
3. プロジェクト予算・モデルプロファイル読み込み
4. **Dry-Run（オプション）:**
   - 推定トークン数・コストを算出
   - ユーザーに確認プロンプトを表示
   - `orchestrator plan --dry-run`
5. 実行開始:
   - in-degree=0 のタスクをキューに投入
   - 並列度制御しつつタスクを取り出し実行
6. 各タスクの実行:
   - Gitブランチ + worktree 作成
   - **依存タスクからのRebase / コンテキスト収集**
   - モデル選択ポリシー適用
   - ツールアダプタへ依頼（Writerフェーズ）
   - **検証パイプライン実行（Test/Lint）**
     - 失敗時: Self-Healing Loop（Writer差し戻し）
     - 上限超過時: エスカレーション or 失敗
   - クロスレビュー（Reviewerフェーズ）
   - **Human Gate（必要な場合）**
   - **マージ前のコンフリクトチェック & 自動Rebase**
   - mergePolicyに応じて PR or 自動マージ
7. タスク完了時:
   - DAGの依存関係更新
   - 新たに in-degree=0 となったタスクをキューに投入
   - **後続タスクへのコンテキスト伝播**
8. 全タスクが終端状態になれば終了

---

## 11. コマンドインターフェース

### 11.1 基本コマンド

```bash
# ヘルプ表示
orchestrator --help
orchestrator <command> --help

# バージョン確認
orchestrator --version

# タスクリストの検証
orchestrator validate tasks.yaml

# Dry-Run（コスト見積もり）
orchestrator plan --dry-run

# 実行開始
orchestrator run tasks.yaml

# ステータス確認
orchestrator status
orchestrator status --graph        # DAGビュー
orchestrator status --timeline     # タイムラインビュー

# 特定タスクのログ確認
orchestrator logs <task-id>

# Human Gate承認
orchestrator approve <task-id>
orchestrator reject <task-id> --reason "修正が必要"

# 実行停止
orchestrator stop

# 失敗タスクの再実行
orchestrator retry <task-id>
orchestrator retry --all-failed

# ヘルスチェック
orchestrator health

# デバッグモード
orchestrator run tasks.yaml --verbose
orchestrator run tasks.yaml --debug

# モックモード（LLM APIを使わないテスト用）
orchestrator run tasks.yaml --mock
```

### 11.2 Dry-Run出力例

```
$ orchestrator plan --dry-run

=== Dry-Run: タスク実行計画 ===

プロジェクト: sample-monorepo
タスク数: 3
予想並列度: 2

推定コスト:
  - user-model     : ~$0.15 (gpt-4o-mini)
  - user-api       : ~$0.80 (claude-sonnet-4)
  - user-api-e2e   : ~$0.10 (gpt-4o-mini)
  --------------------------------
  合計             : ~$1.05

予算残高: $98.95 / $100.00

続行しますか? [Y/n]:
```

### 11.3 初期化コマンド

```bash
# プロジェクト初期化（テンプレート生成）
orchestrator init
orchestrator init --template minimal
orchestrator init --template full
```

生成されるファイル:
- `.orchestrator/config.yaml` - プロジェクト設定
- `.orchestrator/models.yaml` - モデルプロファイル
- `tasks.yaml` - タスク定義テンプレート

---

## 12. API仕様

### 12.1 REST API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `GET` | `/health` | ヘルスチェック |
| `GET` | `/api/v1/projects` | プロジェクト一覧 |
| `POST` | `/api/v1/projects` | プロジェクト作成 |
| `GET` | `/api/v1/projects/:id` | プロジェクト詳細 |
| `POST` | `/api/v1/projects/:id/runs` | 実行開始 |
| `GET` | `/api/v1/runs/:id` | 実行状態取得 |
| `POST` | `/api/v1/runs/:id/stop` | 実行停止 |
| `GET` | `/api/v1/runs/:id/tasks` | タスク一覧 |
| `GET` | `/api/v1/tasks/:id` | タスク詳細 |
| `GET` | `/api/v1/tasks/:id/logs` | タスクログ |
| `POST` | `/api/v1/tasks/:id/approve` | Human Gate承認 |
| `POST` | `/api/v1/tasks/:id/reject` | Human Gate却下 |
| `POST` | `/api/v1/tasks/:id/retry` | タスク再実行 |

### 12.2 レスポンス形式

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "requestId": "req-abc123",
    "timestamp": "2026-01-02T14:00:00Z"
  }
}
```

### 12.3 エラーレスポンス

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "E1001",
    "message": "Task not found",
    "details": {
      "taskId": "user-model"
    }
  },
  "meta": {
    "requestId": "req-abc123",
    "timestamp": "2026-01-02T14:00:00Z"
  }
}
```

---

## 13. 設定ファイル仕様

### 13.1 ファイル配置

```
~/.orchestrator/                    # グローバル設定
├── config.yaml                     # グローバル設定
├── models.yaml                     # グローバルモデルプロファイル
└── credentials.yaml                # APIキー（暗号化推奨）

<project-root>/
├── .orchestrator/                  # プロジェクト設定（オーバーライド）
│   ├── config.yaml
│   └── models.yaml
└── tasks.yaml                      # タスク定義
```

### 13.2 設定ファイル例（config.yaml）

```yaml
version: "1.0"

# 並列度制御
parallelism:
  maxConcurrentTasks: 5
  maxConcurrentPerRepo: 2

# 予算制限
budget:
  monthlyLimitUsd: 100
  dailyTokenLimit: 500000
  warnAtPercent: 80

# Git設定
git:
  defaultBranch: "main"
  branchPrefix: "feature/ai-"
  autoCleanupWorktrees: true

# 通知設定
notifications:
  slack:
    enabled: false
    webhookUrl: "${SLACK_WEBHOOK_URL}"
  discord:
    enabled: false
    webhookUrl: "${DISCORD_WEBHOOK_URL}"

# ログ設定
logging:
  level: "info"           # debug, info, warn, error
  format: "json"          # json, text
  outputDir: ".orchestrator/logs"
```

### 13.3 認証情報（credentials.yaml）

> [!CAUTION]
> このファイルには機密情報が含まれます。Gitにコミットしないでください。

```yaml
version: "1.0"

providers:
  openai:
    apiKey: "${OPENAI_API_KEY}"
  anthropic:
    apiKey: "${ANTHROPIC_API_KEY}"
  github:
    token: "${GITHUB_TOKEN}"
```

---

## 14. エラーハンドリング

### 14.1 エラーコード体系

| コード | カテゴリ | 説明 |
|-------|---------|------|
| **E1xxx** | タスク関連 | |
| E1001 | | タスクが見つからない |
| E1002 | | タスクIDが重複 |
| E1003 | | 依存タスクが見つからない |
| E1004 | | タスクがタイムアウト |
| E1005 | | 最大リトライ回数超過 |
| **E2xxx** | DAG関連 | |
| E2001 | | 循環依存を検出 |
| E2002 | | DAG構築失敗 |
| **E3xxx** | Git関連 | |
| E3001 | | ブランチ作成失敗 |
| E3002 | | Worktree作成失敗 |
| E3003 | | マージコンフリクト検出 |
| E3004 | | Rebase失敗 |
| E3005 | | PR作成失敗 |
| **E4xxx** | LLM関連 | |
| E4001 | | APIキーが無効 |
| E4002 | | レート制限超過 |
| E4003 | | レスポンスパース失敗 |
| E4004 | | モデルが利用不可 |
| **E5xxx** | 予算関連 | |
| E5001 | | 月間予算超過 |
| E5002 | | 日次トークン上限超過 |
| E5003 | | タスク単位のコスト上限超過 |
| **E6xxx** | 検証関連 | |
| E6001 | | テスト失敗 |
| E6002 | | Lint失敗 |
| E6003 | | 型チェック失敗 |
| **E9xxx** | システム関連 | |
| E9001 | | 設定ファイル読み込み失敗 |
| E9002 | | データベース接続失敗 |
| E9003 | | 内部エラー |

### 14.2 エラーリカバリ戦略

| エラーコード | 自動リカバリ | 手動対応 |
|-------------|-------------|----------|
| E1004 | タイムアウト延長してリトライ | `--timeout` オプション調整 |
| E3003 | 自動Rebase試行 | 手動マージ |
| E4002 | バックオフ後リトライ | APIプラン確認 |
| E5001 | 実行停止 | 予算追加 or 低コストモデル選択 |
| E6001 | Self-Healing Loop | テスト修正 |

---

## 15. ログ・監査仕様

### 15.1 ログフォーマット（JSON）

```json
{
  "timestamp": "2026-01-02T14:00:00.123Z",
  "level": "info",
  "logger": "orchestrator.task",
  "message": "Task started",
  "context": {
    "runId": "run-abc123",
    "taskId": "user-model",
    "model": "gpt-4o-mini",
    "attempt": 1
  },
  "trace": {
    "traceId": "trace-xyz789",
    "spanId": "span-def456"
  }
}
```

### 15.2 ログレベル

| レベル | 用途 |
|-------|------|
| `debug` | 詳細なデバッグ情報（プロンプト内容等） |
| `info` | 通常の運用情報（タスク開始/完了等） |
| `warn` | 警告（リトライ発生、予算警告等） |
| `error` | エラー（タスク失敗等） |

### 15.3 監査ログ

Human Gate操作は監査証跡として記録:

```json
{
  "timestamp": "2026-01-02T14:00:00Z",
  "event": "human_gate.approved",
  "actor": {
    "type": "user",
    "id": "user@example.com"
  },
  "target": {
    "runId": "run-abc123",
    "taskId": "user-api"
  },
  "metadata": {
    "comment": "LGTM",
    "ipAddress": "192.168.1.1"
  }
}
```

### 15.4 メトリクス出力

OpenMetrics形式で出力（Prometheus連携用）:

```
# HELP orchestrator_tasks_total Total number of tasks
# TYPE orchestrator_tasks_total counter
orchestrator_tasks_total{status="succeeded"} 42
orchestrator_tasks_total{status="failed"} 3

# HELP orchestrator_cost_usd_total Total cost in USD
# TYPE orchestrator_cost_usd_total counter
orchestrator_cost_usd_total{model="gpt-4o-mini"} 12.50

# HELP orchestrator_task_duration_seconds Task duration histogram
# TYPE orchestrator_task_duration_seconds histogram
orchestrator_task_duration_seconds_bucket{le="60"} 10
orchestrator_task_duration_seconds_bucket{le="300"} 35
```

---

## 16. セキュリティ・ガバナンス

### 16.1 認証・認可

**CLI:**
- 環境変数 or credentials.yaml からAPIキー読み込み
- ローカル実行のため追加認証不要

**Web API:**
- APIキー認証（`X-API-Key` ヘッダー）
- JWT認証（オプション）
- RBAC（Role-Based Access Control）:

| ロール | 権限 |
|-------|------|
| `viewer` | 読み取りのみ |
| `operator` | 実行開始/停止、Human Gate承認 |
| `admin` | 全操作（設定変更含む） |

### 16.2 秘密情報の取り扱い

**APIキー管理:**

- 環境変数での注入を推奨
- credentials.yaml使用時は `chmod 600` 設定
- 将来: OS Keychain / Vault 連携

**センシティブデータのマスキング:**

LLMに送信するコンテキストから除外するパターン:

```yaml
security:
  sensitivePatterns:
    - "password"
    - "secret"
    - "api_key"
    - "token"
    - "credential"
  sensitiveFiles:
    - "*.pem"
    - "*.key"
    - ".env*"
    - "*credentials*"
```

### 16.3 監査要件

- Human Gate操作の全履歴保存（15.3参照）
- 設定変更の履歴保存
- 保存期間: 90日（デフォルト）

---

## 17. 非機能要件

| 項目 | 要件 |
|------|------|
| **言語** | TypeScript (Node.js 20+) |
| **OS** | macOS / Linux（Windowsはbest-effort） |
| **並列タスク数** | ローカルで10〜20程度（将来はリモートワーカー対応） |
| **回復性** | 実行中にオーケストレーターが落ちても、再起動で状態をDBから復元。各タスクのリトライ・エスカレーション状態も復元対象 |
| **セキュリティ** | APIキーの安全な管理（環境変数・ローカルKMS等）。GitHubトークン・LLM APIキーはプロジェクト設定とは分離して保存 |

### 17.1 技術選定理由

> [!NOTE]
> 詳細な技術選定理由は `docs/ADR/` ディレクトリに記載予定

- **TypeScript**: 型安全性とエコシステムの充実
- **Node.js**: 非同期I/O処理に優れ、CLI/Webサーバー両対応
- **SQLite**: ローカル実行時のシンプルさ（Postgres対応は拡張）

---

## 18. テスト・品質保証

### 18.1 テスト戦略

| テスト種別 | 対象 | カバレッジ目標 |
|-----------|------|---------------|
| ユニットテスト | 各モジュール | 80%以上 |
| 統合テスト | コンポーネント間連携 | 主要フロー100% |
| E2Eテスト | CLI/API全体 | Happy Path + エラーケース |

### 18.2 テストコマンド

```bash
# ユニットテスト
npm test

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

### 18.3 モックモード

LLM APIを使わずにテストを実行するためのモックモード:

```bash
orchestrator run tasks.yaml --mock
```

モックモードでは:
- LLM APIコールはダミーレスポンスを返す
- 検証コマンドは実際に実行
- コスト計算は0として扱う

### 18.4 CI/CD統合

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run test:integration
```

---

## 19. 拡張ポイント

### 19.1 プラグイン機構

カスタムツールアダプタの実装インターフェース:

```typescript
interface ToolAdapter {
  id: string;
  name: string;
  
  // タスク実行
  execute(task: Task, context: TaskContext): Promise<ExecutionResult>;
  
  // レビュー実行（オプション）
  review?(diff: string, context: ReviewContext): Promise<ReviewResult>;
  
  // コスト見積もり
  estimateCost(task: Task): Promise<CostEstimate>;
}
```

### 19.2 将来の拡張

- CI/CD との統合（GitHub Actions / GitLab CI / CircleCI）
- SaaS化（複数プロジェクトを一元管理）
- 人間レビューの割り込みワークフロー（UIから「承認／差戻し」）
- LLM間の「合議制」（Writerを複数モデルにして投票する等）
- **Slack/Discord通知連携（Human Gate、失敗通知）**
- **RAGベースのコンテキスト注入（大規模リポジトリ対応）**

---

## 20. MVP スコープ（実装優先）

### Phase 1: Core（優先実装）

1. ローカル専用
   - GitHub APIは使わず、ローカルブランチ＋diffのみ
2. 対応ツール:
   - Codex CLI（writer）
   - OpenAI API (cheap model) を使った reviewer（簡易）
3. 機能:
   - タスクDAG構築・並列実行
   - git worktree 管理
   - コストTierに応じたモデル選択（単純なルールベース）
   - CLIベースのステータス・簡易グラフ表示
   - **基本的なリトライ機能**

### Phase 2: Reliability（信頼性強化）

- **検証パイプライン（Test/Lint実行）**
- **Self-Healing Loop（検証失敗時のWriter差し戻し）**
- **動的エスカレーション**
- タイムラインビュー
- **Dry-Run & コスト見積もり**
- **コンフリクト検知・自動Rebase**

### Phase 3: Expansion（拡張）

- クロスレビュー強化
- 他モデル（Claude/Gemini）対応
- コスト管理強化
- Web UI（DAG/タイムライン/コストビュー）
- **Human-in-the-Loop（Human Gate）**
- **コンテキストマネージャ**
- GitHub PR作成

---

## 付録

### A. 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0 | 2026-01-02 | 初版作成。目次追加、API仕様、エラーハンドリング、セキュリティ、テスト戦略を追加 |

### B. 関連ドキュメント

- `docs/ADR/` - Architecture Decision Records
- `docs/PLAN.md` - 実装ロードマップ
- `README.md` - クイックスタートガイド
