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
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && isStaticString(node.moduleSpecifier)) {
        checkImport(repoPath, node.moduleSpecifier.text, source, node);
      }

      if (
        ts.isImportEqualsDeclaration(node)
        && ts.isExternalModuleReference(node.moduleReference)
        && node.moduleReference.expression
        && isStaticString(node.moduleReference.expression)
      ) {
        checkImport(repoPath, node.moduleReference.expression.text, source, node);
      }

      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        addIssue(repoPath, source, node, "runtime dynamic imports are forbidden; use reviewable static imports");
        const specifier = staticCallSpecifier(node);
        if (specifier) {
          checkImport(repoPath, specifier, source, node);
        }
      }

      if (isCommonJsRequireReference(node)) {
        addIssue(repoPath, source, node, "CommonJS require is forbidden; use reviewable static imports");
      }

      if (ts.isCallExpression(node) && isCommonJsRequireCallable(node.expression)) {
        const specifier = staticCallSpecifier(node);
        if (specifier) {
          checkImport(repoPath, specifier, source, node);
        }
      }

      if (isAuthoritativeSimulationFile(repoPath) && isMathRandomReference(node)) {
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

  const researchSimulationPath = repoPath.startsWith("src/research/") ? simulationImportPath(specifier) : null;
  if (
    researchSimulationPath !== null
    && !/^(observation|experiment|experiments)(\/|$)/.test(researchSimulationPath)
  ) {
    addIssue(
      repoPath,
      source,
      node,
      `research code imports simulation authority "${specifier}" instead of a public observation/experiment contract`
    );
  }

  const uiOrProductSource = /^(src\/(app|components|state|lib)\/)/.test(repoPath);
  const runtimePath = simulationRuntimeImportPath(specifier);
  const privateRuntimeImport = runtimePath !== null
    && /^(RuntimeSession|RuntimeWorkerHost|RuntimeScheduler|LatestPublicationGate|protocol|flockingProjection)(\/index)?$/.test(runtimePath);
  if (uiOrProductSource && privateRuntimeImport) {
    addIssue(repoPath, source, node, `product/UI code imports private runtime authority "${specifier}"`);
  }
}

function isMathRandomReference(node) {
  if (ts.isPropertyAccessExpression(node)) {
    return node.name.text === "random" && isGlobalMathExpression(node.expression);
  }
  if (ts.isElementAccessExpression(node)) {
    return staticPropertyName(node.argumentExpression) === "random" && isGlobalMathExpression(node.expression);
  }
  if (ts.isBindingElement(node) && bindingElementName(node) === "random" && ts.isObjectBindingPattern(node.parent)) {
    const declaration = node.parent.parent;
    return ts.isVariableDeclaration(declaration)
      && Boolean(declaration.initializer)
      && isGlobalMathExpression(declaration.initializer);
  }
  return isEscapedGlobalMathReference(node);
}

function isDynamicExecution(node) {
  if (isUnsafeDynamicReference(node)) {
    return true;
  }
  return ts.isCallExpression(node)
    && isStringTimerCallable(node.expression)
    && Boolean(node.arguments[0] && isStaticString(node.arguments[0]));
}

function isForbiddenSimulationPlatformReference(node) {
  if (ts.isIdentifier(node) && forbiddenSimulationGlobals.has(node.text) && isRuntimeIdentifierReference(node)) {
    return true;
  }
  if (ts.isPropertyAccessExpression(node) && isGlobalObjectExpression(node.expression)) {
    return forbiddenSimulationGlobals.has(node.name.text);
  }
  if (ts.isElementAccessExpression(node) && isGlobalObjectExpression(node.expression)) {
    const property = staticPropertyName(node.argumentExpression);
    return property !== null && forbiddenSimulationGlobals.has(property);
  }
  if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
    const declaration = node.parent.parent;
    const property = bindingElementName(node);
    return property !== null
      && forbiddenSimulationGlobals.has(property)
      && ts.isVariableDeclaration(declaration)
      && Boolean(declaration.initializer)
      && isGlobalObjectExpression(declaration.initializer);
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
  const attributeEntries = node.attributes.properties
    .filter(ts.isJsxAttribute)
    .map((attribute) => [attribute.name.text.toString().toLowerCase(), attribute]);
  const attributes = new Map(attributeEntries);

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
      return;
    }

    const role = staticJsxString(attributes.get("role"));
    const legacyCanvasImageSurface = tag === "canvas" && role === "img";
    if (role !== null && !interactiveRoles.has(role) && !legacyCanvasImageSurface) {
      addIssue(repoPath, source, node, `non-interactive <${tag}> with onClick requires an interactive role`);
    }

    const tabIndex = staticJsxNumber(attributes.get("tabindex"));
    if (tabIndex !== null && tabIndex < 0) {
      addIssue(repoPath, source, node, `non-interactive <${tag}> with onClick requires a non-negative tabIndex`);
    }
  }
}

