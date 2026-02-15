import * as vscode from 'vscode';

// ==================== 补全项工厂函数 ====================
function prop(label: string, detail: string, insert: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Property);
  item.detail = detail;
  item.insertText = new vscode.SnippetString(insert);
  return item;
}

function snippet(label: string, insert: string, detail: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
  item.detail = detail;
  item.insertText = new vscode.SnippetString(insert);
  return item;
}

function enumMember(label: string): vscode.CompletionItem {
  return new vscode.CompletionItem(label, vscode.CompletionItemKind.EnumMember);
}

// ==================== 全局属性补全数据 ====================
const globalProperties = [
  prop('title-text', '屏幕顶部标题文本', 'title-text: $1'),
  prop('title-font', '标题字体', 'title-font: $1'),
  prop('title-color', '标题颜色', 'title-color: $1'),
  prop('message-font', '（未使用）消息字体', 'message-font: $1'),
  prop('message-color', '（未使用）消息颜色', 'message-color: $1'),
  prop('message-bg-color', '（未使用）消息背景色', 'message-bg-color: $1'),
  prop('desktop-image', '背景图片路径', 'desktop-image: "$1"'),
  prop('desktop-image-scale-method', '背景缩放方式', 'desktop-image-scale-method: $1'),
  prop('desktop-image-h-align', '背景水平对齐', 'desktop-image-h-align: $1'),
  prop('desktop-image-v-align', '背景垂直对齐', 'desktop-image-v-align: $1'),
  prop('desktop-color', '背景颜色', 'desktop-color: $1'),
  prop('terminal-box', '终端样式盒模式', 'terminal-box: "$1"'),
  prop('terminal-border', '终端边框宽度', 'terminal-border: $1'),
  prop('terminal-left', '终端左坐标', 'terminal-left: $1'),
  prop('terminal-top', '终端顶坐标', 'terminal-top: $1'),
  prop('terminal-width', '终端宽度', 'terminal-width: $1'),
  prop('terminal-height', '终端高度', 'terminal-height: $1'),
];

// ==================== 组件补全片段 ====================
const components = [
  { label: 'label', detail: '文本标签组件' },
  { label: 'progress_bar', detail: '水平进度条（倒计时）' },
  { label: 'circular_progress', detail: '圆形进度指示器' },
  { label: 'boot_menu', detail: '启动菜单' },
  { label: 'image', detail: '静态图像' },
  { label: 'canvas', detail: '画布容器（绝对定位）' },
  { label: 'hbox', detail: '水平盒容器' },
  { label: 'vbox', detail: '垂直盒容器' },
];

// ==================== 组件属性补全数据 ====================
const commonAttrs = [
  prop('left', '左边距（像素/百分比）', 'left = $1'),
  prop('top', '上边距（像素/百分比）', 'top = $1'),
  prop('width', '宽度（像素/百分比）', 'width = $1'),
  prop('height', '高度（像素/百分比）', 'height = $1'),
  prop('id', '组件标识符（特殊值 "__timeout__"）', 'id = "$1"'),
  prop('visible', '是否可见', 'visible = $1'),
];

const labelAttrs = [
  prop('text', '显示的文本', 'text = "$1"'),
  prop('font', '字体名称', 'font = "$1"'),
  prop('color', '文字颜色', 'color = $1'),
  prop('align', '水平对齐', 'align = $1'),
];

const progressBarAttrs = [
  prop('fg_color', '前景色（纯色渲染）', 'fg_color = $1'),
  prop('bg_color', '背景色（纯色渲染）', 'bg_color = $1'),
  prop('border_color', '边框色（纯色渲染）', 'border_color = $1'),
  prop('text_color', '文字颜色', 'text_color = $1'),
  prop('bar_style', '进度条边框样式盒模式', 'bar_style = "$1"'),
  prop('highlight_style', '高亮区域样式盒模式', 'highlight_style = "$1"'),
  prop('highlight_overlay', '高亮覆盖边框', 'highlight_overlay = $1'),
  prop('font', '进度条文字字体', 'font = "$1"'),
  prop('text', '进度条显示文本（支持 @TIMEOUT_* 模板）', 'text = "$1"'),
];

const circularProgressAttrs = [
  prop('center_bitmap', '中心图像路径', 'center_bitmap = "$1"'),
  prop('tick_bitmap', '刻度图像路径', 'tick_bitmap = "$1"'),
  prop('num_ticks', '刻度总数', 'num_ticks = $1'),
  prop('ticks_disappear', '刻度是否逐渐消失', 'ticks_disappear = $1'),
  prop('start_angle', '起始角度（支持 deg 单位）', 'start_angle = $1'),
];

