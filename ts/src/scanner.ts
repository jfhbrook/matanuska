import { buildLexer } from 'typescript-parsec';

export enum TokenKind {
  // A subset of the MSX language. I'll want to support more of the language,
  // but I don't want to front-load tokenization too much - I can add those
  // in as I need them pretty easy.
  //
  // ref: https://github.com/Konamiman/MSX2-Technical-Handbook/blob/master/md/Chapter2.md/
  LParen='(',
  RParen=')',
  Comma=',',
  Semicolon=';',
  Colon=':',
  Equals='=',
  FileNo='#',
  IntLiteral='<int>',
  RealLiteral='<real>',
  StringLiteral='<string>',
  Beep='BEEP',
  BLoad='BLOAD',
  BSave='BSAVE',
  Close='CLOSE',
  Cls='CLS',
  Color='COLOR',
  Cont='CONT',
  Data='DATA',
  DefFn='DEF FN',
  DefInt='DEFINT',
  // TODO: I don't want to support both singles and doubles lol
  DefSng='DEFSNG',
  DefDbl='DEFDBL',
  DefStr='DEFSTR',
  DefUsr='DEF USR',
  Delete='DELETE',
  Dim='DIM',
  End='END',
  Eof='EOF',
  Erl='ERL',
  Err='ERR',
  Error='ERROR',
  For='FOR',
  Get='GET',
  Date='DATE',
  Time='TIME',
  GoSub='GOSUB',
  GoTo='GOTO',
  If='IF',
  Then='THEN',
  Else='ELSE',
  Input='INPUT',
  Interval='INTERVAL',
  On='ON',
  Off='OFF',
  Stop='STOP',
  Len='LEN',
  Let='LET',
  List='LIST',
  Load='LOAD',
  Using='USING',
  Merge='MERGE',
  // as in "new program", not "new object"
  New='NEW',
  Next='NEXT',
  Key='KEY',
  String='STRING',
  Open='OPEN',
  Peek='PEEK',
  Poke='POKE',
  Print='PRINT',
  Put='PUT',
  Read='READ',
  Rem='REM',
  Renum='RENUM',
  Restore='RESTORE',
  Resume='RESUME',
  // return [<linenumber>] line number in a subroutine
  Return='RETURN',
  Run='RUN',
  Save='SAVE',
  Set='SET',
  Screen='SCREEN',
  Prompt='PROMPT',
  Usr='USR',
  Wait='WAIT',

  // Basic file operations - MSX's DOS API is clunky and it's a lot of why
  // DOS basics failed imo
  Cd='CD',
  MkDir='MKDIR',
  RmDir='RMDIR',
  Rm='RM',
  Cp='CP',
  Touch='TOUCH',
  Mv='MV',
  PathLiteral='<path>',

  // Child process management
  Spawn='SPAWN',
  Job='JOB',
  Kill='KILL',
  CommandLiteral='<command>',

  // Reserved for "system" things
  System='SYSTEM',
  Process='PROCESS',
  
  // Reserved for logging
  Log='LOG',

  // Reserved for modules
  Import='IMPORT',
  Export='EXPORT',

  // Reserved keywords related to others in core language
  Start='START',
  Timeout='TIMEOUT',
  Value='VALUE',
  Values='VALUES',

  Whitespace='<whitespace>'
}

