# タスク実行プロンプト

このリポジトリでは `docs/PLAN.md` と `docs/SPEC.md` を参照しながら、**AI Multi-Tool Parallel Dev Orchestrator** を実装します。

## 実装フロー

### 1. ブランチ作成
- `main` から `feature/PR-XX-<name>` 形式で作成（例: `feature/PR-01-project-setup`）。
- `docs/PLAN.md` のPR単位でブランチを分けることを推奨します。

### 2. TDD（テスト駆動開発）
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
- 対応した PR のステータスを `[ ]` から `[/]` (完了時は `[x]`) に更新してください。
- 必要に応じてサブタスクの進捗も更新してください。

### 5. コミット & プッシュ
- コミットメッセージは英語で、命令形を推奨します（例: `Add TaskSchema validation logic`）。
- `PLAN.md` の更新も同じブランチに含めてください。

### 6. Pull Request 作成
```bash
gh pr create --title "PR-XX: <Task Title>" --body "<概要とテスト結果>"
```
- `PLAN.md` に記載されている完了条件を満たしていることを確認してください。

### 7. CI結果の確認と対応
- GitHub Actions 等の CI が設定されている場合は、すべてのチェックがパスすることを確認してください。
- 失敗した場合は、ログを確認して自己修正を行ってください。

## AI Agent Guidelines (AIアシスタント向け)
あなたがコードを変更・実装する場合は、**必ず**以下の手順を遵守してください。

1. **Context Management**: 常に `docs/PLAN.md` を確認し、現在の PR の完了条件を把握すること。完了後は必ず `[x]` に更新すること。
2. **Quality First**: コード変更後は `npm test` 及び `npm run lint` を実行し、既存の機能を壊していないか確認すること。
3. **Incremental Development**: 大規模な変更は避け、`PLAN.md` に定義された PR ごとに段階的に実装すること。
4. **Self-Correction**: エラーが発生した場合は、原因を分析して修正案を提示または実施すること。

## チェックリスト

- [ ] 作業ブランチ名が `feature/PR-XX-...` である
- [ ] `docs/PLAN.md` の対象タスクが `[/]` または `[x]` になっている
- [ ] `npm run lint` がエラーなしで終了した
- [ ] `npm test` がすべてパスした
- [ ] コミットメッセージが PR 内容を適切に表している
- [ ] PR を作成し、完了条件を満たしていることを確認した

## 注意事項

- `docs/SPEC.md` は本プロジェクトの唯一の正解（Single Source of Truth）です。実装が仕様と乖離しないよう注意してください。
- 仕様自体の改善が必要と感じた場合は、実装前に `docs/SPEC.md` の更新を提案してください。
- TypeScript の型定義を疎かにせず、可能な限り `any` を避けて堅牢な実装を心がけてください。
