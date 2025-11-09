import {
  alt,
  apply,
  list_sc,
  opt,
  Parser,
  rep,
  seq,
  tok,
  Token,
  expectEOF,
  expectSingleResult,
} from 'typescript-parsec';

import {
  ImportStatement,
  FieldDefinition,
  NodeDefinition,
  TypeDefinition,
  Spec,
} from './ast';
import { scanner, TokenKind } from './scanner';

const ident = alt(tok(TokenKind.Ident), tok(TokenKind.From));

/**
 * Extract a string path out of a path token.
 *
 * @param pathToken The path token.
 * @returns The path as a string.
 */
export function applyPath(pathToken: Token<TokenKind>): string {
  let path = pathToken.text;
  if (path[0] === "'") {
    path = path.slice(1, path.length - 1);
    path = path.replace(/"/, '\\"').replace(/\\'/, "'");
    path = `"${path}"`;
  }
  path = JSON.parse(path);
  return path;
}

const importStarAsIdent = apply(
  seq(tok(TokenKind.Asterisk), tok(TokenKind.As), tok(TokenKind.Ident)),
  ([_asterisk, _as, ident]) => `* as ${ident.text}`,
);
const importStar = apply(tok(TokenKind.Asterisk), (_) => '*');
const importIdent = apply(tok(TokenKind.Ident), (ident) => ident.text);
const importItems = apply(
  seq(
    tok(TokenKind.LBrace),
    list_sc(tok(TokenKind.Ident), tok(TokenKind.Comma)),
    tok(TokenKind.RBrace),
  ),
  ([_lbrace, idents, _rbrace]) => `{ ${idents.map((i) => i.text).join(', ')} }`,
);

function applyImportStatement([
  _import,
  target,
  _from,
  pathToken,
]): ImportStatement {
  const path = applyPath(pathToken);
  return {
    type: 'import',
    statement: `import ${target} from ${JSON.stringify(path)};`,
    path,
  };
}

const importStatement: Parser<TokenKind, ImportStatement> = apply(
  seq(
    tok(TokenKind.Import),
    alt(importStarAsIdent, importStar, importIdent, importItems),
    tok(TokenKind.From),
    tok(TokenKind.Path),
  ),
  applyImportStatement,
);

// TODO: A more robust definition of this would be nice
const typeAnnotation: Parser<TokenKind, string> = apply(
  rep(
    alt(
      ident,
      tok(TokenKind.Union),
      tok(TokenKind.LBracket),
      tok(TokenKind.RBracket),
      tok(TokenKind.Lt),
      tok(TokenKind.Gt),
    ),
  ),
  (tokens) => tokens.map((t) => t.text).join(' '),
);

// TODO: This is NOT a good definition of an expression LOL
const expression: Parser<TokenKind, string> = apply(
  rep(
    alt(
      tok(TokenKind.LBracket),
      tok(TokenKind.RBracket),
      tok(TokenKind.Asterisk),
      tok(TokenKind.Path),
      tok(TokenKind.Bang),
      tok(TokenKind.OfType),
      ident,
      tok(TokenKind.Union),
      tok(TokenKind.Plus),
      tok(TokenKind.Minus),
      tok(TokenKind.Slash),
      tok(TokenKind.Digit),
    ),
  ),
  (tokens) => tokens.map((t) => t.text).join(' '),
);

const defaultValue: Parser<TokenKind, string> = apply(
  seq(tok(TokenKind.Eq), expression),
  ([_eq, value]) => value,
);

function applyFieldDefinition([ident, _ofType, type, default_]) {
  return { name: ident.text, type, default: default_ || null };
}

const fieldDefinition: Parser<TokenKind, FieldDefinition> = apply(
  seq(
    ident,
    tok(TokenKind.OfType),
    typeAnnotation,
    opt(defaultValue),
  ),
  applyFieldDefinition,
);

const fieldDefinitions: Parser<TokenKind, FieldDefinition[]> = apply(
  seq(tok(TokenKind.HasFields), list_sc(fieldDefinition, tok(TokenKind.Comma))),
  ([_hasFields, fields]) => fields,
);

const noFieldDefinitions: Parser<TokenKind, FieldDefinition[]> = apply(
  tok(TokenKind.Bang),
  (_) => [],
);

function applyNodeDefinition([name, fields]: [
  Token<TokenKind>,
  FieldDefinition[],
]): NodeDefinition {
  return {
    type: 'node',
    name: name.text,
    fields,
  };
}

const nodeDefinition: Parser<TokenKind, NodeDefinition> = apply(
  seq(ident, alt(fieldDefinitions, noFieldDefinitions)),
  applyNodeDefinition,
);

const typeBody = rep(alt(importStatement, nodeDefinition));

const inPath: Parser<TokenKind, string> = apply(
  seq(tok(TokenKind.In), tok(TokenKind.Path)),
  ([_, p]) => applyPath(p),
);

function applyTypeDefinition([
  _type,
  name,
  path,
  _lbrace,
  body,
  _rbrace,
]): TypeDefinition {
  const imps: ImportStatement[] = [];
  const nodes: NodeDefinition[] = [];

  for (const statement of body) {
    if (statement.type === 'import') {
      imps.push(statement);
    } else {
      nodes.push(statement);
    }
  }
  return {
    type: 'type',
    name: name.text,
    path: path || null,
    imports: imps,
    nodes,
  };
}

const typeDefinition: Parser<TokenKind, TypeDefinition> = apply(
  seq(
    tok(TokenKind.Type),
    ident,
    inPath,
    tok(TokenKind.LBrace),
    typeBody,
    tok(TokenKind.RBrace),
  ),
  applyTypeDefinition,
);

function applySpec(statements: Array<ImportStatement | TypeDefinition>): Spec {
  const spec: Spec = {
    imports: [],
    types: [],
  };

  for (const statement of statements) {
    if (statement.type === 'import') {
      spec.imports.push(statement);
    } else {
      spec.types.push(statement);
    }
  }

  return spec;
}

export const parser: Parser<TokenKind, Spec> = apply(
  rep(alt(importStatement, typeDefinition)),
  applySpec,
);

/**
 * Parse a spec.
 *
 * @param contents The string contents of a spec.
 * @returns The parsed spec.
 */
export function parseSpec(contents: string): Spec {
  return expectSingleResult(expectEOF(parser.parse(scanner.parse(contents))));
}
