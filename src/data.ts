// GRUB theme.txt 的补全数据表。
//
// 数据只收录 GRUB 解析器真正实现的属性（依据 grub-core/gfxmenu/*.c，已对照 2.12 与 master）。
// 为什么这点很重要：GRUB 对**未知的全局属性**会直接报错并中止解析主题，
// 对**未知的组件属性**则静默忽略 —— 所以给组件补一个无效属性不会报错，
// 但用户会以为设置生效了，这类属性已经从表中移除（见 README「属性数据说明」）。

export interface PropSpec {
  /** 补全列表里显示的属性名 */
  label: string;
  /** 列表右侧的说明文字 */
  detail?: string;
  /** 插入的 snippet（属性名 + 分隔符 + tabstop） */
  insert: string;
}

export interface EnumSpec {
  /** 可选的枚举值 */
  values: string[];
  /** 插入时是否补上双引号（GRUB 解析时会剥掉引号再比较，两种写法都合法） */
  quote?: boolean;
}

export interface ComponentSpec {
  label: string;
  detail: string;
}

function prop(label: string, detail: string, insert: string): PropSpec {
  return { label, detail, insert };
}

function enumSpec(values: string[], quote = false): EnumSpec {
  return quote ? { values, quote } : { values };
}

// ==================== 全局属性（顶层 `name: value`） ====================
// 这 18 个与 theme_loader.c 的 theme_set_string 一一对应；
// message-* 三项 GRUB 只解析不使用（官方手册注明 unused），但写错属性名是致命错误，
// 所以仍然保留在补全里。
export const globalProperties: readonly PropSpec[] = [
  prop('title-text', '屏幕顶部标题文本', 'title-text: $1'),
  prop('title-font', '标题字体', 'title-font: $1'),
  prop('title-color', '标题颜色', 'title-color: $1'),
  prop('message-font', '（GRUB 保留未使用）消息字体', 'message-font: $1'),
  prop('message-color', '（GRUB 保留未使用）消息颜色', 'message-color: $1'),
  prop('message-bg-color', '（GRUB 保留未使用）消息背景色', 'message-bg-color: $1'),
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

// ==================== 组件类型（`+` 之后的补全） ====================
export const componentTypes: readonly ComponentSpec[] = [
  { label: 'label', detail: '文本标签组件' },
  { label: 'progress_bar', detail: '水平进度条（倒计时）' },
  { label: 'circular_progress', detail: '圆形进度指示器' },
  { label: 'boot_menu', detail: '启动菜单' },
  { label: 'image', detail: '静态图像' },
  { label: 'canvas', detail: '画布容器（绝对定位）' },
  { label: 'hbox', detail: '水平盒容器' },
  { label: 'vbox', detail: '垂直盒容器' },
];

// ==================== 组件属性 ====================
// 所有组件都支持的位置/标识属性。注意：GRUB 的公共属性只有这 5 个，
// `position` / `preferred_size` / `visible` 都不是公共属性（见各组件表）。
const commonAttrs: readonly PropSpec[] = [
  prop('left', '左边距（像素 / 百分比 / 百分比+像素）', 'left = $1'),
  prop('top', '上边距（像素 / 百分比 / 百分比+像素）', 'top = $1'),
  prop('width', '宽度（像素 / 百分比 / 百分比+像素）', 'width = $1'),
  prop('height', '高度（像素 / 百分比 / 百分比+像素）', 'height = $1'),
  prop('id', '组件标识符（特殊值 "__timeout__"）', 'id = "$1"'),
];

// `visible` 只在这 4 种组件里实现，不能放进 commonAttrs。
const visibleAttr = prop('visible', '是否可见', 'visible = $1');

const labelAttrs: readonly PropSpec[] = [
  prop('text', '显示的文本（支持 @KEYMAP_*@ 模板）', 'text = "$1"'),
  prop('font', '字体名称', 'font = "$1"'),
  prop('color', '文字颜色', 'color = $1'),
  prop('align', '水平对齐', 'align = $1'),
];

const progressBarAttrs: readonly PropSpec[] = [
  prop('fg_color', '前景色（纯色渲染）', 'fg_color = $1'),
  prop('bg_color', '背景色（纯色渲染）', 'bg_color = $1'),
  prop('border_color', '边框色（纯色渲染）', 'border_color = $1'),
  prop('text_color', '文字颜色', 'text_color = $1'),
  prop('bar_style', '进度条边框样式盒模式', 'bar_style = "$1"'),
  prop('highlight_style', '高亮区域样式盒模式', 'highlight_style = "$1"'),
  prop('highlight_overlay', '高亮覆盖边框', 'highlight_overlay = $1'),
  prop('font', '进度条文字字体', 'font = "$1"'),
  prop('text', '进度条显示文本（支持 @TIMEOUT_NOTIFICATION_*@ 模板）', 'text = "$1"'),
];

const circularProgressAttrs: readonly PropSpec[] = [
  prop('center_bitmap', '中心图像路径', 'center_bitmap = "$1"'),
  prop('tick_bitmap', '刻度图像路径', 'tick_bitmap = "$1"'),
  prop('num_ticks', '刻度总数', 'num_ticks = $1'),
  prop('ticks_disappear', '刻度是否逐渐消失', 'ticks_disappear = $1'),
  prop('start_angle', '起始角度（"90 deg" 或裸数字）', 'start_angle = $1'),
];

const bootMenuAttrs: readonly PropSpec[] = [
  prop('item_font', '菜单项标题字体', 'item_font = "$1"'),
  prop('selected_item_font', '选中项字体（可用 "inherit"）', 'selected_item_font = "$1"'),
  prop('item_color', '菜单项标题颜色', 'item_color = $1'),
  prop('selected_item_color', '选中项文字颜色（可用 "inherit"）', 'selected_item_color = $1'),
  prop('icon_width', '图标宽度', 'icon_width = $1'),
  prop('icon_height', '图标高度', 'icon_height = $1'),
  prop('item_height', '菜单项高度', 'item_height = $1'),
  prop('item_padding', '内边距', 'item_padding = $1'),
  prop('item_icon_space', '图标与文字间距', 'item_icon_space = $1'),
  prop('item_spacing', '菜单项间距', 'item_spacing = $1'),
  prop('menu_pixmap_style', '菜单框样式盒模式', 'menu_pixmap_style = "$1"'),
  prop('item_pixmap_style', '菜单项样式盒模式', 'item_pixmap_style = "$1"'),
  prop('selected_item_pixmap_style', '选中项高亮样式盒模式（可用 "inherit"）', 'selected_item_pixmap_style = "$1"'),
  prop('scrollbar', '是否显示滚动条（只有显式写 "false" 才关闭）', 'scrollbar = $1'),
  prop('scrollbar_frame', '滚动条轨道样式盒模式', 'scrollbar_frame = "$1"'),
  prop('scrollbar_thumb', '滚动条滑块样式盒模式', 'scrollbar_thumb = "$1"'),
  prop('scrollbar_width', '滚动条宽度', 'scrollbar_width = $1'),
  prop('scrollbar_thumb_overlay', '滑块覆盖轨道（只有显式写 "true" 才开启）', 'scrollbar_thumb_overlay = $1'),
  prop('scrollbar_slice', '滚动条放置切片', 'scrollbar_slice = $1'),
  prop('scrollbar_left_pad', '左边距', 'scrollbar_left_pad = $1'),
  prop('scrollbar_right_pad', '右边距', 'scrollbar_right_pad = $1'),
  prop('scrollbar_top_pad', '上边距', 'scrollbar_top_pad = $1'),
  prop('scrollbar_bottom_pad', '下边距', 'scrollbar_bottom_pad = $1'),
];

const imageAttrs: readonly PropSpec[] = [prop('file', '图像文件路径', 'file = "$1"')];

export const componentAttrMap: Readonly<Record<string, readonly PropSpec[]>> = {
  label: [...commonAttrs, visibleAttr, ...labelAttrs],
  progress_bar: [...commonAttrs, visibleAttr, ...progressBarAttrs],
  circular_progress: [...commonAttrs, visibleAttr, ...circularProgressAttrs],
  boot_menu: [...commonAttrs, visibleAttr, ...bootMenuAttrs],
  image: [...commonAttrs, ...imageAttrs],
  canvas: [...commonAttrs],
  hbox: [...commonAttrs],
  vbox: [...commonAttrs],
};

// ==================== 枚举值 ====================
const booleanSpec = enumSpec(['true', 'false']);
const idSpec = enumSpec(['__timeout__'], true);
const inheritSpec = enumSpec(['inherit'], true);

// 注意两个模板变量家族是**组件专属**的，不能互相混用（GRUB 不会做替换）：
// @KEYMAP_*@ 只在 label 的 text 里展开，@TIMEOUT_NOTIFICATION_*@ 只在 progress_bar 的 text 里展开。
const keymapSpec = enumSpec(
  ['@KEYMAP_SHORT@', '@KEYMAP_MIDDLE@', '@KEYMAP_LONG@'],
  true
);
const timeoutSpec = enumSpec(
  [
    '@TIMEOUT_NOTIFICATION_SHORT@',
    '@TIMEOUT_NOTIFICATION_MIDDLE@',
    '@TIMEOUT_NOTIFICATION_LONG@',
  ],
  true
);

/** 顶层全局属性的枚举值。 */
export const globalEnumMap: Readonly<Record<string, EnumSpec>> = {
  'desktop-image-h-align': enumSpec(['left', 'center', 'right']),
  'desktop-image-v-align': enumSpec(['top', 'center', 'bottom']),
  'desktop-image-scale-method': enumSpec(['stretch', 'crop', 'padding', 'fitwidth', 'fitheight']),
};

/** 组件属性的枚举值：先按组件类型区分，再按属性名取（同名属性在不同组件里取值不同）。 */
export const componentEnumMap: Readonly<Record<string, Readonly<Record<string, EnumSpec>>>> = {
  label: {
    align: enumSpec(['left', 'center', 'right']),
    visible: booleanSpec,
    id: idSpec,
    text: keymapSpec,
  },
  progress_bar: {
    visible: booleanSpec,
    id: idSpec,
    text: timeoutSpec,
    highlight_overlay: booleanSpec,
  },
  circular_progress: {
    visible: booleanSpec,
    id: idSpec,
    ticks_disappear: booleanSpec,
  },
  boot_menu: {
    id: idSpec,
    scrollbar: booleanSpec,
    scrollbar_thumb_overlay: booleanSpec,
    scrollbar_slice: enumSpec(['west', 'center', 'east']),
    selected_item_font: inheritSpec,
    selected_item_color: inheritSpec,
    selected_item_pixmap_style: inheritSpec,
  },
  image: { id: idSpec },
  canvas: { id: idSpec },
  hbox: { id: idSpec },
  vbox: { id: idSpec },
};
