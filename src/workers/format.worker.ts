/* eslint-disable no-restricted-globals */
import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";
import * as parserHtml from "prettier/plugins/html";
import * as parserCss from "prettier/plugins/postcss";
import * as parserMarkdown from "prettier/plugins/markdown";
import * as parserTypescript from "prettier/plugins/typescript";

const PLUGINS: Record<string, any[]> = {
  javascript: [parserBabel, parserEstree],
  typescript: [parserTypescript, parserBabel, parserEstree],
  json: [parserBabel, parserEstree],
  html: [parserHtml],
  css: [parserCss],
  markdown: [parserMarkdown],
};

// Languages handled by the basic normalizer (no Prettier plugin available in browser)
const BASIC_FORMAT_LANGS = new Set(["python", "go", "rust", "java", "cpp"]);

/**
 * Basic code normalizer for languages without Prettier browser support.
 * Handles:
 *  - Trailing whitespace removal
 *  - Collapsing 3+ consecutive blank lines into 2
 *  - Consistent indentation (converts tabs → spaces or vice-versa based on first indent found)
 */
function basicFormat(text: string, language: string): string {
  const lines = text.split("\n");

  // Detect dominant indent style from first indented line
  const firstIndented = lines.find((l) => /^( +|\t+)\S/.test(l));
  const useTabs = firstIndented ? firstIndented.startsWith("\t") : false;
  const tabWidth = language === "python" ? 4 : 4; // Python always 4; others 4 too

  const normalized: string[] = [];
  let consecutiveBlanks = 0;

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Blank line handling
    if (trimmed === "") {
      consecutiveBlanks++;
      // Python PEP8: max 2 blank lines between top-level; max 1 inside
      // Others: max 2
      if (consecutiveBlanks <= 2) {
        normalized.push("");
      }
      continue;
    }
    consecutiveBlanks = 0;

    // Normalize indentation
    const leadingMatch = trimmed !== line ? line.match(/^(\s+)/) : null;
    if (leadingMatch) {
      const rawIndent = leadingMatch[1];
      // Count indent depth in terms of spaces
      const spaceCount = rawIndent.replace(/\t/g, " ".repeat(tabWidth)).length;
      const depth = Math.floor(spaceCount / tabWidth);
      const normalized_indent = useTabs
        ? "\t".repeat(depth)
        : " ".repeat(depth * tabWidth);
      normalized.push(normalized_indent + trimmed.trimStart());
    } else {
      normalized.push(trimmed);
    }
  }

  // Remove leading/trailing blank lines from result
  while (normalized.length > 0 && normalized[0] === "") normalized.shift();
  while (normalized.length > 0 && normalized[normalized.length - 1] === "")
    normalized.pop();

  return normalized.join("\n") + "\n";
}

const PARSERS: Record<string, string> = {
  javascript: "babel",
  typescript: "babel-ts",
  json: "json",
  html: "html",
  css: "css",
  less: "less",
  scss: "scss",
  markdown: "markdown",
};

self.onmessage = async (e: MessageEvent) => {
  const {
    text,
    language,
    printWidth = 80,
    tabWidth = 2,
    useTabs = false,
  } = e.data;

  if (!text) {
    self.postMessage({ error: "No text provided" });
    return;
  }

  // Route to basic formatter for languages without Prettier browser support
  if (BASIC_FORMAT_LANGS.has(language)) {
    try {
      const formatted = basicFormat(text, language);
      self.postMessage({ language, formatted });
    } catch (error) {
      self.postMessage({ language, error: (error as Error).message });
    }
    return;
  }

  const parserFormat = PARSERS[language];
  const pluginsForLang = PLUGINS[language];

  if (!parserFormat || !pluginsForLang) {
    self.postMessage({
      error: `Language '${language}' is not supported for formatting.`,
    });
    return;
  }

  try {
    const formatted = await prettier.format(text, {
      parser: parserFormat,
      plugins: pluginsForLang,
      printWidth,
      tabWidth,
      useTabs,
      trailingComma: "es5",
    });

    self.postMessage({ language, formatted });
  } catch (error) {
    console.error(`Format error [${language}]:`, error);
    self.postMessage({ language, error: (error as Error).message });
  }
};