export const scanner = buildLexer([
  [true, /^(/g, TokenKind.LParen],
  [true, /^)/g, TokenKind.RParen],
  [true, /^,/g, TokenKind.Comma],
  [true, /^;/g, TokenKind.Semicolon],
  [true, /^:/g, TokenKind.Colon],
  [true, /^=/g, TokenKind.Equals],
  [true, /^#/g, TokenKind.FileNo],
  // TODO: integer literal
  // TODO: real literal
  // TODO: string literal
  // TODO: command literal
  // TODO: path literal
  // TODO: rem
  [true, /^BEEP(?![a-zA-Z_\-\/.])/ig, TokenKind.Beep],
  [true, /^BLOAD(?![a-zA-Z_\-\/.])/ig, TokenKind.BLoad],
  [true, /^BSAVE(?![a-zA-Z_\-\/.])/ig, TokenKind.BSave],
  [true, /^CLOSE(?![a-zA-Z_-/.])/ig, TokenKind.Close],
  [true, /^CLS(?![a-zA-Z_-/.])/ig, TokenKind.Cls],
  [true, /^COLOR(?![a-zA-Z_-/.])/ig, TokenKind.Color],
  [true, /^CONT(?![a-zA-Z_-/.])/ig, TokenKind.Cont],
  [true, /^DATA(?![a-zA-Z_-/.])/ig, TokenKind.Data],
  [true, /^DEF FN(?![a-zA-Z_-/.])/ig, TokenKind.DefFn],
  [true, /^DEFINT(?![a-zA-Z_-/.])/ig, TokenKind.DefInt],
  [true, /^DEFSNG(?![a-zA-Z_-/.])/ig, TokenKind.DefSng],
  [true, /^DEFDBL(?![a-zA-Z_-/.])/ig, TokenKind.DefDbl],
  [true, /^DEFSTR(?![a-zA-Z_-/.])/ig, TokenKind.DefStr],
  [true, /^DEF USR(?![a-zA-Z_-/.])/ig, TokenKind.DefUsr],
  [true, /^DELETE(?![a-zA-Z_-/.])/ig, TokenKind.Delete],
  [true, /^DIM(?![a-zA-Z_-/.])/ig, TokenKind.Dim],
  [true, /^END(?![a-zA-Z_-/.])/ig, TokenKind.End],
  [true, /^EOF(?![a-zA-Z_-/.])/ig, TokenKind.Eof],
  [true, /^ERL(?![a-zA-Z_-/.])/ig, TokenKind.Erl],
  [true, /^ERROR(?![a-zA-Z_-/.])/ig, TokenKind.Error],
  [true, /^ERR(?![a-zA-Z_-/.])/ig, TokenKind.Err],
  [true, /^FOR(?![a-zA-Z_-/.])/ig, TokenKind.For],
  [true, /^GET(?![a-zA-Z_-/.])/ig, TokenKind.Get],
  [true, /^DATE(?![a-zA-Z_-/.])/ig, TokenKind.Date],
  [true, /^TIME(?![a-zA-Z_-/.])/ig, TokenKind.Time],
  [true, /^GOSUB(?![a-zA-Z_-/.])/ig, TokenKind.GoSub],
  [true, /^GOTO(?![a-zA-Z_-/.])/ig, TokenKind.GoTo],
  [true, /^IF(?![a-zA-Z_-/.])/ig, TokenKind.If],
  [true, /^THEN(?![a-zA-Z_-/.])/ig, TokenKind.Then],
  [true, /^ELSE(?![a-zA-Z_-/.])/ig, TokenKind.Else],
  [true, /^INPUT(?![a-zA-Z_-/.])/ig, TokenKind.Input],
  [true, /^INTERVAL(?![a-zA-Z_-/.])/ig, TokenKind.Interval],
  [true, /^ON(?![a-zA-Z_-/.])/ig, TokenKind.On],
  [true, /^OFF(?![a-zA-Z_-/.])/ig, TokenKind.Off],
  [true, /^STOP(?![a-zA-Z_-/.])/ig, TokenKind.Stop],
  [true, /^LEN(?![a-zA-Z_-/.])/ig, TokenKind.Len],
  [true, /^LET(?![a-zA-Z_-/.])/ig, TokenKind.Let],
  [true, /^LIST(?![a-zA-Z_-/.])/ig, TokenKind.List],
  [true, /^LOAD(?![a-zA-Z_-/.])/ig, TokenKind.Load],
  [true, /^USING(?![a-zA-Z_-/.])/ig, TokenKind.Using],
  [true, /^MERGE(?![a-zA-Z_-/.])/ig, TokenKind.Merge],
  [true, /^NEW(?![a-zA-Z_-/.])/ig, TokenKind.New],
  [true, /^NEXT(?![a-zA-Z_-/.])/ig, TokenKind.Next],
  [true, /^KEY(?![a-zA-Z_-/.])/ig, TokenKind.Key],
  [true, /^STRING(?![a-zA-Z_-/.])/ig, TokenKind.String],
  [true, /^OPEN(?![a-zA-Z_-/.])/ig, TokenKind.Open],
  [true, /^PEEK(?![a-zA-Z_-/.])/ig, TokenKind.Peek],
  [true, /^POKE(?![a-zA-Z_-/.])/ig, TokenKind.Poke],
  [true, /^PRINT(?![a-zA-Z_-/.])/ig, TokenKind.Print],
  [true, /^PUT(?![a-zA-Z_-/.])/ig, TokenKind.Put],
  [true, /^READ(?![a-zA-Z_-/.])/ig, TokenKind.Read],
  [true, /^RENUM(?![a-zA-Z_-/.])/ig, TokenKind.Renum],
  [true, /^RESTORE(?![a-zA-Z_-/.])/ig, TokenKind.Restore],
  [true, /^RESUME(?![a-zA-Z_-/.])/ig, TokenKind.Resume],
  [true, /^RETURN(?![a-zA-Z_-/.])/ig, TokenKind.Return],
  [true, /^RUN(?![a-zA-Z_-/.])/ig, TokenKind.Run],
  [true, /^SAVE(?![a-zA-Z_-/.])/ig, TokenKind.Save],
  [true, /^SET(?![a-zA-Z_-/.])/ig, TokenKind.Set],
  [true, /^SCREEN(?![a-zA-Z_-/.])/ig, TokenKind.Screen],
  [true, /^PROMPT(?![a-zA-Z_-/.])/ig, TokenKind.Prompt],
  [true, /^USR(?![a-zA-Z_-/.])/ig, TokenKind.Usr],
  [true, /^WAIT(?![a-zA-Z_-/.])/ig, TokenKind.Wait],
  [true, /^CD(?![a-zA-Z_-/.])/ig, TokenKind.Cd],
  [true, /^MKDIR(?![a-zA-Z_-/.])/ig, TokenKind.MkDir],
  [true, /^RMDIR(?![a-zA-Z_-/.])/ig, TokenKind.RmDir],
  [true, /^RM(?![a-zA-Z_-/.])/ig, TokenKind.Rm],
  [true, /^CP(?![a-zA-Z_-/.])/ig, TokenKind.Cp],
  [true, /^TOUCH(?![a-zA-Z_-/.])/ig, TokenKind.Touch],
  [true, /^MV(?![a-zA-Z_-/.])/ig, TokenKind.Mv],
  [true, /^SPAWN(?![a-zA-Z_-/.])/ig, TokenKind.Spawn],
  [true, /^JOB(?![a-zA-Z_-/.])/ig, TokenKind.Job],
  [true, /^KILL(?![a-zA-Z_-/.])/ig, TokenKind.Kill],
  [true, /^SYSTEM(?![a-zA-Z_-/.])/ig, TokenKind.System],
  [true, /^PROCESS(?![a-zA-Z_-/.])/ig, TokenKind.Process],
  [true, /^LOG(?![a-zA-Z_-/.])/ig, TokenKind.Beep],
  [true, /^START(?![a-zA-Z_-/.])/ig, TokenKind.Start],
  [true, /^TIMEOUT(?![a-zA-Z_-/.])/ig, TokenKind.Timeout],
  [true, /^VALUE(?![a-zA-Z_-/.])/ig, TokenKind.Value],
  [true, /^VALUES(?![a-zA-Z_-/.])/ig, TokenKind.Values],
  [false, /^\s+/g, TokenKind.Whitespace]
]);
