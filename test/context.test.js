'use strict';

// 针对补全上下文逻辑的单元测试（纯字符串逻辑，不需要 vscode 运行时）。
// 运行前需要先编译：npm test 会先执行 tsc。

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  componentSnippet,
  cursorAfterPlus,
  extractAttributeName,
  getComponentStack,
  getCurrentComponentType,
  isInComment,
  isInsideValue,
  nameReplaceStart,
  parseAssignment,
  stripStringsAndComments,
  valueEdit,
} = require('../out/context.js');

/** 把一次替换作用到行上，方便直接断言“最终这一行长什么样”。 */
function applyEdit(line, { start, end, insert }) {
  return line.slice(0, start) + insert + line.slice(end);
}

/** 同上，但先把 snippet 的 tabstop（$0/$1）去掉，模拟 VS Code 的插入结果。 */
function applySnippet(line, { start, end, insert }) {
  return applyEdit(line, {
    start,
    end,
    insert: insert.replace(/\$\{\d+:([^}]*)\}/g, '$1').replace(/\$\d+/g, ''),
  });
}

/** 把 componentSnippet 的结果套用到整行（替换到行尾）。 */
function applyComponentSnippet(line, label) {
  const snippet = componentSnippet(line, label);
  return applySnippet(line, {
    start: snippet.replaceStart,
    end: line.length,
    insert: snippet.insert,
  });
}

// ==================== 组件片段（`+`） ====================

test('componentSnippet: `+` 补一个前导空格', () => {
  assert.equal(componentSnippet('+', 'label').replaceStart, 1);
  assert.equal(applyComponentSnippet('+', 'label'), '+ label {\n\t\n}');
});

test('componentSnippet: `+ ` 不再补空格（不能出现双空格）', () => {
  assert.equal(componentSnippet('+ ', 'label').replaceStart, 2, '替换起点应是光标处，即空 range');
  assert.equal(applyComponentSnippet('+ ', 'label'), '+ label {\n\t\n}');
});

test('componentSnippet: `+ lab` 整段替换已输入的组件名', () => {
  assert.equal(componentSnippet('+ lab', 'label').replaceStart, 2);
  assert.equal(applyComponentSnippet('+ lab', 'label'), '+ label {\n\t\n}');
});

test('componentSnippet: `+lab` 与缩进写法都补出规范的空格', () => {
  assert.equal(applyComponentSnippet('+lab', 'label'), '+ label {\n\t\n}');
  assert.equal(applyComponentSnippet('\t+l', 'label'), '\t+ label {\n\t\n}');
});

test('cursorAfterPlus: 只认 `+` 开头的组件位置', () => {
  assert.equal(cursorAfterPlus('+'), true);
  assert.equal(cursorAfterPlus('+ '), true);
  assert.equal(cursorAfterPlus('+ lab'), true);
  assert.equal(cursorAfterPlus('\t+ boot_menu'), true);
  assert.equal(cursorAfterPlus('+ label { co'), false);
  assert.equal(cursorAfterPlus('    text'), false);
  assert.equal(cursorAfterPlus('desktop-color: #fff'), false);
});

// ==================== 值补全的范围与引号 ====================

test('valueEdit: 带引号的值不会重复插入引号（P0 回归）', () => {
  const line = '    text = "@TI';
  const edit = valueEdit(line, undefined, '@TIMEOUT_NOTIFICATION_SHORT@', true);
  assert.equal(edit.start, 12, '开引号应留在替换范围之外');
  assert.equal(applyEdit(line, edit), '    text = "@TIMEOUT_NOTIFICATION_SHORT@"');
});

test('valueEdit: 光标右侧已有收尾引号时一并吞掉', () => {
  const line = '    text = "@TIMEOUT_NOTIFICATION_SHORT@';
  const edit = valueEdit(line, '"', '@TIMEOUT_NOTIFICATION_SHORT@', true);
  assert.equal(applyEdit(line, edit), '    text = "@TIMEOUT_NOTIFICATION_SHORT@"');
});

test('valueEdit: 未输入引号时补全整段带引号的值', () => {
  const line = '    text = @TI';
  const edit = valueEdit(line, undefined, '@KEYMAP_SHORT@', true);
  assert.equal(applyEdit(line, edit), '    text = "@KEYMAP_SHORT@"');
});

test('valueEdit: 空值区插入完整带引号的值', () => {
  const line = '    id = ';
  const edit = valueEdit(line, undefined, '__timeout__', true);
  assert.equal(applyEdit(line, edit), '    id = "__timeout__"');
});

test('valueEdit: 只输入开引号时补出完整值', () => {
  const line = '    id = "';
  const edit = valueEdit(line, undefined, '__timeout__', true);
  assert.equal(applyEdit(line, edit), '    id = "__timeout__"');
});

