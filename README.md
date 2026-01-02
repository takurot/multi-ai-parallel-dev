# AI Multi-Tool Parallel Dev Orchestrator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

複数のAIコーディングツール（Codex CLI, Claude Code等）を統合的にオーケストレーションし、依存関係を考慮した並列開発を自動化するプラットフォームです。

## 主な機能

- **タスク依存関係管理**: YAMLで定義されたタスクリストからDAG（有向非巡回グラフ）を構築。
- **並列実行**: 依存関係のないタスクを並列に実行し、開発速度を向上。
- **動的モデル選択**: タスクの難易度やコスト目標に応じた最適なLLMモデルを自動割り当て。
- **自動検証 & 自己修復**: 実装後のTest/Lint実行と、失敗時の自動修正ループ。
- **クロスレビュー**: 異なるモデル間でのAI相互レビューパイプライン。
- **コンフリクト解決**: 並列開発におけるマージコンフリクトの自動検知とRebase。

## クイックスタート

### 準備

Node.js (v20以上) がインストールされていることを確認してください。

```bash
git clone https://github.com/takurot/multi-ai-parallel-dev.git
cd multi-ai-parallel-dev
npm install
```

### プロジェクトの初期化

```bash
npx orchestrator init
```

`.orchestrator/` ディレクトリと `tasks.yaml` のテンプレートが作成されます。

### タスクの実行

```bash
npx orchestrator run tasks.yaml
```

## ドキュメント

詳細は `docs/` ディレクトリのドキュメントを参照してください。

- [概要・仕様 (SPEC.md)](./docs/SPEC.md)
- [実装計画 (PLAN.md)](./docs/PLAN.md)
- [開発ガイド (PROMPT.md)](./docs/PROMPT.md)

## ライセンス

MIT
