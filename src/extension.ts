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

function enumMember(label: string, kind?: vscode.CompletionItemKind, quote?: boolean): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, kind ?? vscode.CompletionItemKind.EnumMember);
  if (quote && label) {
    item.insertText = new vscode.SnippetString(`"${label}"`);
  }
  return item;
}

function stringMember(label: string, detail?: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Text);
  if (detail) item.detail = detail;
  return item;
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
  prop('terminal-font', '终端字体', 'terminal-font: "$1"'),
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
  prop('left', '左边距（像素/百分比，新式布局）', 'left = $1'),
  prop('top', '上边距（像素/百分比，新式布局）', 'top = $1'),
  prop('width', '宽度（像素/百分比，新式布局）', 'width = $1'),
  prop('height', '高度（像素/百分比，新式布局）', 'height = $1'),
  prop('position', '相对父容器坐标 (x, y)（旧式）', 'position = ($1)'),
  prop('preferred_size', '首选尺寸 (w, h)，-1 表自动（旧式）', 'preferred_size = ($1)'),
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
  prop('show_text', '是否在进度条上显示文字', 'show_text = $1'),
  prop('bar_style', '进度条边框样式盒模式', 'bar_style = "$1"'),
  prop('highlight_style', '高亮区域样式盒模式', 'highlight_style = "$1"'),
  prop('highlight_overlay', '高亮覆盖边框', 'highlight_overlay = $1'),
  prop('font', '进度条文字字体', 'font = "$1"'),
  prop('text', '进度条显示文本（支持 @TIMEOUT_* 模板）', 'text = "$1"'),
  prop('value', '当前值（通常由 GRUB 自动更新）', 'value = $1'),
  prop('start', '起始值（通常由 GRUB 自动更新）', 'start = $1'),
  prop('end', '结束值（通常由 GRUB 自动更新）', 'end = $1'),
];

const circularProgressAttrs = [
  prop('center_bitmap', '中心图像路径', 'center_bitmap = "$1"'),
  prop('tick_bitmap', '刻度图像路径', 'tick_bitmap = "$1"'),
  prop('num_ticks', '刻度总数', 'num_ticks = $1'),
  prop('ticks_disappear', '刻度是否逐渐消失', 'ticks_disappear = $1'),
  prop('start_angle', '起始角度（支持 deg 单位）', 'start_angle = $1'),
  prop('value', '当前值（通常由 GRUB 自动更新）', 'value = $1'),
  prop('start', '起始值（通常由 GRUB 自动更新）', 'start = $1'),
  prop('end', '结束值（通常由 GRUB 自动更新）', 'end = $1'),
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
  prop('scrollbar_width', '滚动条宽度', 'scrollbar_width = $1'),
  prop('max_items_shown', '最多显示菜单项数', 'max_items_shown = $1'),
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
const enumMap: Record<string, { values: string[]; kind?: vscode.CompletionItemKind; quote?: boolean }> = {
  'align': { values: ['left', 'center', 'right'] },
  'desktop-image-h-align': { values: ['left', 'center', 'right'] },
  'desktop-image-v-align': { values: ['top', 'center', 'bottom'] },
  'desktop-image-scale-method': { values: ['stretch', 'crop', 'padding', 'fitwidth', 'fitheight'] },
  'scrollbar_slice': { values: ['west', 'center', 'east'] },
  'visible': { values: ['true', 'false'] },
  'scrollbar': { values: ['true', 'false'] },
  'show_text': { values: ['true', 'false'] },
  'highlight_overlay': { values: ['true', 'false'] },
  'scrollbar_thumb_overlay': { values: ['true', 'false'] },
  'ticks_disappear': { values: ['true', 'false'] },
  'id': { values: ['__timeout__'] },
  'text': {
    values: [
      '@TIMEOUT_NOTIFICATION_SHORT@',
      '@TIMEOUT_NOTIFICATION_MIDDLE@',
      '@TIMEOUT_NOTIFICATION_LONG@',
      '@KEYMAP_SHORT@',
      '@KEYMAP_MIDDLE@',
      '@KEYMAP_LONG@',
    ],
    quote: true,
  },
};

// ==================== 上下文辅助函数 ====================
function isInsideValue(linePrefix: string): boolean {
  // 全局用 `:`，组件内用 `=`；光标在行内第一个 =/: 之后即为值区，
  // 需容忍已输入的值前缀（如 `align = c|`、`desktop-image-scale-method: cr|`）。
  return /[:=][^=:]*$/.test(linePrefix);
}

function extractAttributeName(linePrefix: string): string | undefined {
  const match = linePrefix.match(/([\w-]+)\s*[:=][^=:]*$/);
  return match ? match[1] : undefined;
}

// 剥离双引号字符串内容与 # 注释，避免 `"{"` / `# {` 干扰大括号计数。
// 保留换行符以维持行结构。
function stripStringsAndComments(text: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\' && i + 1 < text.length) {
        out += '  ';
        i++;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      out += ch === '\n' ? '\n' : ' ';
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ' ';
      continue;
    }
    if (ch === '#') {
      // 行注释：丢弃至行尾
      while (i < text.length && text[i] !== '\n') {
        out += ' ';
        i++;
      }
      if (i < text.length) {
        out += '\n';
      }
      continue;
    }
    out += ch;
  }
  return out;
}

