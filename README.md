# GRUB Theme Autocomplete

这是一个 Visual Studio Code 插件。  
为 GRUB 的 `theme.txt` 文件提供智能自动补全。

## 功能
- 全局属性补全（`title-text:` 等）
- 组件定义补全（`+ label { ... }`）
- 组件内属性补全（根据当前组件类型）
- 枚举值补全（对齐、缩放方法、布尔值等）
- 基础语法高亮

## 使用
打开任意 `.theme.txt` 或 `theme.txt` 文件，开始输入即可触发补全。

## 发布说明
### 0.1.0
初始版本，支持完整的 GRUB 主题文件格式。