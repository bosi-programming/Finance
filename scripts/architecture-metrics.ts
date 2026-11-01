import { readFileSync } from 'node:fs';
import {
  Project,
  SyntaxKind,
  type ArrowFunction,
  type Block,
  type ClassDeclaration,
  type FunctionDeclaration,
  type ParameterDeclaration,
  type SourceFile,
  type VariableDeclaration,
} from 'ts-morph';
import { globSync } from 'glob';

type CruiserFolder = {
  name: string;
  moduleCount: number;
  afferentCouplings: number;
  efferentCouplings: number;
  instability: number;
};

type CruiserOutput = {
  folders?: CruiserFolder[];
};

type LcomResult = {
  folder: string;
  name: string;
  type: 'class' | 'component';
  value: number;
};

function loadCruiserOutput(): CruiserOutput {
  return JSON.parse(
    readFileSync('.tmp/dependency-cruiser.json', 'utf8'),
  ) as CruiserOutput;
}

function getSourceFiles(): SourceFile[] {
  const project = new Project();
  const files = globSync('src/**/*.{ts,tsx}', {
    ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/test/**/*'],
  });
  return files.map((file) => project.addSourceFileAtPath(file));
}

function calculateAbstractness(folderPath: string): number {
  const files = globSync(`${folderPath}/**/*.{ts,tsx}`, {
    ignore: [
      `${folderPath}/**/*.test.*`,
      `${folderPath}/**/*.spec.*`,
      `${folderPath}/**/test/**/*`,
    ],
  });

  if (files.length === 0) return 0;

  const project = new Project();
  let abstractCount = 0;
  let totalCount = 0;

  for (const file of files) {
    const sourceFile = project.addSourceFileAtPath(file);
    const exportedDeclarations = sourceFile.getExportedDeclarations();

    for (const declarations of exportedDeclarations.values()) {
      for (const declaration of declarations) {
        if (declaration.isKind(SyntaxKind.InterfaceDeclaration)) {
          abstractCount += 1;
          totalCount += 1;
        } else if (declaration.isKind(SyntaxKind.TypeAliasDeclaration)) {
          abstractCount += 1;
          totalCount += 1;
        } else if (declaration.isKind(SyntaxKind.ClassDeclaration)) {
          totalCount += 1;
          if (declaration.isAbstract()) {
            abstractCount += 1;
          }
        } else {
          totalCount += 1;
        }
      }
    }
  }

  return totalCount === 0 ? 0 : abstractCount / totalCount;
}

function rateDistance(d: number): string {
  if (d < 0.1) return 'excellent';
  if (d < 0.25) return 'good';
  if (d < 0.4) return 'mid';
  if (d < 0.7) return 'bad';
  return 'horrible';
}

function diagnoseCoupling(a: number, i: number, d: number): string {
  if (d < 0.4) return 'balanced';
  return a + i < 1
    ? 'too concrete/stable (zone of pain)'
    : 'too abstract/unstable (zone of uselessness)';
}

function rateLcom(value: number): string {
  if (value < 0.1) return 'excellent';
  if (value < 0.25) return 'good';
  if (value < 0.4) return 'mid';
  if (value < 0.7) return 'bad';
  return 'horrible';
}

function diagnoseLcom(value: number): string {
  return value < 0.4 ? 'high cohesion' : 'low cohesion';
}

function isPascalCase(name: string | undefined): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name ?? '');
}

function returnsJsx(node: FunctionDeclaration | ArrowFunction): boolean {
  const jsxKinds = [
    SyntaxKind.JsxElement,
    SyntaxKind.JsxSelfClosingElement,
    SyntaxKind.JsxFragment,
  ];
  return jsxKinds.some((kind) => node.getDescendantsOfKind(kind).length > 0);
}

function getParameterNames(parameter: ParameterDeclaration): string[] {
  const nameNode = parameter.getNameNode();
  if (nameNode.isKind(SyntaxKind.ObjectBindingPattern)) {
    return nameNode.getElements().map((element) => element.getName());
  }
  return [parameter.getName()];
}

function isHookCall(
  declaration: VariableDeclaration,
  hookName: string,
): boolean {
  const initializer = declaration.getInitializer();
  if (!initializer?.isKind(SyntaxKind.CallExpression)) return false;
  const expression = initializer.asKind(SyntaxKind.CallExpression);
  const callee = expression?.getExpression();
  return callee?.getText() === hookName;
}

function getStatefulVariableNames(declaration: VariableDeclaration): string[] {
  const nameNode = declaration.getNameNode();

  if (nameNode.isKind(SyntaxKind.ArrayBindingPattern)) {
    const elements = nameNode.getElements();
    const bindingElement = elements[0]?.asKind(SyntaxKind.BindingElement);
    if (bindingElement) {
      const name = bindingElement.getName();
      return name ? [name] : [];
    }
    return [];
  }

  const name = declaration.getName();
  return name ? [name] : [];
}

function getComponentFields(
  component: FunctionDeclaration | ArrowFunction,
  body: Block,
): string[] {
  const paramNames = component.getParameters().flatMap(getParameterNames);

  const statefulVariableNames = body
    .getVariableStatements()
    .flatMap((statement) => statement.getDeclarations())
    .filter(
      (declaration) =>
        isHookCall(declaration, 'useState') ||
        isHookCall(declaration, 'useRef') ||
        isHookCall(declaration, 'useReducer') ||
        isHookCall(declaration, 'useContext'),
    )
    .flatMap(getStatefulVariableNames);

  return [...new Set([...paramNames, ...statefulVariableNames])];
}

