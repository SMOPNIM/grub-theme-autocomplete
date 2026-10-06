// GRUB theme.txt 的轻量上下文分析。
//
// 这里刻意不引用 vscode API：全部是纯字符串逻辑，既方便在 provider 里复用，
// 也能被 test/ 下的单元测试直接覆盖（见 README「开发」）。

/** 未知组件在组件栈里的占位名（只有裸 `{` 才会用到）。 */
const ANONYMOUS_COMPONENT = '__anonymous__';

/** `name <分隔符> value` 的解析结果；`valueStart` 是值区的起始列（0-based）。 */
export interface Assignment {
  name?: string;
  valueStart?: number;
}

/** 值补全要替换的范围与插入文本。 */
export interface ValueEdit {
  /** 替换起点列（0-based） */
  start: number;
  /** 替换终点列（0-based），可能比光标多 1 列（吞掉已输入的收尾引号） */
  end: number;
  /** 实际插入的文本 */
  insert: string;
}

/**
 * 剥离双引号字符串内容与 `#` 注释，避免 `"{"` / `# {` 干扰大括号计数。
 * 保留换行符以维持行结构。
 */
export function stripStringsAndComments(text: string): string {
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

/**
 * 光标是否位于 `#` 行注释内（字符串里的 `#` 不算注释）。
 */
export function isInComment(linePrefix: string): boolean {
  let inString = false;
  for (let i = 0; i < linePrefix.length; i++) {
    const ch = linePrefix[i];
    if (inString) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '#') {
      return true;
    }
  }
  return false;
}

/**
 * 解析行前缀里第一个未被引号包裹的 `:` / `=`。
 *
 * 逐个字符扫描（而不是用正则找最后一个分隔符），这样 `title-text: "a: b"`
 * 这种值里带冒号的行也能正确识别出属性名与值区起点。
 */
export function parseAssignment(linePrefix: string): Assignment {
  let inString = false;
  for (let i = 0; i < linePrefix.length; i++) {
    const ch = linePrefix[i];
    if (inString) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '#') {
      // 注释之后不会再有属性
      return {};
    }
    if (ch === ':' || ch === '=') {
      const nameMatch = /([\w-]+)\s*$/.exec(linePrefix.slice(0, i));
      // 值区起点跳过分隔符后的空白：这样替换范围与过滤前缀都不含多余空格，
      // `align = c` 只替换 `c`，而 `id = "` 的值起点正好落在开引号上。
      let valueStart = i + 1;
      while (valueStart < linePrefix.length && /\s/.test(linePrefix[valueStart])) {
        valueStart++;
      }
      return { name: nameMatch ? nameMatch[1] : undefined, valueStart };
    }
  }
  return {};
}

/** 光标是否位于属性值区（分隔符之后，需容忍已输入的值前缀）。 */
export function isInsideValue(linePrefix: string): boolean {
  return parseAssignment(linePrefix).valueStart !== undefined;
}

/** 光标所在值区对应的属性名。 */
export function extractAttributeName(linePrefix: string): string | undefined {
  return parseAssignment(linePrefix).name;
}

/**
 * 属性名补全的替换起点：从光标向左扫描属性名字符（`[\w-]`）。
 *
 * 这样 `desktop-im` 会被整段替换（而不是只替换 `im`），
 * `+ label { co` 也只会替换 `co`、不会吃掉组件开头。
 */
export function nameReplaceStart(linePrefix: string): number {
  const match = /[\w-]*$/.exec(linePrefix);
  return linePrefix.length - (match ? match[0].length : 0);
}

/**
 * 组件片段（`+` 之后）的插入文本与替换起点。
 *
 * `+`（补前导空格）、`+ `（已有空格，不再补）、`+ lab`、`+lab` 四种写法都能得到
 * 期望的 `+ label {`。
 */
export function componentSnippet(
  linePrefix: string,
  label: string
): { insert: string; replaceStart: number } {
  const replaceStart = nameReplaceStart(linePrefix);
  const needsLeadingSpace = linePrefix.slice(0, replaceStart).endsWith('+');
  return {
    insert: `${needsLeadingSpace ? ' ' : ''}${label} {\n\t$0\n}`,
    replaceStart,
  };
}

/**
 * 计算枚举值补全的替换范围与插入文本。
 *
 * 关键点：`item.range` 必须覆盖用户已经输入的值（含 `"`），否则 VS Code 只会替换
 * “当前单词”，`"@TI` → `"@…@"` 会变成 `"@"@…@"`。
 *
 * - 用户没打引号：替换整段值，插入带引号的完整值；
 * - 用户已经打了开引号：把开引号排除在替换范围外，插入「值 + 收尾引号」，
 *   这样过滤用的前缀不含引号（能正常匹配 label），光标右侧若已有收尾引号也会一并吞掉。
 */
export function valueEdit(
  linePrefix: string,
  nextChar: string | undefined,
  value: string,
  quoted: boolean
): ValueEdit {
  const start0 = parseAssignment(linePrefix).valueStart ?? linePrefix.length;
  if (!quoted) {
    return { start: start0, end: linePrefix.length, insert: value };
  }
  const hasOpenQuote = linePrefix.slice(start0).startsWith('"');
  if (!hasOpenQuote) {
    return { start: start0, end: linePrefix.length, insert: `"${value}"` };
  }
  return {
    start: start0 + 1,
    end: linePrefix.length + (nextChar === '"' ? 1 : 0),
    insert: `${value}"`,
  };
}

/** 光标前是否只有 `+`（可带缩进）和可选的组件名，即正处于“输入组件”的位置。 */
export function cursorAfterPlus(linePrefix: string): boolean {
  return /^\s*\+\s*\w*\s*$/.test(linePrefix);
}

/** 从前文正向扫描，维护组件栈，可正确处理嵌套与 `{` 换行场景。 */
export function getComponentStack(textBefore: string): string[] {
  const cleaned = stripStringsAndComments(textBefore);
  const stack: string[] = [];
  const tokenRe = /\+\s*(\w+)|([{}])/g;
  let m: RegExpExecArray | null;
  let pending: string | undefined;
  while ((m = tokenRe.exec(cleaned)) !== null) {
    if (m[1] !== undefined) {
      pending = m[1];
    } else if (m[2] === '{') {
      stack.push(pending ?? ANONYMOUS_COMPONENT);
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

/**
 * 当前所在的组件名。
 *
 * 不在任何组件内（或只有裸 `{`）时返回 undefined；未知组件名会原样返回，
 * 由调用方查表决定是否给建议（例如 `+ foo {` 查不到就什么也不提示）。
 */
export function getCurrentComponentType(textBefore: string): string | undefined {
  const stack = getComponentStack(textBefore);
  const top = stack.length > 0 ? stack[stack.length - 1] : undefined;
  if (!top || top === ANONYMOUS_COMPONENT) {
    return undefined;
  }
  return top;
}
