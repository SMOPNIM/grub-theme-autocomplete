import * as vscode from 'vscode';
import {
  componentSnippet,
  cursorAfterPlus,
  extractAttributeName,
  getComponentStack,
  getCurrentComponentType,
  isInComment,
  isInsideValue,
  nameReplaceStart,
  valueEdit,
} from './context';
import {
  componentAttrMap,
  componentEnumMap,
  componentTypes,
  globalEnumMap,
  globalProperties,
  EnumSpec,
  PropSpec,
} from './data';

// ==================== 补全项构造 ====================
// 说明：VS Code 在未设置 item.range 时只会替换“当前单词”（由语言的 word definition 决定），
// 对 `desktop-im` / `text = "@TI` 这类前缀会只替换最后一段、把前面的内容留下。
// 所以这里每个补全项都显式给出 range，并且**按请求新建实例**（数据表里的描述对象是共享的）。

function makeRange(position: vscode.Position, start: number, end: number): vscode.Range {
  return new vscode.Range(position.line, start, position.line, end);
}

/** 属性名/组件名补全：替换用户已经输入的属性名前缀。 */
function propertyItems(
  specs: readonly PropSpec[],
  position: vscode.Position,
  linePrefix: string
): vscode.CompletionItem[] {
  const range = makeRange(position, nameReplaceStart(linePrefix), position.character);
  return specs.map((spec) => {
    const item = new vscode.CompletionItem(spec.label, vscode.CompletionItemKind.Property);
    item.detail = spec.detail;
    item.insertText = new vscode.SnippetString(spec.insert);
    item.range = range;
    return item;
  });
}

/** 枚举值补全：替换整段已输入的值（含引号处理）。 */
function valueItems(
  spec: EnumSpec,
  line: string,
  linePrefix: string,
  position: vscode.Position
): vscode.CompletionItem[] {
  const nextChar = line[position.character];
  return spec.values.map((value) => {
    const edit = valueEdit(linePrefix, nextChar, value, spec.quote === true);
    const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.EnumMember);
    item.insertText = edit.insert;
    item.range = makeRange(position, edit.start, edit.end);
    return item;
  });
}

/** `+` 之后的组件片段补全。 */
function componentItems(position: vscode.Position, linePrefix: string): vscode.CompletionItem[] {
  return componentTypes.map((component) => {
    const snippet = componentSnippet(linePrefix, component.label);
    const item = new vscode.CompletionItem(component.label, vscode.CompletionItemKind.Snippet);
    item.detail = component.detail;
    item.insertText = new vscode.SnippetString(snippet.insert);
    item.range = makeRange(position, snippet.replaceStart, position.character);
    return item;
  });
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
        const line = document.lineAt(position.line).text;
        const linePrefix = line.slice(0, position.character);

        // 0) 注释里不提供任何建议（字符串里的 `#` 不算注释）
        if (isInComment(linePrefix)) {
          return [];
        }

        // 只扫描一次光标前的文本：组件栈用来判断“是否在组件里”，
        // 组件名用来取该组件的属性/枚举表（未知组件查表落空，什么都不提示）。
        const textBefore = document.getText(
          new vscode.Range(new vscode.Position(0, 0), position)
        );
        const insideComponent = getComponentStack(textBefore).length > 0;
        const component = getCurrentComponentType(textBefore);

        // 1) 属性值：`=` / `:` 之后，按「组件 + 属性名」取枚举值
        if (isInsideValue(linePrefix)) {
          const attr = extractAttributeName(linePrefix);
          if (!attr) {
            return [];
          }
          const spec = component ? componentEnumMap[component]?.[attr] : globalEnumMap[attr];
          return spec ? valueItems(spec, line, linePrefix, position) : [];
        }

        // 2) `+` 之后：组件片段
        if (cursorAfterPlus(linePrefix)) {
          return componentItems(position, linePrefix);
        }

        // 3) 组件内部：该组件支持的属性（未知组件返回空，而不是退回全局属性）
        if (insideComponent) {
          const specs = component ? componentAttrMap[component] : undefined;
          return specs ? propertyItems(specs, position, linePrefix) : [];
        }

        // 4) 顶层：全局属性
        return propertyItems(globalProperties, position, linePrefix);
      },
    },
    '+',
    ':',
    '='
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}