function getComponentMethods(body: Block, fields: string[]): ArrowFunction[] {
  const methods = body.getDescendantsOfKind(SyntaxKind.ArrowFunction);
  if (fields.length === 0) {
    return methods;
  }
  return methods.filter((method) =>
    fields.some((field) =>
      method
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .some((id) => id.getText() === field),
    ),
  );
}

function calculateComponentLcom96b(
  component: FunctionDeclaration | ArrowFunction,
  folder: string,
  name: string,
): LcomResult | null {
  const body = component.getBody();
  if (!body || !body.isKind(SyntaxKind.Block)) return null;

  const fields = getComponentFields(component, body);
  const methods = getComponentMethods(body, fields);

  if (fields.length < 2 || methods.length < 2) return null;

  let sumAccess = 0;
  for (const field of fields) {
    const accessCount = methods.filter((method) =>
      method
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .some((id) => id.getText() === field),
    ).length;
    sumAccess += accessCount;
  }

  const value = 1 - sumAccess / (fields.length * methods.length);
  return { folder, name, type: 'component', value };
}

function calculateClassLcom96b(
  classNode: ClassDeclaration,
  folder: string,
): LcomResult | null {
  const fields = classNode
    .getProperties()
    .filter((property) => !property.isStatic())
    .map((property) => property.getName());

  const methods = [
    ...classNode.getConstructors(),
    ...classNode.getMethods(),
    ...classNode.getGetAccessors(),
    ...classNode.getSetAccessors(),
  ];

  if (fields.length < 2 || methods.length < 2) return null;

  let sumAccess = 0;
  for (const fieldName of fields) {
    const accessCount = methods.filter((method) =>
      method
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .some(
          (ref) =>
            ref.getExpression().isKind(SyntaxKind.ThisKeyword) &&
            ref.getName() === fieldName,
        ),
    ).length;
    sumAccess += accessCount;
  }

  const value = 1 - sumAccess / (fields.length * methods.length);
  return {
    folder,
    name: classNode.getName() ?? '<anonymous>',
    type: 'class',
    value,
  };
}

function collectLcomResults(): LcomResult[] {
  const results: LcomResult[] = [];

  for (const sourceFile of getSourceFiles()) {
    const folder = getFolderName(sourceFile.getFilePath());

    for (const classNode of sourceFile.getClasses()) {
      const result = calculateClassLcom96b(classNode, folder);
      if (result) results.push(result);
    }

    for (const func of sourceFile.getFunctions()) {
      if (isPascalCase(func.getName()) && returnsJsx(func)) {
        const result = calculateComponentLcom96b(
          func,
          folder,
          func.getName() ?? '<anonymous>',
        );
        if (result) results.push(result);
      }
    }

    for (const variable of sourceFile.getVariableDeclarations()) {
      const name = variable.getName();
      const initializer = variable.getInitializer();
      if (isPascalCase(name) && initializer?.isKind(SyntaxKind.ArrowFunction)) {
        const arrow = initializer.asKind(SyntaxKind.ArrowFunction);
        if (arrow && returnsJsx(arrow)) {
          const result = calculateComponentLcom96b(arrow, folder, name);
          if (result) results.push(result);
        }
      }
    }
  }

  return results;
}

function getFolderName(filePath: string): string {
  const relative = filePath.replace(`${process.cwd()}/`, '');
  const parts = relative.split('/');
  return parts.slice(0, -1).join('/') || 'src';
}

function aggregateLcomByFolder(results: LcomResult[]): Array<{
  folder: string;
  count: number;
  avg: string;
  max: string;
  rating: string;
  diagnosis: string;
}> {
  const grouped = new Map<string, LcomResult[]>();
  for (const result of results) {
    const existing = grouped.get(result.folder) ?? [];
    existing.push(result);
    grouped.set(result.folder, existing);
  }

  return [...grouped.entries()].map(([folder, items]) => {
    const values = items.map((item) => item.value);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const max = Math.max(...values);

    return {
      folder,
      count: items.length,
      avg: avg.toFixed(2),
      max: max.toFixed(2),
      rating: rateLcom(avg),
      diagnosis: diagnoseLcom(avg),
    };
  });
}

function runCouplingReport() {
  const cruiser = loadCruiserOutput();
  const folders = cruiser.folders ?? [];

  const rows = folders
    .filter((folder) => folder.name.startsWith('src'))
    .filter((folder) => folder.name.replace(/^\//, '') !== 'src')
    .map((folder) => {
      const folderPath = folder.name.replace(/^\//, '');
      const isLeaf = folder.moduleCount === 1 && folder.instability === 0;
      const a = calculateAbstractness(folderPath);
      const i = folder.instability;
      const d = Math.abs(a + i - 1);

      return {
        folder: folder.name,
        a: a.toFixed(2),
        i: i.toFixed(2),
        d: d.toFixed(2),
        rating: isLeaf ? 'leaf' : rateDistance(d),
        diagnosis: isLeaf
          ? 'leaf module (no internal deps)'
          : diagnoseCoupling(a, i, d),
      };
    });

  console.log('Coupling metrics report');
  console.table(rows);
}

function runCohesionReport() {
  const results = collectLcomResults();
  const rows = aggregateLcomByFolder(results);

  console.log('Cohesion metrics report (LCOM96B)');
  console.table(rows);
}

function main() {
  runCouplingReport();
  console.log();
  runCohesionReport();
}

main();
