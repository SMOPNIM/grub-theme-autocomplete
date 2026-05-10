# GRUB Theme Autocomplete

这是一个 Visual Studio Code 插件，为 GRUB 的 `theme.txt` 文件提供智能自动补全功能。

## 功能

- **全局属性补全**：支持所有 GRUB 主题全局属性（如 `title-text`、`desktop-image`、`terminal-box` 等）
- **组件定义补全**：输入 `+` 后自动提示所有组件类型（label、boot_menu、canvas、hbox、vbox 等）
- **组件内属性补全**：根据当前组件类型自动提示该组件支持的属性
- **枚举值补全**：自动提示所有可用的枚举值（对齐方式、缩放方法、布尔值、特殊变量等）
- **语法高亮**：提供完整的语法高亮支持

## 安装

### 从源码安装

1. 克隆仓库：
```bash
git clone https://github.com/SMOPNIM/grub-theme-autocomplete.git
cd grub-theme-autocomplete
```

2. 安装依赖：
```bash
npm install
```

3. 编译代码：
```bash
npm run compile
```

4. 在 VSCode 中安装：
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "Install from VSIX..."
   - 选择编译后的 `out/extension.vsix` 文件

或者直接在 VSCode 中打开项目，按 `F5` 启动调试模式。

## 使用方法

1. 打开任意 `.theme.txt` 或 `theme.txt` 文件
2. 开始输入即可触发补全：
   - 输入 `+` 后选择组件（如 `label`、`boot_menu`）
   - 输入属性名（如 `text=`）后选择枚举值
   - 输入 `:` 后选择全局属性

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

## 发布说明

### 0.1.0
- 初始版本，支持完整的 GRUB 主题文件格式
- 添加智能自动补全功能
- 添加语法高亮支持

## 开发

```bash
# 编译
npm run compile

# 监听文件变化自动编译
npm run watch
```

## 许可证

MIT License