test('valueEdit: 不带引号的枚举整段替换已输入前缀', () => {
  const line = '    align = c';
  const edit = valueEdit(line, undefined, 'center', false);
  assert.equal(applyEdit(line, edit), '    align = center');

  const globalLine = 'desktop-image-scale-method: fitw';
  const globalEdit = valueEdit(globalLine, undefined, 'fitwidth', false);
  assert.equal(applyEdit(globalLine, globalEdit), 'desktop-image-scale-method: fitwidth');
});

test('valueEdit: 值里的冒号/等号不影响范围计算', () => {
  const line = 'title-text: "GRUB: 2 = 3';
  const edit = valueEdit(line, undefined, 'x', false);
  assert.equal(edit.start, 12, '应从第一个未被引号包裹的分隔符之后开始替换');
});

// ==================== 属性名范围 ====================

test('nameReplaceStart: 连字符属性名整段替换（P0 回归）', () => {
  const line = 'desktop-im';
  const start = nameReplaceStart(line);
  assert.equal(start, 0);
  assert.equal(applyEdit(line, { start, end: line.length, insert: 'desktop-image: ' }), 'desktop-image: ');
});

test('nameReplaceStart: 只吃属性名，不吃缩进与组件开头', () => {
  assert.equal(nameReplaceStart('    te'), 4);
  assert.equal(nameReplaceStart('+ label { co'), 10);
  assert.equal(nameReplaceStart('    '), 4);
  assert.equal(nameReplaceStart('+ label {'), 9);
});

// ==================== 行解析 ====================

test('parseAssignment: 识别组件属性的 `=` 与全局属性的 `:`', () => {
  assert.deepEqual(parseAssignment('    text = '), { name: 'text', valueStart: 11 });
  assert.deepEqual(parseAssignment('desktop-image: "/boot/grub/x.png"'), {
    name: 'desktop-image',
    valueStart: 15,
  });
});

test('parseAssignment: 忽略字符串内的分隔符与注释', () => {
  assert.deepEqual(parseAssignment('title-text: "a: b"'), { name: 'title-text', valueStart: 12 });
  assert.deepEqual(parseAssignment('# see: http://example.com'), {});
  assert.deepEqual(parseAssignment('+ label { co'), {});
});

test('isInsideValue / extractAttributeName', () => {
  assert.equal(isInsideValue('    align = c'), true);
  assert.equal(isInsideValue('    text = "a = b'), true);
  assert.equal(isInsideValue('    text'), false);
  assert.equal(isInsideValue('+ label { co'), false);
  assert.equal(extractAttributeName('    align = c'), 'align');
  assert.equal(extractAttributeName('desktop-image: "x"'), 'desktop-image');
});

test('isInComment: 字符串里的 `#` 不算注释', () => {
  assert.equal(isInComment('    # text = '), true);
  assert.equal(isInComment('#note'), true);
  assert.equal(isInComment('    text = "#fff'), false);
  assert.equal(isInComment('    text = "a#b" # 真注释'), true);
  assert.equal(isInComment('    text = "a\\"#'), false, '转义引号不应结束字符串');
});

// ==================== 组件栈 ====================

test('getComponentStack: 嵌套与闭合', () => {
  assert.deepEqual(getComponentStack('+ hbox {\n  + label {\n'), ['hbox', 'label']);
  assert.deepEqual(getComponentStack('+ label {\n}\n'), []);
  assert.deepEqual(getComponentStack('+ boot_menu\n{\n'), ['boot_menu']);
});

test('getComponentStack: 字符串与注释里的括号不计数', () => {
  assert.deepEqual(getComponentStack('+ label {\n    text = "}"\n'), ['label']);
  assert.deepEqual(getComponentStack('+ label {\n    # } 注释里的括号\n'), ['label']);
  assert.deepEqual(getComponentStack('# + fake {\n'), []);
});

test('getComponentStack: 未知组件名按原样入栈，裸 `{` 记为占位名', () => {
  // 未知组件（GRUB 也不认识）名字照原样记录，由 provider 查表落空 → 不给建议；
  // 没有组件名的裸 `{` 才用占位名。
  assert.deepEqual(getComponentStack('+ foo {\n    '), ['foo']);
  assert.deepEqual(getComponentStack('{\n    '), ['__anonymous__']);
  assert.equal(getCurrentComponentType('{\n    '), undefined);
  assert.equal(getCurrentComponentType('+ label {\n    '), 'label');
  assert.equal(getCurrentComponentType('desktop-image: "x"\n'), undefined);
});

test('stripStringsAndComments: 保留行结构', () => {
  const text = '+ label {\n    text = "# not a comment"\n}\n';
  const cleaned = stripStringsAndComments(text);
  assert.equal(cleaned.split('\n').length, text.split('\n').length);
  assert.equal(cleaned.includes('#'), false);
});
