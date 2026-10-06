'use strict';

// 数据表一致性测试：确保属性表、枚举表、组件表三者不会互相脱节。

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  componentAttrMap,
  componentEnumMap,
  componentTypes,
  globalEnumMap,
  globalProperties,
} = require('../out/data.js');

const componentLabels = componentTypes.map((c) => c.label);

function labelsOf(component) {
  return componentAttrMap[component].map((p) => p.label);
}

test('组件表与属性表一一对应', () => {
  assert.deepEqual([...componentLabels].sort(), Object.keys(componentAttrMap).sort());
});

test('属性名合法、无重复，insert 与 label 一致', () => {
  const all = [
    ...globalProperties.map((p) => ['<global>', p]),
    ...Object.entries(componentAttrMap).flatMap(([component, specs]) =>
      specs.map((p) => [component, p])
    ),
  ];
  for (const [owner, spec] of all) {
    assert.match(spec.label, /^[a-z][a-z0-9_-]*$/, `${owner}: 非法属性名 ${spec.label}`);
    assert.ok(
      spec.insert.startsWith(`${spec.label} = `) || spec.insert.startsWith(`${spec.label}: `),
      `${owner}: insert 与属性名不匹配 → ${spec.insert}`
    );
    assert.ok(spec.insert.includes('$1'), `${owner}.${spec.label}: 缺少 tabstop`);
  }

  for (const [component, specs] of Object.entries(componentAttrMap)) {
    const labels = specs.map((p) => p.label);
    assert.equal(new Set(labels).size, labels.length, `${component}: 存在重复属性`);
  }
  const globalLabels = globalProperties.map((p) => p.label);
  assert.equal(new Set(globalLabels).size, globalLabels.length, '全局属性存在重复');
});

test('枚举表的属性一定在对应的属性列表里', () => {
  for (const [component, enums] of Object.entries(componentEnumMap)) {
    assert.ok(componentAttrMap[component], `枚举表里的未知组件: ${component}`);
    for (const attr of Object.keys(enums)) {
      assert.ok(
        labelsOf(component).includes(attr),
        `${component}: 枚举 ${attr} 不在属性列表里`
      );
    }
  }
  for (const attr of Object.keys(globalEnumMap)) {
    assert.ok(
      globalProperties.some((p) => p.label === attr),
      `全局枚举 ${attr} 不在全局属性列表里`
    );
  }
});

test('枚举值非空；带引号的枚举值本身不含引号', () => {
  const specs = [
    ...Object.values(globalEnumMap),
    ...Object.values(componentEnumMap).flatMap((m) => Object.values(m)),
  ];
  for (const spec of specs) {
    assert.ok(spec.values.length > 0, '枚举值不能为空');
    for (const value of spec.values) {
      assert.ok(value.length > 0, '枚举值不能是空字符串');
      if (spec.quote) {
        assert.ok(!value.includes('"'), `带引号枚举的值不应自带引号: ${value}`);
      }
    }
  }
});

test('模板变量归属正确（@KEYMAP_*@ 只给 label，@TIMEOUT_*@ 只给 progress_bar）', () => {
  assert.deepEqual(componentEnumMap.label.text.values, [
    '@KEYMAP_SHORT@',
    '@KEYMAP_MIDDLE@',
    '@KEYMAP_LONG@',
  ]);
  assert.deepEqual(componentEnumMap.progress_bar.text.values, [
    '@TIMEOUT_NOTIFICATION_SHORT@',
    '@TIMEOUT_NOTIFICATION_MIDDLE@',
    '@TIMEOUT_NOTIFICATION_LONG@',
  ]);
  assert.equal(componentEnumMap.label.text.quote, true);
  assert.equal(componentEnumMap.progress_bar.text.quote, true);
});

test('GRUB 解析器不实现的属性不再出现在补全里', () => {
  // 依据 grub-core/gfxmenu/*.c：这些名字要么不是 GRUB 的属性（BURG 风格），
  // 要么只是 GRUB 通过 set_state 推送的状态。写进主题会被静默忽略，
  // 所以不再提示（详见 README「属性数据说明」）。
  const removed = [
    'position',
    'preferred_size',
    'show_text',
    'value',
    'start',
    'end',
    'max_items_shown',
  ];
  const suggested = new Set([
    ...globalProperties.map((p) => p.label),
    ...Object.values(componentAttrMap).flatMap((specs) => specs.map((p) => p.label)),
  ]);
  for (const name of removed) {
    assert.ok(!suggested.has(name), `${name} 不应再出现在补全数据里`);
  }
});

test('visible 只出现在实现它的组件里', () => {
  const withVisible = Object.entries(componentAttrMap)
    .filter(([, specs]) => specs.some((p) => p.label === 'visible'))
    .map(([component]) => component)
    .sort();
  assert.deepEqual(withVisible, ['boot_menu', 'circular_progress', 'label', 'progress_bar']);
});
