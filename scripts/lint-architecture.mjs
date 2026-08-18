import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

let repoRoot = process.cwd();
let issues = [];

export function lintArchitecture(root) {
  repoRoot = resolve(root);
  issues = [];
  const srcRoot = resolve(repoRoot, "src");
  const sourceFiles = collectSourceFiles(srcRoot).filter((file) => !isTestFile(file));

  for (const file of sourceFiles) {
    const text = readFileSync(file, "utf8");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const repoPath = toRepoPath(file);

    visit(source, (node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        checkImport(repoPath, node.moduleSpecifier.text, source, node);
      }

      if (isAuthoritativeSimulationFile(repoPath) && isMathRandomCall(node)) {
        addIssue(repoPath, source, node, "authoritative simulation code must use seeded RandomService streams, not Math.random");
      }

      if (isDynamicExecution(node)) {
        addIssue(repoPath, source, node, "dynamic code execution is forbidden");
      }

      if (isAuthoritativeSimulationFile(repoPath) && isForbiddenSimulationPlatformReference(node)) {
        addIssue(repoPath, source, node, "simulation implementation must not use UI, rendering, or browser-storage globals");
      }

      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        checkJsxAccessibility(repoPath, source, node);
      }
    });
  }

  return { issues: [...issues], sourceFileCount: sourceFiles.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = lintArchitecture(process.env.ORTUS_LINT_ROOT ?? process.cwd());
  if (result.issues.length > 0) {
    console.error("Architecture lint failed:\n");
    for (const issue of result.issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Architecture lint passed (${result.sourceFileCount} production TypeScript files checked).`);
  }
}

function collectSourceFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = resolve(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return collectSourceFiles(path);
    }
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

function isTestFile(file) {
  return file.includes(`${sep}__tests__${sep}`) || /\.(test|spec)\.tsx?$/.test(file) || file.includes(`${sep}testing${sep}`);
}

function toRepoPath(file) {
  return relative(repoRoot, file).split(sep).join("/");
}

function isAuthoritativeSimulationFile(repoPath) {
  return repoPath.startsWith("src/simulation/");
}

function visit(node, inspect) {
  inspect(node);
  node.forEachChild((child) => visit(child, inspect));
}

function checkImport(repoPath, specifier, source, node) {
  if (isAuthoritativeSimulationFile(repoPath)) {
    const forbiddenPackage = /^(react|react-dom|zustand|next)(\/|$)/.test(specifier);
    const forbiddenLayer = /(^|\/)(app|components|state)(\/|$)/.test(specifier);
    if (forbiddenPackage || forbiddenLayer) {
      addIssue(repoPath, source, node, `simulation implementation imports forbidden UI layer "${specifier}"`);
    }
  }

  if (repoPath.startsWith("src/research/") && /simulation\/(kernel\/)?(SimulationEngine|World|Random|CommandBuffer|SimulationRuntime)(\/|$)/.test(specifier)) {
    addIssue(repoPath, source, node, `research code imports mutable simulation authority "${specifier}"`);
  }

  const uiOrProductSource = /^(src\/(app|components|state|lib)\/)/.test(repoPath);
  const privateRuntimeImport = /simulation\/runtime\/(RuntimeSession|RuntimeWorkerHost|RuntimeScheduler|LatestPublicationGate|protocol)$/.test(specifier);
  if (uiOrProductSource && privateRuntimeImport) {
    addIssue(repoPath, source, node, `product/UI code imports private runtime authority "${specifier}"`);
  }
}

function isMathRandomCall(node) {
  return ts.isCallExpression(node)
    && ts.isPropertyAccessExpression(node.expression)
    && ts.isIdentifier(node.expression.expression)
    && node.expression.expression.text === "Math"
    && node.expression.name.text === "random";
}

function isDynamicExecution(node) {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "eval") {
    return true;
  }
  return ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "Function";
}

function isForbiddenSimulationPlatformReference(node) {
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
    return ["document", "window", "localStorage", "sessionStorage", "navigator"].includes(node.expression.text);
  }
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    return ["requestAnimationFrame", "cancelAnimationFrame"].includes(node.expression.text);
  }
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    return ["CanvasRenderingContext2D", "HTMLCanvasElement"].includes(node.typeName.text);
  }
  return false;
}

function checkJsxAccessibility(repoPath, source, node) {
  const tag = jsxTagName(node.tagName);
  if (!tag || tag.includes(".")) {
    return;
  }
  const attributes = new Set(node.attributes.properties
    .filter(ts.isJsxAttribute)
    .map((attribute) => attribute.name.text.toString().toLowerCase()));

  if (tag === "img" && !attributes.has("alt")) {
    addIssue(repoPath, source, node, "img elements require an alt attribute");
  }
  if (tag === "iframe" && !attributes.has("title")) {
    addIssue(repoPath, source, node, "iframe elements require a title attribute");
  }

  const nativeInteractive = new Set(["a", "button", "input", "select", "textarea", "summary", "details", "option"]);
  if (attributes.has("onclick") && !nativeInteractive.has(tag)) {
    const hasKeyboardHandler = attributes.has("onkeydown") || attributes.has("onkeyup") || attributes.has("onkeypress");
    if (!hasKeyboardHandler || !attributes.has("role") || !attributes.has("tabindex")) {
      addIssue(repoPath, source, node, `non-interactive <${tag}> with onClick requires role, tabIndex, and a keyboard handler`);
    }
  }
}

function jsxTagName(tagName) {
  const text = ts.isIdentifier(tagName) ? tagName.text : tagName.getText();
  if (text.length === 0 || text[0] !== text[0].toLowerCase()) {
    return null;
  }
  return text.toLowerCase();
}

function addIssue(repoPath, source, node, message) {
  const position = source.getLineAndCharacterOfPosition(node.getStart(source));
  issues.push(`${repoPath}:${position.line + 1}:${position.character + 1} ${message}`);
}
