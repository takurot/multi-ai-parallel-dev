# タスク実行プロンプト

このリポジトリでは `docs/PLAN.md` と `docs/SPEC.md` を参照しながら、**AI Multi-Tool Parallel Dev Orchestrator** を実装します。

---

## 目次

1. [実装フロー](#実装フロー)
2. [AI Agent Guidelines](#ai-agent-guidelines-aiアシスタント向け)
3. [推奨ワークフロー](#推奨ワークフロー)
4. [コンテキスト管理](#コンテキスト管理)
5. [チェックリスト](#チェックリスト)
6. [注意事項](#注意事項)

---

## 実装フロー

### 1. ブランチ作成

- `main` から `feature/PR-XX-<name>` 形式で作成（例: `feature/PR-01-project-setup`）
- `docs/PLAN.md` のPR単位でブランチを分けることを推奨

```bash
git checkout main && git pull
git checkout -b feature/PR-XX-<name>
```

### 2. TDD（テスト駆動開発）

> [!IMPORTANT]
> 本プロジェクトでは TDD を強く推奨します。

- **Red**: 失敗するテストを書く
- **Green**: テストを最小限の実装で通す
- **Refactor**: 可読性・再利用性を高める・型定義の整理

### 3. ローカル品質チェック

実装が完了したら、以下のコマンドで品質を確認してください。

```bash
npm run lint  # 静的解析
npm test      # ユニットテスト
```

### 4. PLAN.md の更新

- 対応した PR のステータスを `[ ]` から `[/]` (完了時は `[x]`) に更新
- 必要に応じてサブタスクの進捗も更新

### 5. コミット & プッシュ

- コミットメッセージは英語で、命令形を推奨（例: `Add TaskSchema validation logic`）
- `PLAN.md` の更新も同じブランチに含める

```bash
git add .
git commit -m "PR-XX: <descriptive message>"
git push origin feature/PR-XX-<name>
```

### 6. Pull Request 作成

```bash
gh pr create --title "PR-XX: <Task Title>" --body "<概要とテスト結果>"
```

- `PLAN.md` に記載されている完了条件を満たしていることを確認

### 7. CI結果の確認と対応

- GitHub Actions 等の CI が設定されている場合は、すべてのチェックがパスすることを確認
- 失敗した場合は、ログを確認して自己修正を行う

---

## AI Agent Guidelines (AIアシスタント向け)

あなたがコードを変更・実装する場合は、**必ず**以下の手順を遵守してください。

### 基本原則

| 原則 | 説明 |
|------|------|
| **Context First** | 実装前に `docs/PLAN.md` と `docs/SPEC.md` を必ず確認し、完了条件を把握すること |
| **Quality First** | コード変更後は `npm test` 及び `npm run lint` を実行し、既存の機能を壊していないか確認すること |
| **Incremental** | 大規模な変更は避け、`PLAN.md` に定義された PR ごとに段階的に実装すること |
| **Self-Correction** | エラーが発生した場合は、原因を分析して修正を実施すること |

### 「Explore, Plan, Code, Commit」ワークフロー

> [!TIP]
> 複雑なタスクでは、いきなりコードを書かずに「調査→計画→実装→コミット」の順序を守ってください。

1. **Explore（調査）**: 関連ファイルを読み、既存の実装パターンを理解する
2. **Plan（計画）**: 実装方針を立て、必要に応じてユーザーに確認する
3. **Code（実装）**: TDD で段階的に実装する
4. **Commit（コミット）**: 適切なコミットメッセージで変更を保存する

### 思考の深さを調整する

複雑な問題には「think」キーワードを使用して、より深い思考を促してください：

- `think` → 標準的な思考
- `think hard` → より深い分析
- `think harder` → さらに詳細な検討
- `ultrathink` → 最大限の思考予算

### ファイル参照のベストプラクティス

- 具体的なファイルパスを指定する（例: `src/tasks/parser.ts を読んで`）
- 関連ファイルをまとめて参照する（例: `src/tasks/ 配下のファイルを確認して`）
- 画像やスクリーンショットも活用可能

---

## 推奨ワークフロー

### テスト駆動開発（TDD）ワークフロー

```
1. テストを書く（失敗することを確認）
   └─ 実装コードはまだ書かない
2. テストをコミット
3. 実装コードを書く
   └─ テストが通るまで繰り返す
4. 実装コードをコミット
5. リファクタリング
```

### コードレビュー対応ワークフロー

```
1. gh pr view でコメントを確認
2. 指摘事項を修正
3. テストを実行して確認
4. 変更をプッシュ
```

### Git 操作

以下の Git 操作は AI が代行可能です：

- コミットメッセージの生成
- PR の作成
- ブランチの作成・切り替え
- リベース・マージ
- 差分の確認

```bash
# PR 作成例
gh pr create --title "PR-XX: <Task Title>" --body "<概要>"

# Issue の確認
gh issue view <issue-number>
```

---

## コンテキスト管理

### 重要なファイル

| ファイル | 役割 |
|----------|------|
| `docs/SPEC.md` | 仕様書（Single Source of Truth） |
| `docs/PLAN.md` | 実装計画・進捗管理 |
| `docs/PROMPT.md` | 本ファイル（開発ガイドライン） |
| `tsconfig.json` | TypeScript 設定 |
| `package.json` | 依存関係・スクリプト定義 |

### コードスタイル

- ES Modules (`import/export`) を使用、CommonJS (`require`) は避ける
- 可能な限り `any` を避け、適切な型を定義する
- Prettier/ESLint の設定に従う

### ディレクトリ構造

```
src/
├── cli/           # CLI コマンド
├── config/        # 設定ファイル読み込み
├── errors/        # エラー型定義
├── tasks/         # タスク定義・パース
├── dag/           # DAG 構築・トポロジカルソート
├── git/           # Git 操作
├── adapters/      # ツールアダプタ
├── scheduler/     # スケジューラ
└── types/         # 共通型定義
```

---

## チェックリスト

### PR 作成前チェック

- [ ] 作業ブランチ名が `feature/PR-XX-...` である
- [ ] `docs/PLAN.md` の対象タスクが `[/]` または `[x]` になっている
- [ ] `npm run lint` がエラーなしで終了した
- [ ] `npm test` がすべてパスした
- [ ] コミットメッセージが PR 内容を適切に表している

### PR 作成後チェック

- [ ] PR を作成し、完了条件を満たしていることを確認した
- [ ] CI がすべてパスした
- [ ] レビューコメントに対応した（該当する場合）

---

## 注意事項

> [!CAUTION]
> `docs/SPEC.md` は本プロジェクトの唯一の正解（Single Source of Truth）です。実装が仕様と乖離しないよう注意してください。

- 仕様自体の改善が必要と感じた場合は、**実装前に** `docs/SPEC.md` の更新を提案してください
- TypeScript の型定義を疎かにせず、可能な限り `any` を避けて堅牢な実装を心がけてください
- 長いセッションでは `/clear` を使用してコンテキストをリセットすることを検討してください

---

## Bash コマンドリファレンス

```bash
# ビルド
npm run build

# リント
npm run lint

# テスト
npm test
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ

# フォーマット
npm run format

# Git
git checkout -b feature/PR-XX-<name>
git add . && git commit -m "<message>"
git push origin <branch>

# GitHub CLI
gh pr create --title "<title>" --body "<body>"
gh pr view
gh issue view <number>
```