const forbiddenSimulationGlobals = new Set(["document", "window", "localStorage", "sessionStorage", "navigator"]);
const interactiveRoles = new Set([
  "button",
  "checkbox",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem"
]);

function isStaticString(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function staticCallSpecifier(node) {
  const argument = node.arguments[0];
  return argument && isStaticString(argument) ? argument.text : null;
}

function normalizedModuleSpecifier(specifier) {
  return specifier
    .replaceAll("\\", "/")
    .replace(/[?#].*$/, "")
    .replace(/\.(?:[cm]?[jt]sx?)$/, "");
}

function simulationImportPath(specifier) {
  const normalized = normalizedModuleSpecifier(specifier);
  const match = /(?:^|\/)simulation(?:\/(.*))?$/.exec(normalized);
  return match ? (match[1] ?? "") : null;
}

function simulationRuntimeImportPath(specifier) {
  const simulationPath = simulationImportPath(specifier);
  if (simulationPath === null || !simulationPath.startsWith("runtime/")) {
    return null;
  }
  return simulationPath.slice("runtime/".length);
}

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current)
    || ts.isAsExpression(current)
    || ts.isTypeAssertionExpression(current)
    || ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  if (ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.CommaToken) {
    return unwrapExpression(current.right);
  }
  return current;
}

function staticPropertyName(node) {
  const expression = unwrapExpression(node);
  return isStaticString(expression) ? expression.text : null;
}

function isGlobalObjectExpression(node) {
  const expression = unwrapExpression(node);
  return ts.isIdentifier(expression) && ["globalThis", "window", "self"].includes(expression.text);
}

function isGlobalMathExpression(node) {
  const expression = unwrapExpression(node);
  if (ts.isIdentifier(expression)) {
    return expression.text === "Math";
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text === "Math" && isGlobalObjectExpression(expression.expression);
  }
  return ts.isElementAccessExpression(expression)
    && staticPropertyName(expression.argumentExpression) === "Math"
    && isGlobalObjectExpression(expression.expression);
}

function bindingElementName(node) {
  if (node.propertyName && (ts.isIdentifier(node.propertyName) || isStaticString(node.propertyName))) {
    return node.propertyName.text;
  }
  return ts.isIdentifier(node.name) ? node.name.text : null;
}

function isUnsafeDynamicReference(node) {
  if (ts.isIdentifier(node)) {
    if (!["eval", "Function"].includes(node.text) || !isRuntimeIdentifierReference(node)) {
      return false;
    }
    return !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node);
  }
  if (ts.isPropertyAccessExpression(node)) {
    return ["eval", "Function"].includes(node.name.text) && isGlobalObjectExpression(node.expression);
  }
  if (ts.isElementAccessExpression(node)) {
    const property = staticPropertyName(node.argumentExpression);
    return property !== null && ["eval", "Function"].includes(property) && isGlobalObjectExpression(node.expression);
  }
  return false;
}