// 从前文正向扫描，维护组件栈，可正确处理嵌套与 `{` 换行场景。
function getComponentStack(textBefore: string): string[] {
  const cleaned = stripStringsAndComments(textBefore);
  const stack: string[] = [];
  const tokenRe = /\+\s*(\w+)|([{}])/g;
  let m: RegExpExecArray | null;
  let pending: string | undefined;
  while ((m = tokenRe.exec(cleaned)) !== null) {
    if (m[1] !== undefined) {
      pending = m[1];
    } else if (m[2] === '{') {
      stack.push(pending ?? '__anonymous__');
      pending = undefined;
    } else if (m[2] === '}') {
      if (stack.length > 0) {
        stack.pop();
      }
      pending = undefined;
    }
  }
  return stack;
}

function isInsideComponent(textBefore: string): boolean {
  const stack = getComponentStack(textBefore);
  return stack.length > 0;
}

function getCurrentComponentType(textBefore: string): string | undefined {
  const stack = getComponentStack(textBefore);
  const top = stack.length > 0 ? stack[stack.length - 1] : undefined;
  if (!top || top === '__anonymous__') {
    return undefined;
  }
  return top;
}

function cursorAfterPlus(linePrefix: string): boolean {
  // 覆盖 `+|`、`+ |`、`+ lab|`（含嵌套缩进）
  return /^\s*\+\s*\w*\s*$/.test(linePrefix);
}

// ==================== 激活插件 ====================
export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'grub-theme' },
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const line = document.lineAt(position);
        const linePrefix = line.text.slice(0, position.character);
        const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));

        // 1. 属性值补全（= 或 : 后面，兼容已输入前缀）
        if (isInsideValue(linePrefix)) {
          const attr = extractAttributeName(linePrefix);
          if (attr && enumMap[attr]) {
            const entry = enumMap[attr];
            if (entry.kind) {
              return entry.values.map(v => enumMember(v, entry.kind, entry.quote));
            } else {
              // 默认使用 EnumMember 类型
              return entry.values.map(v => enumMember(v, undefined, entry.quote));
            }
          }
          return [];
        }

        // 2. 检测光标前是否有 '+'（用户想要输入组件）
        const afterPlus = cursorAfterPlus(linePrefix);

        // 3. 如果光标前有 '+'，返回组件补全项
        if (afterPlus) {
          // `+|` 需前导空格，`+ |` / `+ lab|` 已有空格或待替换词则不需要，避免双空格
          const needsLeadingSpace = linePrefix.trimEnd().endsWith('+');
          return components.map(c => {
            const item = new vscode.CompletionItem(c.label, vscode.CompletionItemKind.Snippet);
            item.detail = c.detail;
            const prefix = needsLeadingSpace ? ' ' : '';
            item.insertText = new vscode.SnippetString(`${prefix}${c.label} {\n\t$0\n}`);
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
    '+', ':', '=', ' ', '\t', '-', '_'
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}