const bootMenuAttrs = [
  prop('item_font', '菜单项标题字体', 'item_font = "$1"'),
  prop('selected_item_font', '选中项字体', 'selected_item_font = "$1"'),
  prop('item_color', '菜单项标题颜色', 'item_color = $1'),
  prop('selected_item_color', '选中项文字颜色', 'selected_item_color = $1'),
  prop('icon_width', '图标宽度', 'icon_width = $1'),
  prop('icon_height', '图标高度', 'icon_height = $1'),
  prop('item_height', '菜单项高度', 'item_height = $1'),
  prop('item_padding', '内边距', 'item_padding = $1'),
  prop('item_icon_space', '图标与文字间距', 'item_icon_space = $1'),
  prop('item_spacing', '菜单项间距', 'item_spacing = $1'),
  prop('menu_pixmap_style', '菜单框样式盒模式', 'menu_pixmap_style = "$1"'),
  prop('item_pixmap_style', '菜单项样式盒模式', 'item_pixmap_style = "$1"'),
  prop('selected_item_pixmap_style', '选中项高亮样式盒模式', 'selected_item_pixmap_style = "$1"'),
  prop('scrollbar', '是否显示滚动条', 'scrollbar = $1'),
  prop('scrollbar_frame', '滚动条轨道样式盒模式', 'scrollbar_frame = "$1"'),
  prop('scrollbar_thumb', '滚动条滑块样式盒模式', 'scrollbar_thumb = "$1"'),
  prop('scrollbar_thumb_overlay', '滑块覆盖轨道', 'scrollbar_thumb_overlay = $1'),
  prop('scrollbar_slice', '滚动条放置切片', 'scrollbar_slice = $1'),
  prop('scrollbar_left_pad', '左边距', 'scrollbar_left_pad = $1'),
  prop('scrollbar_right_pad', '右边距', 'scrollbar_right_pad = $1'),
  prop('scrollbar_top_pad', '上边距', 'scrollbar_top_pad = $1'),
  prop('scrollbar_bottom_pad', '下边距', 'scrollbar_bottom_pad = $1'),
];

const imageAttrs = [
  prop('file', '图像文件路径', 'file = "$1"'),
];

const componentAttrMap = new Map<string, vscode.CompletionItem[]>([
  ['label', [...commonAttrs, ...labelAttrs]],
  ['progress_bar', [...commonAttrs, ...progressBarAttrs]],
  ['circular_progress', [...commonAttrs, ...circularProgressAttrs]],
  ['boot_menu', [...commonAttrs, ...bootMenuAttrs]],
  ['image', [...commonAttrs, ...imageAttrs]],
  ['canvas', [...commonAttrs]],
  ['hbox', [...commonAttrs]],
  ['vbox', [...commonAttrs]],
]);

// ==================== 枚举值补全映射 ====================
const enumMap: Record<string, string[]> = {
  'align': ['left', 'center', 'right'],
  'desktop-image-h-align': ['left', 'center', 'right'],
  'desktop-image-v-align': ['top', 'center', 'bottom'],
  'desktop-image-scale-method': ['stretch', 'crop', 'padding', 'fitwidth', 'fitheight'],
  'scrollbar_slice': ['west', 'center', 'east'],
  'visible': ['true', 'false'],
  'highlight_overlay': ['true', 'false'],
  'scrollbar_thumb_overlay': ['true', 'false'],
  'ticks_disappear': ['true', 'false'],
  'id': ['__timeout__'],
  'text': [
    '@TIMEOUT_NOTIFICATION_SHORT@',
    '@TIMEOUT_NOTIFICATION_MIDDLE@',
    '@TIMEOUT_NOTIFICATION_LONG@',
    '@KEYMAP_SHORT@',
    '@KEYMAP_MIDDLE@',
    '@KEYMAP_LONG@',
  ],
};

// ==================== 上下文辅助函数 ====================
function isInsideValue(linePrefix: string): boolean {
  const trimmed = linePrefix.trimEnd();
  return trimmed.endsWith('=');
}

function extractAttributeName(linePrefix: string): string | undefined {
  const match = linePrefix.match(/(\w+)\s*=\s*$/);
  return match ? match[1] : undefined;
}

function isInsideComponent(textBefore: string): boolean {
  let braceCount = 0;
  for (let i = 0; i < textBefore.length; i++) {
    if (textBefore[i] === '{') braceCount++;
    else if (textBefore[i] === '}') braceCount--;
  }
  return braceCount > 0;
}

function getCurrentComponentType(textBefore: string): string | undefined {
  const lines = textBefore.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('+')) {
      const match = line.match(/^\+\s*(\w+)/);
      if (match) return match[1];
    }
  }
  return undefined;
}

function cursorAfterPlus(linePrefix: string): boolean {
  const trimmed = linePrefix.trimEnd();
  return trimmed.endsWith('+');
}

// ==================== 激活插件 ====================
export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'grub-theme', scheme: 'file' },
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const line = document.lineAt(position);
        const linePrefix = line.text.slice(0, position.character);
        const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));

        // 1. 属性值补全（等号后面）
        if (isInsideValue(linePrefix)) {
          const attr = extractAttributeName(linePrefix);
          if (attr && enumMap[attr]) {
            return enumMap[attr].map(v => enumMember(v));
          }
          return [];
        }

        // 2. 检测光标前是否有 '+'（用户想要输入组件）
        const afterPlus = cursorAfterPlus(linePrefix);

        // 3. 如果光标前有 '+'，返回组件补全项（插入文本带前导空格）
        if (afterPlus) {
          return components.map(c => {
            const item = new vscode.CompletionItem(c.label, vscode.CompletionItemKind.Snippet);
            item.detail = c.detail;
            // 插入文本：空格 + 组件名 + 空格 + { + 换行缩进
            item.insertText = new vscode.SnippetString(` ${c.label} {\n\t$0\n}`);
            return item;
          });
        }

        // 4. 如果在组件内部，返回当前组件的属性补全
        const insideComp = isInsideComponent(textBefore);
        if (insideComp) {
          const compType = getCurrentComponentType(textBefore);
          if (compType && componentAttrMap.has(compType)) {
            return componentAttrMap.get(compType);
          }
          return [];
        }

        // 5. 全局作用域：返回全局属性补全
        return globalProperties;
      },
    },
    '+', ':', '=', ' ', '\t'
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}