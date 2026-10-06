# GRUB Theme Autocomplete

这是一个 Visual Studio Code 插件，为 GRUB 的 `theme.txt` 文件提供智能自动补全功能。

## 功能

- **全局属性补全**：支持所有 GRUB 主题全局属性（如 `title-text`、`desktop-image`、`terminal-box` 等）
- **组件定义补全**：输入 `+` 后自动提示所有组件类型（label、boot_menu、canvas、hbox、vbox 等）
- **组件内属性补全**：根据当前组件类型自动提示该组件支持的属性
- **枚举值补全**：自动提示可用的枚举值（对齐方式、缩放方法、布尔值、`@KEYMAP_*@` / `@TIMEOUT_NOTIFICATION_*@` 模板等），并按组件区分
- **上下文感知**：注释里不给建议，字符串里的 `#` 不当注释，嵌套组件（`+ hbox { + label { … } }`）能正确定位
- **精确替换**：补全项自带替换范围，`desktop-im` → `desktop-image` 会整段替换，`text = "@TI` 也不会把引号插重复
- **语法高亮**：提供完整的语法高亮支持

## 安装

### 从源码运行（开发调试）

1. 克隆仓库：
```bash
git clone https://github.com/SMOPNIM/grub-theme-autocomplete.git
cd grub-theme-autocomplete
```

2. 安装依赖并编译：
```bash
npm install
npm run compile
```

3. 在 VS Code 中打开该目录，按 `F5` 启动“扩展开发宿主”窗口，在其中打开任意 `theme.txt` 即可。

### 打包成 VSIX 安装

```bash
npm install
npx @vscode/vsce package
```

打包会在项目根目录生成 `grub-theme-autocomplete-<版本号>.vsix`，然后在 VS Code 里：

- 按 `Ctrl+Shift+P` 打开命令面板 → 输入 `Install from VSIX...` → 选择刚生成的 `.vsix` 文件。

> 注意：`.vsix` 不是编译产物，不会出现在 `out/` 目录里，必须先用上面的命令打包。

### 直接下载 CI 构建好的 VSIX

每次 push 都会触发 [CI](.github/workflows/ci.yml)，它会编译、跑单元测试并打包：

1. 打开仓库的 **Actions** 页面 → 选最近一次成功的 **CI** 运行；
2. 页面底部 **Artifacts** 区域点击 `grub-theme-autocomplete-<版本号>.vsix` —— 下载到的**就是 `.vsix` 文件本身**（不是压缩包），可直接用 `Install from VSIX...` 安装。

> 实现方式：`actions/upload-artifact@v7` 的 `archive: false`（v7 起支持）。v4/v5 没有该参数，产物一定会被套一层 zip。

### 从 Releases 下载（长期有效）

打 tag（如 `v0.1.1`）会触发 CI 自动创建 GitHub Release，并把 `.vsix` 作为附件上传：

- 打开 [Releases](https://github.com/SMOPNIM/grub-theme-autocomplete/releases) 页面，下载 `grub-theme-autocomplete-<版本号>.vsix` 直接安装。

Release 附件是原样提供的文件（同样不是压缩包），而且不会像 Actions artifact 那样 90 天后过期。

## 使用方法

1. 打开任意 `theme.txt` 或 `*.theme.txt` 文件
2. 开始输入即可触发补全：
   - 顶层输入属性名前几个字母（如 `desk`）→ 选择全局属性
   - 输入 `+`（或继续输入组件名前几个字母，如 `+ boot`）→ 选择组件，回车后自动补出 `{ … }` 骨架
   - 在组件内输入属性名前几个字母（如 `scroll`）→ 选择该组件的属性
   - 在 `属性 = ` / `属性: ` 之后输入值（如 `align = c`）→ 选择枚举值

### 示例

```grub-theme
title-text: "Welcome to GRUB"
desktop-image: "/boot/grub/background.png"
desktop-image-scale-method: fitwidth

+ label {
    text = "Select your operating system"
    font = "default"
    color = "#ffffff"
    align = center
}

+ progress_bar {
    id = "__timeout__"
    text = "@TIMEOUT_NOTIFICATION_SHORT@"
    fg_color = "#ffffff"
    bg_color = "#000000"
}
```

## 支持的组件类型

- **label**：文本标签
- **progress_bar**：水平进度条（倒计时）
- **circular_progress**：圆形进度指示器
- **boot_menu**：启动菜单
- **image**：静态图像
- **canvas**：画布容器（绝对定位）
- **hbox**：水平盒容器
- **vbox**：垂直盒容器

## 属性数据说明

补全数据以 GRUB 解析器实际实现的属性为准（对照 `grub-core/gfxmenu/*.c`，已核对 2.12 与 master）：

- 组件的公共属性只有 `left`、`top`、`width`、`height`、`id`；`visible` 仅 label / progress_bar / circular_progress / boot_menu 支持。
- 以下名字**不是** GRUB 的属性（写进主题会被静默忽略），因此不再出现在补全里：
  `position`、`preferred_size`（BURG 风格）、`show_text`、`max_items_shown`，
  以及 `value` / `start` / `end`（这三个是 GRUB 通过 `set_state` 推送的运行时状态，不能在 `theme.txt` 里设置）。
- 模板变量是**组件专属**的：`@KEYMAP_*@` 只在 label 的 `text` 里展开，`@TIMEOUT_NOTIFICATION_*@` 只在 progress_bar 的 `text` 里展开，混用不会替换。
- `selected_item_font` / `selected_item_color` / `selected_item_pixmap_style` 额外支持 `inherit`。
- GRUB 对**未知的全局属性**会直接报错并中止解析，对**未知的组件属性**则静默忽略 —— 这也是上表要尽量准确的原因。

## 开发

```bash
# 编译
npm run compile

# 监听文件变化自动编译
npm run watch

# 编译 + 运行单元测试（补全上下文与数据表一致性）
npm test
```

源码结构：

- `src/context.ts`：纯字符串的上下文分析（组件栈、值区解析、替换范围计算），不依赖 vscode API，便于测试
- `src/data.ts`：属性 / 枚举数据表
- `src/extension.ts`：补全提供者，把数据表与上下文拼装成 `CompletionItem`
- `test/`：`node --test` 风格的单元测试

### 发布新版本

1. 更新 `package.json` 的 `version` 与 `CHANGELOG.md`；
2. 提交并推送；
3. 打 tag 并推送（**tag 必须与 `package.json` 版本一致**，CI 会校验后才会发版）：

```bash
git tag v0.1.2
git push origin v0.1.2
```

CI 会编译、跑测试、打包，并自动创建对应的 Release，把 `.vsix` 作为附件上传。

## 许可证

MIT — 详见 [LICENSE](LICENSE)。
