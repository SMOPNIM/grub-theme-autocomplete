# 更新日志

## [0.1.1] - 2026-10-06

### 修复
- 补全项现在自带替换范围（`item.range`），修掉两类文本被改坏的问题：
  - `desktop-im` → 接受 `desktop-image` 会整段替换，不再变成 `desktop-desktop-image`；
  - `text = "@TI` → 接受 `@TIMEOUT_NOTIFICATION_SHORT@` 不再插入重复引号（`text = "@"@…@"`）。
  同时补全项改为按请求创建（原来复用同一批实例，无法安全携带上下文相关的 range）。
- `+ ` 之后接受组件补全不再多出一个空格（原 `trimEnd().endsWith('+')` 判断与注释意图相反）。
- 注释行不再弹出补全建议（字符串里的 `#` 不再被当成注释）。
- 组件内属性不再出现在未知组件（如 `+ foo {`）里，也不会退回全局属性列表。
- 行解析改为按字符扫描，`title-text: "a: b"` 这类值里带分隔符的行也能正确识别属性名与值区。
- 触发字符精简为 `+`、`:`、`=`：去掉空格 / Tab / `-` / `_` 后，写注释、写字符串、按空格缩进时不再频繁弹窗（`+` 触发已足够）。

### 变更
- 枚举值按「组件 + 属性」区分：`@KEYMAP_*@` 只给 label 的 `text`，`@TIMEOUT_NOTIFICATION_*@` 只给 progress_bar 的 `text`。
- `id` 的枚举值改为带引号插入（`id = "__timeout__"`），与属性 snippet 保持一致。
- 按 GRUB 源码校正属性数据：移除 `position`、`preferred_size`、`show_text`、`max_items_shown`、`value` / `start` / `end`（GRUB 解析器忽略这些名字）；`visible` 只保留在实现它的 4 种组件上；补充 `inherit`（`selected_item_*`）与 `scrollbar_slice` 枚举。

### 工程
- 拆出 `src/context.ts`（纯逻辑，可测试）与 `src/data.ts`（数据表），`src/extension.ts` 只负责拼装补全项。
- 新增 `npm test`：29 个单元测试覆盖上下文判断、替换范围与数据表一致性。
- `@types/vscode` 固定为 `1.85.0`，与 `engines.vscode` 对齐（原来 `^1.85.0` 实际解析到 1.109.0）。
- `.vscodeignore` 排除 `test/`、`.github/`、`out/**/*.map`，并去掉无效的 `!out/**`。
- 新增 GitHub Actions CI（编译 + 测试 + 打包检查）。
- README 修正安装步骤（`.vsix` 需自行打包，不在 `out/` 下）、补全触发方式说明，并新增「属性数据说明」。

## [0.1.0] - 2026-2-13
- 初始发布
- 支持所有全局属性、组件、组件属性、枚举值补全
- 提供基础语法高亮