function isStringTimerCallable(node) {
  const expression = unwrapExpression(node);
  if (ts.isIdentifier(expression)) {
    return expression.text === "setTimeout" || expression.text === "setInterval";
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return ["setTimeout", "setInterval"].includes(expression.name.text) && isGlobalObjectExpression(expression.expression);
  }
  if (ts.isElementAccessExpression(expression)) {
    const property = staticPropertyName(expression.argumentExpression);
    return property !== null && ["setTimeout", "setInterval"].includes(property) && isGlobalObjectExpression(expression.expression);
  }
  return false;
}

function isCommonJsRequireCallable(node) {
  const expression = unwrapExpression(node);
  if (ts.isIdentifier(expression)) {
    return expression.text === "require";
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text === "require" && isCommonJsHost(expression.expression);
  }
  if (ts.isElementAccessExpression(expression)) {
    return staticPropertyName(expression.argumentExpression) === "require" && isCommonJsHost(expression.expression);
  }
  return false;
}

function isCommonJsRequireReference(node) {
  if (ts.isIdentifier(node)) {
    if (node.text !== "require" || !isRuntimeIdentifierReference(node)) {
      return false;
    }
    return !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node);
  }
  return (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))
    && isCommonJsRequireCallable(node);
}

function isCommonJsHost(node) {
  const expression = unwrapExpression(node);
  return (ts.isIdentifier(expression) && expression.text === "module") || isGlobalObjectExpression(expression);
}

function isEscapedGlobalMathReference(node) {
  if (ts.isIdentifier(node) && node.text === "Math") {
    if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node && isGlobalObjectExpression(node.parent.expression)) {
      return false;
    }
    if (ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) {
      return false;
    }
    if (ts.isElementAccessExpression(node.parent) && node.parent.expression === node) {
      return false;
    }
    return isRuntimeIdentifierReference(node);
  }
  if (
    (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))
    && isGlobalMathExpression(node)
  ) {
    if (ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) {
      return false;
    }
    if (ts.isElementAccessExpression(node.parent) && node.parent.expression === node) {
      return false;
    }
    return true;
  }
  return false;
}

function isRuntimeIdentifierReference(node) {
  const parent = node.parent;
  if (!parent) {
    return true;
  }
  if (
    (ts.isVariableDeclaration(parent) || ts.isParameter(parent) || ts.isBindingElement(parent))
    && parent.name === node
  ) {
    return false;
  }
  if (
    (ts.isFunctionDeclaration(parent)
      || ts.isFunctionExpression(parent)
      || ts.isClassDeclaration(parent)
      || ts.isClassExpression(parent)
      || ts.isInterfaceDeclaration(parent)
      || ts.isTypeAliasDeclaration(parent)
      || ts.isEnumDeclaration(parent))
    && parent.name === node
  ) {
    return false;
  }
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    return isGlobalObjectExpression(parent.expression);
  }
  if (
    (ts.isPropertyAssignment(parent)
      || ts.isPropertyDeclaration(parent)
      || ts.isPropertySignature(parent)
      || ts.isMethodDeclaration(parent)
      || ts.isMethodSignature(parent))
    && parent.name === node
  ) {
    return false;
  }
  if (
    ts.isImportSpecifier(parent)
    || ts.isImportClause(parent)
    || ts.isNamespaceImport(parent)
    || ts.isExportSpecifier(parent)
  ) {
    return false;
  }
  return true;
}

function staticJsxString(attribute) {
  if (!attribute?.initializer) {
    return attribute ? "" : null;
  }
  if (isStaticString(attribute.initializer)) {
    return attribute.initializer.text.trim().toLowerCase();
  }
  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression && isStaticString(attribute.initializer.expression)) {
    return attribute.initializer.expression.text.trim().toLowerCase();
  }
  return null;
}

function staticJsxNumber(attribute) {
  if (!attribute?.initializer) {
    return null;
  }
  let expression = attribute.initializer;
  if (ts.isStringLiteral(expression)) {
    const value = Number(expression.text);
    return Number.isFinite(value) ? value : null;
  }
  if (ts.isJsxExpression(expression)) {
    if (!expression.expression) {
      return null;
    }
    expression = unwrapExpression(expression.expression);
  }
  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }
  if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(expression.operand)) {
    return -Number(expression.operand.text);
  }
  return null;
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
