#ifndef matbas_dist_h
#define matbas_dist_h

#define DIST                                                                   \
  "import{Injectable as it,Inject as yt,Module as "                            \
  "ss}from\"@nestjs/common\";import{NestFactory as "                           \
  "is}from\"@nestjs/core\";import*as rs from\"node:process\";import "          \
  "ns,{stdin as as,stdout as os,stderr as "                                    \
  "cs}from\"node:process\";import{inspect as bt}from\"node:util\";import Pt "  \
  "from\"ansi-colors\";import{readFile as hs,writeFile as "                    \
  "ls}from\"node:fs/promises\";import*as rt "                                  \
  "from\"node:path\";import{basename as oe}from\"node:path\";import*as nt "    \
  "from\"node:os\";import{spawnSync as us,spawn as "                           \
  "ce}from\"node:child_process\";import{trace as "                             \
  "fs}from\"@opentelemetry/api\";import*as ps "                                \
  "from\"node:readline/promises\";import*as It from\"node:assert\";import Q "  \
  "from\"strftime\";var I=function(s){return "                                 \
  "s.Access=\"EACCES\",s.AddressInUse=\"EADDRINUSE\",s.ConnectionRefused="     \
  "\"ECONNREFUSED\",s.ConnectionReset=\"ECONNRESET\",s.Exists=\"EEXIST\",s."   \
  "IsDirectory=\"EISDIR\",s.MaxFileDescriptors=\"EMFILE\",s.NoEntity="         \
  "\"ENOENT\",s.NotADirectory=\"ENOTDIR\",s.NotEmpty=\"ENOTEMPTY\",s."         \
  "DnsNotFound=\"ENOTFOUND\",s.NotPermitted=\"EPERM\",s.BrokenPipe=\"EPIPE\"," \
  "s.TimedOut=\"ETIMEDOUT\",s.Assertion=\"ERR_ASSERTION\",s}({});function "    \
  "m(s){return function(t){return t.prototype.name=s,t}}function "             \
  "ms(s,t,e,i){var "                                                           \
  "r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e)" \
  ":i,o;if(typeof Reflect==\"object\"&&typeof "                                \
  "Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var "   \
  "h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);"     \
  "return r>3&&n&&Object.defineProperty(t,e,n),n}function he(s,t){if(typeof "  \
  "Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return "         \
  "Reflect.metadata(s,t)}var w=function(s){return "                            \
  "s[s.Success=0]=\"Success\",s[s.Usage=64]=\"Usage\",s[s.DataError=65]="      \
  "\"DataError\",s[s.NoInput=66]=\"NoInput\",s[s.NoUser=67]=\"NoUser\",s[s."   \
  "NoHost=68]=\"NoHost\",s[s.Unavailable=69]=\"Unavailable\",s[s.Software=70]" \
  "=\"Software\",s[s.OsError=71]=\"OsError\",s[s.OsFile=72]=\"OsFile\",s[s."   \
  "CantCreate=73]=\"CantCreate\",s[s.IoError=74]=\"IoError\",s[s.TempFail=75]" \
  "=\"TempFail\",s[s.Protocol=76]=\"Protocol\",s[s.NoPermission=77]="          \
  "\"NoPermission\",s[s.Config=78]=\"Config\",s}({});let A=class extends "     \
  "Error{exitCode;constructor(t=0,e=\"\"){super(e),this.exitCode=t,Object."    \
  "setPrototypeOf(this,new.target.prototype)}format(t){return "                \
  "t.formatExit(this)}};A=ms([m(\"Exit\"),he(\"design:type\",Function),he("    \
  "\"design:paramtypes\",[Object,String])],A);const "                          \
  "Bt={version:\"0.0.1\"},Ot={matbas:\"0.0.1\",swc:\"1.7.26\"};class "         \
  "S{}class le extends "                                                       \
  "S{op;expr;constructor(t,e){super(),this.op=t,this.expr=e}accept(t){return " \
  "t.visitUnaryExpr(this)}}class K extends "                                   \
  "S{left;op;right;constructor(t,e,i){super(),this.left=t,this.op=e,this."     \
  "right=i}accept(t){return t.visitBinaryExpr(this)}}class ue extends "        \
  "S{left;op;right;constructor(t,e,i){super(),this.left=t,this.op=e,this."     \
  "right=i}accept(t){return t.visitLogicalExpr(this)}}class ds extends "       \
  "S{expr;constructor(t){super(),this.expr=t}accept(t){return "                \
  "t.visitGroupExpr(this)}}class gs extends "                                  \
  "S{ident;constructor(t){super(),this.ident=t}accept(t){return "              \
  "t.visitVariableExpr(this)}}class Ft extends "                               \
  "S{value;constructor(t){super(),this.value=t}accept(t){return "              \
  "t.visitIntLiteralExpr(this)}}class ws extends "                             \
  "S{value;constructor(t){super(),this.value=t}accept(t){return "              \
  "t.visitRealLiteralExpr(this)}}class fe extends "                            \
  "S{value;constructor(t){super(),this.value=t}accept(t){return "              \
  "t.visitBoolLiteralExpr(this)}}class vs extends "                            \
  "S{value;constructor(t){super(),this.value=t}accept(t){return "              \
  "t.visitStringLiteralExpr(this)}}class ys extends "                          \
  "S{value;constructor(t){super(),this.value=t}accept(t){return "              \
  "t.visitShellLiteralExpr(this)}}class bs extends "                           \
  "S{value;constructor(t){super(),this.value=t}accept(t){return "              \
  "t.visitPromptLiteralExpr(this)}}class Is extends "                          \
  "S{constructor(){super()}accept(t){return "                                  \
  "t.visitNilLiteralExpr(this)}}class "                                        \
  "d{offsetStart;offsetEnd;constructor(t=-1,e=-1){this.offsetStart=t,this."    \
  "offsetEnd=e}}class jt extends "                                             \
  "d{remark;constructor(t,e=-1,i=-1){super(e,i),this.remark=t}accept(t){"      \
  "return t.visitRemInstr(this)}}class Es extends "                            \
  "d{variable;value;constructor(t,e,i=-1,r=-1){super(i,r),this.variable=t,"    \
  "this.value=e}accept(t){return t.visitLetInstr(this)}}class xs extends "     \
  "d{variable;value;constructor(t,e,i=-1,r=-1){super(i,r),this.variable=t,"    \
  "this.value=e}accept(t){return t.visitAssignInstr(this)}}class ks extends "  \
  "d{expression;constructor(t,e=-1,i=-1){super(e,i),this.expression=t}accept(" \
  "t){return t.visitExpressionInstr(this)}}class Ss extends "                  \
  "d{expression;constructor(t,e=-1,i=-1){super(e,i),this.expression=t}accept(" \
  "t){return t.visitPrintInstr(this)}}class pe extends "                       \
  "d{expression;constructor(t,e=-1,i=-1){super(e,i),this.expression=t}accept(" \
  "t){return t.visitExitInstr(this)}}class Ls extends "                        \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitEndInstr(this)}}class Ns extends "                                   \
  "d{filename;constructor(t,e=-1,i=-1){super(e,i),this.filename=t}accept(t){"  \
  "return t.visitNewInstr(this)}}class Rs extends "                            \
  "d{params;constructor(t,e=-1,i=-1){super(e,i),this.params=t}accept(t){"      \
  "return t.visitLoadInstr(this)}}class At extends "                           \
  "d{lineStart;lineEnd;constructor(t,e,i=-1,r=-1){super(i,r),this.lineStart="  \
  "t,this.lineEnd=e}accept(t){return t.visitListInstr(this)}}class $s "        \
  "extends d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "              \
  "t.visitRenumInstr(this)}}class _s extends "                                 \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitRunInstr(this)}}class Ps extends "                                   \
  "d{filename;constructor(t,e=-1,i=-1){super(e,i),this.filename=t}accept(t){"  \
  "return t.visitSaveInstr(this)}}class Bs extends "                           \
  "d{condition;then;else_;constructor(t,e,i,r=-1,n=-1){super(r,n),this."       \
  "condition=t,this.then=e,this.else_=i}accept(t){return "                     \
  "t.visitShortIfInstr(this)}}class Os extends "                               \
  "d{condition;constructor(t,e=-1,i=-1){super(e,i),this.condition=t}accept(t)" \
  "{return t.visitIfInstr(this)}}class Fs extends "                            \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitElseInstr(this)}}class js extends "                                  \
  "d{condition;constructor(t,e=-1,i=-1){super(e,i),this.condition=t}accept(t)" \
  "{return t.visitElseIfInstr(this)}}class As extends "                        \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitEndIfInstr(this)}}class Ws extends "                                 \
  "d{variable;value;stop;step;constructor(t,e,i,r,n=-1,o=-1){super(n,o),this." \
  "variable=t,this.value=e,this.stop=i,this.step=r}accept(t){return "          \
  "t.visitForInstr(this)}}class Ts extends "                                   \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitOnwardInstr(this)}}class Ds extends "                                \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitNextInstr(this)}}class Us extends "                                  \
  "d{condition;constructor(t,e=-1,i=-1){super(e,i),this.condition=t}accept(t)" \
  "{return t.visitWhileInstr(this)}}class Js extends "                         \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitEndWhileInstr(this)}}class Gs extends "                              \
  "d{constructor(t=-1,e=-1){super(t,e)}accept(t){return "                      \
  "t.visitRepeatInstr(this)}}class zs extends "                                \
  "d{condition;constructor(t,e=-1,i=-1){super(e,i),this.condition=t}accept(t)" \
  "{return t.visitUntilInstr(this)}}class Cs extends "                         \
  "d{name;params;constructor(t,e,i=-1,r=-1){super(i,r),this.name=t,this."      \
  "params=e}accept(t){return t.visitCommandInstr(this)}}class at{}class Ms "   \
  "extends "                                                                   \
  "at{cmdNo;row;source;instructions;constructor(t,e,i,r){super(),this.cmdNo="  \
  "t,this.row=e,this.source=i,this.instructions=r}accept(t){return "           \
  "t.visitCmdTree(this)}}class Wt extends "                                    \
  "at{lineNo;row;source;instructions;constructor(t,e,i,r){super(),this."       \
  "lineNo=t,this.row=e,this.source=i,this.instructions=r}accept(t){return "    \
  "t.visitLineTree(this)}}class Hs extends "                                   \
  "at{input;constructor(t){super(),this.input=t}accept(t){return "             \
  "t.visitInputTree(this)}}class Tt extends "                                  \
  "at{filename;lines;constructor(t,e){super(),this.filename=t,this.lines=e}"   \
  "accept(t){return t.visitProgramTree(this)}}function P(s,t){let "            \
  "e=\"\";for(let i=0;i<s;i++)e+=\"  \";return "                               \
  "t.split(`\n`).map(i=>i.length?`${e}${i}`:\"\").join(`\n`)}class "           \
  "qs{format(t){return typeof t==\"string\"?this.formatString(t):typeof "      \
  "t==\"number\"?this.formatNumber(t):typeof "                                 \
  "t==\"boolean\"?this.formatBoolean(t):t instanceof S?this.formatExpr(t):t "  \
  "instanceof d?this.formatInstr(t):t instanceof "                             \
  "at?this.formatTree(t):t&&t.format?t.format(this):Array.isArray(t)?this."    \
  "formatArray(t):this.formatAny(t)}}function q(s,t={colors:!1}){let "         \
  "e;return "                                                                  \
  "s.includes(\"'\")?s.includes('\"')?e=`'${s.replace(/'/"                     \
  "g,\"\\\\'\")}'`:e=`\"${s}\"`:e=`'${s}'`,t.colors&&(e=Pt.green(e)),e}"       \
  "function me(s,t,e={colors:!1}){let i=`[\n`;for(let "                        \
  "r=0;r<s.length;r++)typeof "                                                 \
  "s[r]==\"string\"?i+=P(1,q(s[r],e)):i+=P(1,t.format(s[r])),i+=`,\n`;return " \
  "i+=\"]\",i}class Dt extends "                                               \
  "qs{constructor(){super()}formatString(t){return t}formatNumber(t){return "  \
  "String(t)}formatBoolean(t){return String(t)}formatTraceback(t){let "        \
  "e=\"\",i=t;for(i&&(e+=`Traceback:\n`);i;)e+=`  File ${q(i.filename)}, "     \
  "line ${i.lineNo}`,i=i.next;return e}formatBaseException(t){let "            \
  "e=\"\";return "                                                             \
  "t.traceback&&(e+=this.format(t.traceback),e+=`\n`),e+=`${t.constructor."    \
  "name}: ${t.message}`,e}formatBaseWarning(t){let e=\"\";return "             \
  "t.traceback?e+=`${t.traceback.filename}:${t.traceback.lineNo}`:e+=\"<"      \
  "unknown>:<?>\",e+=`: ${t.constructor.name}: "                               \
  "${t.message}`,e}formatAssertionError(t){return "                            \
  "this.formatBaseException(t)}formatTypeError(t){let e=\"\";return "          \
  "t.traceback&&(e+=this.format(t.traceback),e+=`\n`),e+=`${t.constructor."    \
  "name}: ${t.message}\n`,e+=`  Value: ${this.format(t.value)}\n`,e+=`  "      \
  "From: ${t.from}\n`,e+=`  To: ${t.to}`,e}formatZeroDivisionError(t){let "    \
  "e=\"\";return "                                                             \
  "t.traceback&&(e+=this.format(t.traceback),e+=`\n`),e+=`${t.constructor."    \
  "name}: Cannot divide `+k.format(t.a)+\" by "                                \
  "\"+k.format(t.b),e}formatOsError(t){let e=\"\";return "                     \
  "t.traceback&&(e+=this.format(t.traceback),e+=`\n`),e+=`${t.constructor."    \
  "name} ${t.code}: ${t.message}`,e}formatFileError(t){let e=\"\";return "     \
  "t.traceback&&(e+=this.format(t.traceback),e+=`\n`),e+=`${t.constructor."    \
  "name} ${t.code}: ${t.message}\n`,t.paths.length==2?(e+=`  Source File: "    \
  "${t.paths[0]}\n`,e+=`  Destination File: ${t.paths[1]}`):e+=`  Input "      \
  "File: ${t.paths[0]}`,e}formatSyntaxIssue(t,e,i){let "                       \
  "r,n=\"\";i.isLine?r=String(i.lineNo):(i.cmdNo?r=`command "                  \
  "${i.cmdNo}`:r=`<R${i.row}>`,i.lineNo&&i.lineNo>0?n=` (after line "          \
  "${i.lineNo})`:n=\" (at the beginning)\");let "                              \
  "o=`${i.filename}:${r}:${i.offsetStart}${n}: ${t}: ${e}\n`;o+=`  "           \
  "${i.source}\n`;for(let h=0;h<=i.offsetStart+1;h++)o+=\" \";return "         \
  "o+=\"^\",o}formatSyntaxError(t){return "                                    \
  "this.formatSyntaxIssue(\"error\",this.format(t.message),t)}"                \
  "formatParseError(t){return "                                                \
  "t.errors.map(e=>this.format(e)).join(`\n`)}formatSyntaxWarning(t){return "  \
  "this.formatSyntaxIssue(\"warning\",this.format(t.message),t)}"              \
  "formatParseWarning(t){return "                                              \
  "t.warnings.map(e=>this.format(e)).join(`\n`)}formatBaseFault(t){let "       \
  "e=`=== INTERNAL FAULT ===\n\n`;return e+=`--- Internal Stack Trace "        \
  "---\n`,e+=t.stack,e}formatRuntimeFault(t){let e=`=== RUNTIME FAULT "        \
  "===\n\n`;return e+=`--- Internal Stack Trace "                              \
  "---\n`,e+=t.error.stack,t.traceback&&(e+=`\n\n--- Traceback "               \
  "---\n`,e+=this.format(t.traceback)),e+=`\n\n--- Versions "                  \
  "---\n`,e+=`Matanuska BASIC: v${Ot.matbas}\n`,e+=`swc: "                     \
  "v${Ot.swc}\n`,e+=`vite: v${Ot.swc}\n`,e+=`Node.js: "                        \
  "${ns.version}\n\n`,e+=`This is a bug in Matanuska BASIC. If you copy this " \
  "entire message and post it\n`,e+=`to the issues tracker:\n\n`,e+=`    "     \
  "https://github.com/jfhbrook/matanuska/issues\n\n`,e+=`the developers will " \
  "do their best to fix it - and more importantly, they will\n`,e+=`owe you "  \
  "a beer, coffee or beverage of your choice. "                                \
  "\\u{1F37B}\n\n`,e}formatUsageFault(t){return "                              \
  "t.message}formatExit(t){return`Exit ${t.exitCode}${t.message.length?\": "   \
  "\"+t.message:\"\"}`}visitCmdTree(t){return "                                \
  "this.formatArray(t.instructions)}visitLineTree(t){let "                     \
  "e=`Line(${t.lineNo}) [\n`;const i=[];for(const r of "                       \
  "t.instructions)i.push(this.format(r));for(const r of "                      \
  "i)e+=P(1,`${r},\n`);return e+=\"]\",e}visitInputTree(t){let "               \
  "e=`Input(\n`;return "                                                       \
  "e+=P(1,this.format(t.input)),e+=`\n)`,e}visitProgramTree(t){let "           \
  "e=`Program(\n`;const i=[];for(const r of "                                  \
  "t.lines)i.push(P(1,this.format(r)));for(const r of i)e+=`${r},\n`;return "  \
  "e+=\")\",e}formatExpr(t){return t.accept(this)}formatInstr(t){return "      \
  "t.accept(this)}formatTree(t){return t.accept(this)}formatToken(t){let "     \
  "e=`Token(${t.kind}) {\n`;if(e+=`  index: ${t.index},\n`,e+=`  row: "        \
  "${t.row},\n`,e+=`  offsetStart: ${t.offsetStart},\n`,e+=`  offsetEnd: "     \
  "${t.offsetEnd},\n`,e+=`  text: ${q(t.text)},\n`,t.value){const i=typeof "   \
  "t.value==\"string\"?q(t.value):t.value;e+=`  value: ${i},\n`}return "       \
  "e+=\"}\",e}visitBinaryExpr(t){let e=`Binary(${t.op}) {\n`;return "          \
  "e+=P(1,`${this.format(t.left)},\n`),e+=P(1,`${this.format(t.right)},\n`),"  \
  "e+=\"}\",e}visitLogicalExpr(t){let e=`Logical(${t.op} {\n`;return "         \
  "e+=P(1,`${this.format(t.left)},\n`),e+=P(1,`${this.format(t.right)},\n`),"  \
  "e+=\"}\",e}visitUnaryExpr(t){let e=`Unary(${t.op}) {\n`;return "            \
  "e+=P(1,`${this.format(t.expr)},\n`),e+=\"}\",e}visitGroupExpr(t){return`($" \
  "{this.format(t.expr)})`}visitVariableExpr(t){return "                       \
  "t.ident.text}visitIntLiteralExpr(t){return "                                \
  "String(t.value)}visitRealLiteralExpr(t){return "                            \
  "String(t.value)}visitBoolLiteralExpr(t){return "                            \
  "String(t.value)}visitStringLiteralExpr(t){return "                          \
  "q(t.value)}visitShellLiteralExpr(t){return "                                \
  "t.value}visitPromptLiteralExpr(t){return "                                  \
  "q(t.value)}visitNilLiteralExpr(t){return\"nil\"}visitExpressionInstr(t){"   \
  "return`Expression(${this.format(t.expression)})`}visitPrintInstr(t){"       \
  "return`Print(${this.format(t.expression)})`}visitRemInstr(t){return`Rem(${" \
  "t.remark})`}visitNewInstr(t){return`New(${this.format(t.filename)})`}"      \
  "visitLoadInstr(t){return`Load "                                             \
  "(${this.formatArgv(t.params)})`}visitListInstr(t){let e=\"List(\";return "  \
  "t.lineStart&&(e+=t.lineStart),t.lineEnd&&(e+=`, "                           \
  "${t.lineEnd}`),e+=\")\",e}visitRenumInstr(t){return\"Renum\"}"              \
  "visitSaveInstr(t){return`New(${this.format(t.filename)})`}visitRunInstr(t)" \
  "{return\"Run\"}visitEndInstr(t){return\"End\"}visitExitInstr(t){return`"    \
  "Exit(${this.format(t.expression)})`}visitLetInstr(t){return`Let(${this."    \
  "format(t.variable)}, "                                                      \
  "${this.format(t.value)})`}visitAssignInstr(t){return`Assign(${this.format(" \
  "t.variable)}, ${this.format(t.value)})`}visitShortIfInstr(t){let "          \
  "e=`ShortIf (${this.format(t.condition)}) { `;return "                       \
  "e+=t.then.map(i=>this.format(i)).join(\" : \")+\" "                         \
  "}\",t.else_.length&&(e+=\" { \"+t.else_.map(i=>this.format(i)).join(\" : "  \
  "\")+\" }\"),e}visitIfInstr(t){return`If "                                   \
  "(${this.format(t.condition)})`}visitElseInstr(t){return\"Else\"}"           \
  "visitElseIfInstr(t){return`ElseIf "                                         \
  "(${this.format(t.condition)})`}visitEndIfInstr(t){return\"EndIf\"}"         \
  "visitForInstr(t){return`For(${this.format(t.variable)}, "                   \
  "${this.format(t.value)})`}visitOnwardInstr(t){return\"Onward\"}"            \
  "visitNextInstr(t){return\"Next\"}visitWhileInstr(t){return`While "          \
  "(${this.format(t.condition)})`}visitEndWhileInstr(t){return\"EndWhile\"}"   \
  "visitRepeatInstr(t){return\"Repeat\"}visitUntilInstr(t){return`Until "      \
  "(${this.format(t.condition)})`}formatArgv(t,e=!1){return t.map(i=>e&&i "    \
  "instanceof Ft?\"0\"+i.value.toString(8):this.format(i)).join(\" "           \
  "\")}visitCommandInstr(t){return`Command (${this.format(t.name)}, "          \
  "${this.formatArgv(t.params)})`}formatStack(t){let e=\"{ \";for(const i of " \
  "t.stack)e+=this.format(i),e+=\", \";return e+\"}\"}formatArray(t){return "  \
  "me(t,this)}formatAny(t){return bt(t)}}const k=new Dt;class Vs extends "     \
  "Dt{colors=!0;formatString(t){return q(t,this)}formatNumber(t){return "      \
  "bt(t,this)}formatBoolean(t){return bt(t,this)}formatTraceback(t){return "   \
  "k.format(t)}inspectException(t){return k.format(t)}inspectFault(t){return " \
  "k.format(t)}formatBaseException(t){return "                                 \
  "this.inspectException(t)}formatBaseWarning(t){return "                      \
  "this.inspectException(t)}formatOsError(t){return "                          \
  "this.inspectException(t)}formatFileError(t){return "                        \
  "this.inspectException(t)}formatSyntaxError(t){return "                      \
  "this.inspectException(t)}formatParseError(t){return "                       \
  "this.inspectException(t)}formatSyntaxWarning(t){return "                    \
  "this.inspectException(t)}formatParseWarning(t){return "                     \
  "this.inspectException(t)}formatBaseFault(t){return "                        \
  "this.inspectFault(t)}formatRuntimeFault(t){return "                         \
  "this.inspectFault(t)}formatUsageFault(t){return "                           \
  "this.inspectFault(t)}formatExit(t){let e=String(t.exitCode);return "        \
  "t.exitCode?e=Pt.red(e):e=Pt.green(e),`Exit ${e}${t.message.length?\": "     \
  "\"+t.message:\"\"}`}formatArray(t){return "                                 \
  "me(t,this,this)}formatAny(t){return bt(t,this)}}const Zs=new Vs;function "  \
  "y(s,t,e,i){var "                                                            \
  "r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e)" \
  ":i,o;if(typeof Reflect==\"object\"&&typeof "                                \
  "Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var "   \
  "h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);"     \
  "return r>3&&n&&Object.defineProperty(t,e,n),n}function E(s,t){if(typeof "   \
  "Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return "         \
  "Reflect.metadata(s,t)}class W extends "                                     \
  "Error{message;traceback;constructor(t,e=null){const i=typeof "              \
  "t==\"string\"?t:k.format(t);super(i),this.message=t,this.traceback=e,"      \
  "Object.setPrototypeOf(this,new.target.prototype)}format(t){return "         \
  "t.formatBaseException(this)}}W=y([m(\"BaseException\"),E(\"design:type\","  \
  "Function),E(\"design:paramtypes\",[Object,Object])],W);class B extends "    \
  "W{}B=y([m(\"Exception\")],B);class de extends B{format(t){return "          \
  "t.formatAssertionError(this)}}de=y([m(\"AssertionError\")],de);class $ "    \
  "extends B{}$=y([m(\"RuntimeError\")],$);class T extends "                   \
  "${message;value;traceback;from;to;constructor(t,e,i,r,n=null){super(t,n),"  \
  "this.message=t,this.value=e,this.traceback=n,this.from=i,this.to=r}format(" \
  "t){return "                                                                 \
  "t.formatTypeError(this)}}T=y([m(\"TypeError\"),E(\"design:type\",Function)" \
  ",E(\"design:paramtypes\",[Object,typeof "                                   \
  "Value>\"u\"?Object:Value,String,String,Object])],T);class Et extends "      \
  "${}Et=y([m(\"ValueError\")],Et);class ot extends "                          \
  "${}ot=y([m(\"NameError\")],ot);class V extends "                            \
  "${}V=y([m(\"ParamError\")],V);class Ut extends "                            \
  "${}Ut=y([m(\"ArithmeticError\")],Ut);class Jt extends "                     \
  "Ut{a;typeA;b;typeB;traceback;constructor(t,e,i,r,n=null){super(\"Cannot "   \
  "divide by "                                                                 \
  "zero\",n),this.a=t,this.typeA=e,this.b=i,this.typeB=r,this.traceback=n,"    \
  "Object.setPrototypeOf(this,new.target.prototype)}format(t){return "         \
  "t.formatZeroDivisionError(this)}}Jt=y([m(\"ZeroDivisionError\"),E("         \
  "\"design:type\",Function),E(\"design:paramtypes\",[typeof "                 \
  "Value>\"u\"?Object:Value,String,typeof "                                    \
  "Value>\"u\"?Object:Value,String,Object])],Jt);class Gt extends "            \
  "${}Gt=y([m(\"NotImplementedError\")],Gt);class xt extends "                 \
  "W{format(t){return "                                                        \
  "t.formatBaseWarning(this)}}xt=y([m(\"BaseWarning\")],xt);class zt extends " \
  "xt{}zt=y([m(\"Warning\")],zt);class ge extends "                            \
  "zt{}ge=y([m(\"DeprecationWarning\")],ge);class Ct extends "                 \
  "B{message;code;traceback;exitCode;constructor(t,e,i,r){if(super(t,r),this." \
  "message=t,this.code=e,this.traceback=r,Object.setPrototypeOf(this,new."     \
  "target.prototype),i)this.exitCode=i;else switch(e){case "                   \
  "I.Access:this.exitCode=w.OsError;break;case "                               \
  "I.AddressInUse:this.exitCode=w.Protocol;break;case "                        \
  "I.ConnectionRefused:case "                                                  \
  "I.ConnectionReset:this.exitCode=w.Unavailable;break;case "                  \
  "I.Exists:this.exitCode=w.CantCreate;break;case "                            \
  "I.IsDirectory:this.exitCode=w.IoError;break;case "                          \
  "I.MaxFileDescriptors:this.exitCode=w.OsError;break;case "                   \
  "I.NoEntity:this.exitCode=w.NoInput;break;case "                             \
  "I.NotADirectory:this.exitCode=w.NoInput;break;case "                        \
  "I.NotEmpty:this.exitCode=w.OsError;break;case "                             \
  "I.DnsNotFound:this.exitCode=w.NoHost;break;case "                           \
  "I.NotPermitted:this.exitCode=w.NoPermission;break;case "                    \
  "I.BrokenPipe:this.exitCode=w.OsError;break;case "                           \
  "I.TimedOut:this.exitCode=w.Unavailable;break;default:this.exitCode=w."      \
  "OsError}}format(t){return "                                                 \
  "t.formatOsError(this)}}Ct=y([m(\"OsError\"),E(\"design:type\",Function),E(" \
  "\"design:paramtypes\",[Object,Object,Object,Object])],Ct);function "        \
  "Mt(s){const t=s.message.split(\": \");return "                              \
  "t.length===2?t[1]:s.message}class J extends "                               \
  "Ct{message;code;paths;traceback;constructor(t,e,i,r,n){super(t,e,i,n),"     \
  "this.message=t,this.code=e,this.paths=r,this.traceback=n,Object."           \
  "setPrototypeOf(this,new.target.prototype)}static "                          \
  "fromError(t,e,i=null){const r=t||Mt(e);return new "                         \
  "J(r,e.code||\"<unknown>\",null,[e.path||\"<unknown>\"],i)}static "          \
  "fromReadError(t,e,i=null){const r=t||Mt(e),n=e.code;let o=null;return "     \
  "n==I.Access&&(o=w.NoInput),new "                                            \
  "J(r,n||\"<unknown>\",o,[e.path||\"<unknown>\"],i)}static "                  \
  "fromWriteError(t,e,i=null){const r=t||Mt(e),n=e.code;let o=null;return "    \
  "n==I.Access&&(o=w.CantCreate),new "                                         \
  "J(r,n||\"<unknown>\",o,[e.path||\"<unknown>\"],i)}format(t){return "        \
  "t.formatFileError(this)}}J=y([m(\"FileError\"),E(\"design:type\",Function)" \
  ",E(\"design:paramtypes\",[Object,Object,Object,typeof "                     \
  "FileErrorPaths>\"u\"?Object:FileErrorPaths,Object])],J);function "          \
  "we(s){return function(e,i){for(const r of s){const "                        \
  "n=e[r]===null?-1:e[r],o=i[r]===null?-1:i[r],h=n-o;if(h)return h}return "    \
  "0}}class ct extends "                                                       \
  "W{filename;row;isLine;lineNo;cmdNo;offsetStart;offsetEnd;source;"           \
  "constructor(t,e){super(t,null),Object.setPrototypeOf(this,new.target."      \
  "prototype),Object.assign(this,e)}format(t){return "                         \
  "t.formatSyntaxError(this)}}ct=y([m(\"SyntaxError\"),E(\"design:type\","     \
  "Function),E(\"design:paramtypes\",[Object,typeof "                          \
  "SourceLocation>\"u\"?Object:SourceLocation])],ct);class L extends "         \
  "B{errors;exitCode=w.Software;constructor(t){super(\"\",null),this.errors="  \
  "t,Object.setPrototypeOf(this,new.target.prototype)}sort(t){this.errors."    \
  "sort(we(t))}format(t){return t.formatParseError(this)}}class kt extends "   \
  "xt{filename;row;isLine;lineNo;cmdNo;offsetStart;offsetEnd;source;"          \
  "constructor(t,e){super(t,null),Object.setPrototypeOf(this,new.target."      \
  "prototype),Object.assign(this,e)}format(t){return "                         \
  "t.formatSyntaxWarning(this)}}kt=y([m(\"SyntaxWarning\"),E(\"design:type\"," \
  "Function),E(\"design:paramtypes\",[Object,typeof "                          \
  "SourceLocation>\"u\"?Object:SourceLocation])],kt);class D extends "         \
  "B{warnings;constructor(t){super(\"\",null),this.warnings=t,Object."         \
  "setPrototypeOf(this,new.target.prototype)}sort(t){this.warnings.sort(we(t)" \
  ")}format(t){return "                                                        \
  "t.formatParseWarning(this)}}D=y([m(\"ParseWarning\"),E(\"design:type\","    \
  "Function),E(\"design:paramtypes\",[typeof "                                 \
  "Array>\"u\"?Object:Array])],D);function ve(s,t,e){let i=0,r=0;const "       \
  "n=[];for(;;){if(i>=s.length)return "                                        \
  "n.concat(t.slice(r));if(r>=t.length)return n.concat(s.slice(i));for(const " \
  "o of e){const h=typeof s[i][o]==\"number\"?s[i][o]:-1,f=typeof "            \
  "t[r][o]==\"number\"?t[r][o]:-1;if(h<f){n.push(s[i++]);break}if(h>f){n."     \
  "push(t[r++]);break}}}}function "                                            \
  "tt(s,t=[\"lineNo\",\"row\",\"offsetStart\"]){let e=!1,i=!1,r=[];for(const " \
  "n of s)n instanceof L?(e=!0,r=ve(r,n.errors,t)):n instanceof "              \
  "D&&(i=!0,r=ve(r,n.warnings,t));return e?new L(r):i?new D(r):null}function " \
  "Ys(s,t){const e={},i={};function r(n){for(const o of "                      \
  "n)i[o[t]]||(i[o[t]]=[]),o instanceof L&&(e[o[t]]=!0),i[o[t]].push(o)}if(s " \
  "instanceof L)r(s.errors);else if(s instanceof D)r(s.warnings);else "        \
  "if(s===null)return{};return "                                               \
  "Object.fromEntries(Object.entries(i).map(([n,o])=>{let h;return "           \
  "e[n]?h=new L(o):h=new D(o),[n,h]}))}function Xs(s,t,e){let "                \
  "i=[];if(s===null)return null;s instanceof L?i=s.errors:i=s.warnings;let "   \
  "r=!1;return i=i.filter(n=>n[t]===e?!1:(n instanceof ct&&(r=!0),!0)),r?new " \
  "L(i):new D(i)}function ye(s,t){s&&s.sort(t)}function ht(s,t,e,i){var "      \
  "r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e)" \
  ":i,o;if(typeof Reflect==\"object\"&&typeof "                                \
  "Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var "   \
  "h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);"     \
  "return r>3&&n&&Object.defineProperty(t,e,n),n}function G(s,t){if(typeof "   \
  "Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return "         \
  "Reflect.metadata(s,t)}class lt extends "                                    \
  "Error{traceback;constructor(t,e=null){super(k.format(t)),this.traceback=e," \
  "Object.setPrototypeOf(this,new.target.prototype)}format(t){return "         \
  "t.formatBaseFault(this)}}lt=ht([m(\"BaseFault\"),G(\"design:type\","        \
  "Function),G(\"design:paramtypes\",[Object,Object])],lt);class St extends "  \
  "lt{}St=ht([m(\"Fault\")],St);class b extends "                              \
  "St{error;exitCode=w.Software;constructor(t,e,i=null){super(t,i),this."      \
  "error=e,Object.setPrototypeOf(this,new.target.prototype)}static "           \
  "fromError(t,e=null){let i=\"Unspecified error\";if(typeof "                 \
  "t.message>\"u\")if(t.format)try{i=k.format(t)}catch(r){i=String(r)}else "   \
  "i=String(t);else if(typeof t.message==\"string\")i=t.message;else "         \
  "if(t.format)try{i=k.format(t.message)}catch(r){i=String(r.message)}else "   \
  "i=String(t.message);return t instanceof Error||(t=new Error(i)),new "       \
  "b(i,t,e)}static fromException(t){return new b(t.message,new "               \
  "Error(`Uncaught ${t.constructor.name}: "                                    \
  "${t.message}`),t.traceback)}format(t){return "                              \
  "t.formatRuntimeFault(this)}}b=ht([m(\"RuntimeFault\"),G(\"design:type\","   \
  "Function),G(\"design:paramtypes\",[Object,typeof "                          \
  "Error>\"u\"?Object:Error,Object])],b);class be extends "                    \
  "b{constructor(t,e=null){super(t,new "                                       \
  "Error,e),Object.setPrototypeOf(this,new.target.prototype),this.error=this}" \
  "}be=ht([m(\"NotImplementedFault\"),G(\"design:type\",Function),G(\"design:" \
  "paramtypes\",[Object,Object])],be);class Lt extends "                       \
  "St{exitCode=w.Usage;constructor(t){super(t,null),Object.setPrototypeOf("    \
  "this,new.target.prototype)}format(t){return "                               \
  "t.formatUsageFault(this)}}Lt=ht([m(\"UsageFault\"),G(\"design:type\","      \
  "Function),G(\"design:paramtypes\",[String])],Lt);function Ht(s,t,e){const " \
  "i=e.value,r=function(...o){try{return i.apply(this,o)}catch(h){throw h "    \
  "instanceof B||h instanceof lt?h:b.fromError(h,null)}};e.value=r}var "       \
  "c=function(s){return "                                                      \
  "s.Integer=\"integer\",s.Real=\"real\",s.Boolean=\"boolean\",s.String="      \
  "\"string\",s.Exception=\"Exception\",s.Nil=\"nil\",s.Undef=\"undef\",s."    \
  "Any=\"any\",s.Unknown=\"unknown\",s.Invalid=\"invalid\",s}({});fs."         \
  "getTracer(\"main\");class Ie{format(t){return\"nil\"}}class "               \
  "qt{format(t){return\"nil\"}}const z=new Ie,Ee=new qt;function U(s){const "  \
  "t=typeof s;return "                                                         \
  "t===\"boolean\"?c.Boolean:t===\"number\"?Number.isInteger(s)?c.Integer:c."  \
  "Real:t===\"string\"?c.String:s instanceof Ie?c.Nil:s instanceof "           \
  "qt?c.Undef:s instanceof W?c.Exception:c.Unknown}function "                  \
  "ut(s,t=c.Any){switch(t===c.Any&&(t=U(s)),t){case c.Nil:case "               \
  "c.Undef:return!0;default:return!1}}function Vt(s){return "                  \
  "ut(s)?\"nil\":k.format(s)}function Qs(s){const "                            \
  "t={...rs.env};for(const[e,i]of Object.entries(s))ut(i)?t[e]=void "          \
  "0:t[e]=Vt(i);return t}function Ks(s,t){const "                              \
  "e=[s.io[0].nodeStdIO(),s.io[1].nodeStdIO(),s.io[2].nodeStdIO()];return[Vt(" \
  "s.command),s.args.map(i=>Vt(i)),{cwd:this.host.cwd,env:Qs(s.env),stdio:e,"  \
  "detached:t}]}function ti(s,t,e,i){var "                                     \
  "r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e)" \
  ":i,o;if(typeof Reflect==\"object\"&&typeof "                                \
  "Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var "   \
  "h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);"     \
  "return r>3&&n&&Object.defineProperty(t,e,n),n}function xe(s,t){if(typeof "  \
  "Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return "         \
  "Reflect.metadata(s,t)}var Z=function(s){return "                            \
  "s[s.Debug=0]=\"Debug\",s[s.Info=1]=\"Info\",s[s.Warn=2]=\"Warn\",s[s."      \
  "Error=3]=\"Error\",s}({});class Zt{formatter=new "                          \
  "Dt;inputStream;outputStream;errorStream;level=1;_tty=void "                 \
  "0;cwd=process.cwd();constructor(){this.inputStream=as,this.outputStream="   \
  "os,this.errorStream=cs}setLevel(t){this.level=t}writeOut(t){this."          \
  "outputStream.write(this.formatter.format(t))}writeError(t){this."           \
  "errorStream.write(this.formatter.format(t))}writeLine(t){this."             \
  "outputStream.write(`${this.formatter.format(t)}\n`)}writeErrorLine(t){"     \
  "this.errorStream.write(`${this.formatter.format(t)}\n`)}writeDebug(t){"     \
  "this.level<=0&&this.errorStream.write(`DEBUG: "                             \
  "${this.formatter.format(t)}\n`)}writeInfo(t){this.level<=1&&this."          \
  "errorStream.write(`INFO: "                                                  \
  "${this.formatter.format(t)}\n`)}writeWarn(t){this.level<=2&&this."          \
  "errorStream.write(`WARN: "                                                  \
  "${this.formatter.format(t)}\n`)}writeException(t){let e=t;(typeof "         \
  "t==\"string\"||typeof t==\"number\"||typeof t==\"boolean\")&&(e=new "       \
  "W(String(t),null)),this.errorStream.write(`${this.formatter.format(e)}\n`)" \
  "}writeChannel(t,e){switch(t){case 1:this.writeOut(e);break;case "           \
  "2:this.writeError(e);break;case 3:this.writeWarn(e);break;case "            \
  "4:this.writeInfo(e);break;case 5:this.writeDebug(e);break;default:throw "   \
  "new J(`Unknown channel: "                                                   \
  "${t}`,I.NoEntity,w.IoError,[`#${t}`],null)}}exit(t){throw new "             \
  "A(t)}hostname(){return nt.hostname()}tty(){if(typeof "                      \
  "this._tty>\"u\")try{const{stdout:t}=us(\"tty\");this._tty=t.toString()."    \
  "trim()}catch{this._tty=null}return this._tty}shell(){return "               \
  "process.env.__MATBAS_DOLLAR_ZERO?process.env.__MATBAS_DOLLAR_ZERO:rt."      \
  "basename(process.argv[1])}now(){return new Date}uid(){return "              \
  "nt.userInfo().uid}gid(){return nt.userInfo().gid}username(){return "        \
  "nt.userInfo().username}homedir(){return "                                   \
  "nt.homedir()}cd(t){if(t===\"\"){this.cwd=this.homedir();return}this.cwd="   \
  "this.resolvePath(t)}pwd(t){return this.cwd}resolvePath(t){return "          \
  "t=t.replace(/^~\\//,this.homedir()+\"/\"),t.startsWith(\"/"                 \
  "\")||t.startsWith(\"\\\\\")?t:rt.resolve(rt.join(this.cwd,t))}"             \
  "relativePath(t,e){return "                                                  \
  "rt.relative(this.resolvePath(t),this.resolvePath(e))}async "                \
  "readFile(t){try{return await "                                              \
  "hs(this.resolvePath(t),\"utf8\")}catch(e){throw "                           \
  "J.fromReadError(null,e)}}async writeFile(t,e){try{await "                   \
  "ls(this.resolvePath(t),e,\"utf8\")}catch(i){throw "                         \
  "J.fromWriteError(null,i)}}spawn(t,e){return "                               \
  "ce.apply(ce,Ks(t,e))}}Zt=ti([it(),xe(\"design:type\",Function),xe("         \
  "\"design:paramtypes\",[])],Zt);function ei(s,t,e,i){var "                   \
  "r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e)" \
  ":i,o;if(typeof Reflect==\"object\"&&typeof "                                \
  "Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var "   \
  "h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);"     \
  "return r>3&&n&&Object.defineProperty(t,e,n),n}function ke(s,t){if(typeof "  \
  "Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return "         \
  "Reflect.metadata(s,t)}let si=\"\";const Se=`Usage: matbas [options] [ "     \
  "script.bas ] [arguments]\n\nOptions:\n  -h, --help                  print " \
  "matbas command line options\n  -c, --command <command>     evaluate "       \
  "command\n  -e, --eval <script>         evaluate script\n  -v, --version   " \
  "            print matbas version\n  --log-level <level>         set log "   \
  "level (debug, info, warn, error)\n  --history-size <size>       set the "   \
  "in-memory history size. defaults to 500.\n                              "   \
  "set to -1 for an unlimited history size\n  --history-file-size <size>  "    \
  "set the size of the history file. defaults to\n                           " \
  "   history size.\n  \nEnvironment variables:\nMATBAS_LOG_LEVEL      set "   \
  "log level (debug, info, warn, error)\nHISTSIZE              set the "       \
  "in-memory history size. defaults to 500. set to\n                      -1 " \
  "for an unlimited history size.\nHISTFILESIZE          set the maximum "     \
  "size of the history file. defaults to\n                      history "      \
  "size.${si}\n`;function ii(){return new A(w.Success,Se)}function "           \
  "ri(){return new A(w.Success,`v${Bt.version}`)}function C(s){return new "    \
  "Lt(`${s}\n${Se}`)}const "                                                   \
  "ni={debug:Z.Debug,info:Z.Info,warn:Z.Warn,error:Z.Error};function "         \
  "Le(s){const t=ni[s];if(typeof t>\"u\")throw C(`Invalid log level: ${s} "    \
  "(must be one of: debug, info, warn, error)`);return t}function Nt(s){let "  \
  "t=parseInt(s);if(Number.isNaN(t))throw C(\"Invalid size (must be an "       \
  "integer)\");return t<1&&(t=Number.MAX_SAFE_INTEGER),t}class "               \
  "O{command;script;level;historySize;historyFileSize;argv;env;eval;"          \
  "constructor(t,e,i,r,n,o,h,f){this.command=t,this.script=i,this.level=r,"    \
  "this.historySize=n,this.historyFileSize=o,this.argv=h,this.env=f,this."     \
  "eval=e}static load(t,e){let "                                               \
  "i=null,r=null,n=null,o=Z.Info,h=500,f=500;const "                           \
  "g=[process.env.__MATBAS_DOLLAR_ZERO||\"matbas\"];e.MATBAS_LOG_LEVEL&&(o="   \
  "Le(e.MATBAS_LOG_LEVEL)),e.HISTSIZE&&(h=Nt(e.HISTSIZE)),e.HISTFILESIZE&&(f=" \
  "Nt(e.HISTFILESIZE));const "                                                 \
  "p=Array.from(t);for(;p.length;)switch(p[0]){case\"-h\":case\"--help\":"     \
  "throw ii();case\"-c\":case\"--command\":if(p.shift(),!p.length)throw "      \
  "C(\"no command "                                                            \
  "provided\");i=p.shift();break;case\"-e\":case\"--eval\":if(p.shift(),!p."   \
  "length)throw C(\"No source to eval "                                        \
  "provided\");r=p.shift();break;case\"--log-level\":if(p.shift(),!p.length)"  \
  "throw C(\"No log level "                                                    \
  "provided\");o=Le(p.shift());break;case\"--history-size\":if(p.shift(),!p."  \
  "length)throw C(\"No history size "                                          \
  "provided\");h=Nt(p.shift());break;case\"--history-file-size\":if(p.shift()" \
  ",!p.length)throw C(\"No history file size "                                 \
  "provided\");f=Nt(p.shift());break;case\"-v\":case\"--version\":throw "      \
  "ri();default:if(!n&&!p[0].startsWith(\"-\")){const "                        \
  "R=p.shift();n=R,g.push(R);break}if(n||i||r){g.push(p.shift());break}throw " \
  "C(`Invalid option: ${p.shift()}`)}return new "                              \
  "O(i,r,n,o,h,Math.min(h,f),g,e)}toString(){return "                          \
  "JSON.stringify({command:this.command,eval:this.eval,script:this.script,"    \
  "logLevel:this.level,historySize:this.historySize,historyFileSize:this."     \
  "historyFileSize,argv:this.argv},null,2)}}O=ei([it(),ke(\"design:type\","    \
  "Function),ke(\"design:paramtypes\",[Object,Object,Object,typeof "           \
  "Z>\"u\"?Object:Z,Number,Number,typeof Argv>\"u\"?Object:Argv,typeof "       \
  "Env>\"u\"?Object:Env])],O);class "                                          \
  "ai{name;executor;host;_editor;constructor(t,e,i,r){this.name=t,this."       \
  "executor=e,this.host=i,this._editor=r||null}interactive(){if(!this._"       \
  "editor)throw new $(`Command ${this.name} must be run in an interactive "    \
  "context`)}get editor(){return this.interactive(),this._editor}get "         \
  "program(){return this.editor.program}}const oi={async "                     \
  "main(s,t){const{executor:e,editor:i}=s;let[r]=t;if(!r)r=\"untitled.bas\";"  \
  "else if(typeof r!=\"string\")throw new Et(`Invalid filename; "              \
  "${k.format(r)}`);e.defer(async()=>{e.runtime.reset()}),i.reset(),i."        \
  "filename=r}};class "                                                        \
  "Ne{name;aliases;constructor(t,e){this.name=t,this.aliases=e||[]}}class Rt " \
  "extends Ne{constructor(t){super(t)}}class Re extends Rt{}let $e=class "     \
  "extends Rt{};class ft extends Ne{}class "                                   \
  "Yt{args;argv;opts;aliases;constructor(t){this.args=[],this.argv=[],this."   \
  "opts={},this.aliases={};for(const e of t){e instanceof "                    \
  "$e?this.argv.push(e.name):e instanceof "                                    \
  "Rt?this.args.push(e):this.opts[e.name]=e;for(const i of "                   \
  "e.aliases)this.aliases[i]=e.name}}parse(t){const e=[],i={};for(const u of " \
  "this.argv)i[u]=[];for(const u of this.args)i[u.name]=z;for(const u of "     \
  "Object.keys(this.opts))i[u]=z;let r=0;const "                               \
  "n=(u=1)=>{r+=u},o=u=>(u=this.aliases[u]?this.aliases[u]:u,this.opts[u]||"   \
  "null),h=(u=1)=>t[r+u],f=(u,F=!0)=>{const j=o(u);if(j){if(j instanceof "     \
  "ft){i[j.name]=F,n();return}i[j.name]=h(),n(2);return}throw new V(`Unknown " \
  "flag or option --${u}`)},g=u=>{try{f(u,!0)}catch(F){if(!(F instanceof "     \
  "V))throw F;f(u.slice(3),!1)}},p=u=>{let F=1;for(let "                       \
  "j=0;j<u.length;j++){const ae=u[j],vt=o(ae);if(vt){if(vt instanceof "        \
  "ft){i[vt.name]=!0;continue}if(j!==u.length-1)throw new V(`Option flag "     \
  "-${ae} must be followed by a "                                              \
  "value`);i[vt.name]=h(),F=2}}n(F)},R=()=>{e.push(h(0)),n()};for(;r<t."       \
  "length;){const u=t[r];if(typeof "                                           \
  "u==\"string\"){if(u.match(/^--no-/)){g(u.slice(2));continue}if(u.match(/"   \
  "^--/)){f(u.slice(2),!0);continue}if(u.match(/^-/"                           \
  ")){p(u.slice(1));continue}}R()}let x=0;for(const u of "                     \
  "this.args){if(x>=e.length){if(u instanceof "                                \
  "Re){i[u.name]=z,x++;continue}throw new V(`Expected argument "               \
  "${u.name}`)}if(u instanceof "                                               \
  "$e){i[u.name]=e.slice(x),x=e.length;continue}i[u.name]=e[x],x++}if(x<e."    \
  "length)throw new V(`Unexpected argument ${e[x]}`);return i}}const "         \
  "ci={params:new Yt([new Rt(\"filename\"),new ft(\"run\")]),async "           \
  "main(s,t){const{executor:e,editor:i,host:r}=s,{filename:n,run:o}=this."     \
  "params.parse(t);if(typeof n!=\"string\")throw new Et(`Invalid filename; "   \
  "${k.format(n)}`);await e.load(n),o?await "                                  \
  "e.run():i.warning&&r.writeWarn(i.warning)}},hi={async "                     \
  "main(s,t){const{host:e,editor:i}=s,[r,n]=t,o=ut(r)?null:r,h=ut(n)?null:n;"  \
  "i.warning&&e.writeWarn(this.editor.warning),e.writeLine(`${i.filename}\n${" \
  "\"-\".repeat(i.filename.length)}`);const "                                  \
  "f=i.list(o,h);e.writeLine(f)}},li={async "                                  \
  "main(s,t){s.editor.renum()}},ui={async "                                    \
  "main(s,t){filename&&(editor.filename=filename),await "                      \
  "host.writeFile(editor.filename,editor.list()+`\n`)}},fi={async "            \
  "main(s,t){s.interactive(),await s.executor.run()}},pi={params:new Yt([new " \
  "Re(\"path\")]),async "                                                      \
  "main(s,t){const{path:e}=this.params.parse(t);host.cd(e)}},mi={params:new "  \
  "Yt([new ft(\"P\"),new ft(\"L\")]),async "                                   \
  "main(s,t){const{host:e}=s,i=this.params.parse(t);let "                      \
  "r=!0;i.P&&(r=!1),e.writeLine(e.pwd(r))}},di={new:oi,load:ci,list:hi,renum:" \
  "li,save:ui,run:fi,cd:pi,pwd:mi};var a=function(s){return "                  \
  "s.LParen=\"(\",s.RParen=\")\",s.Comma=\",\",s.Semicolon=\";\",s.Colon=\":"  \
  "\",s.Dot=\".\",s.Plus=\"+\",s.Minus=\"-\",s.Star=\"*\",s.Percent=\"%\",s."  \
  "Dollar=\"$\",s.Hash=\"#\",s.Bang=\"!\",s.Slash=\"/"                         \
  "\",s.BSlash=\"\\\\\",s.Eq=\"=\",s.EqEq=\"==\",s.Gt=\">\",s.Lt=\"<\",s.Ge="  \
  "\">=\",s.Le=\"<=\",s.Ne=\"<>\",s.BangEq=\"!=\",s.And=\"and\",s.Or=\"or\","  \
  "s.Not=\"not\",s.DecimalLiteral=\"<decimal>\",s.HexLiteral=\"<hex>\",s."     \
  "OctalLiteral=\"<octal>\",s.BinaryLiteral=\"<binary>\",s.RealLiteral=\"<"    \
  "real>\",s.TrueLiteral=\"true\",s.FalseLiteral=\"false\",s.StringLiteral="   \
  "\"<string>\",s.NilLiteral=\"nil\",s.Ident=\"<ident>\",s.IntIdent=\"<ident%" \
  ">\",s.RealIdent=\"<ident!>\",s.BoolIdent=\"<ident?>\",s.StringIdent=\"<"    \
  "ident$>\",s.LongFlag=\"--<flag>\",s.ShellToken=\"<shell>\",s.New=\"new\","  \
  "s.Load=\"load\",s.Save=\"save\",s.List=\"list\",s.Renum=\"renum\",s.Run="   \
  "\"run\",s.End=\"end\",s.Exit=\"exit\",s.Let=\"let\",s.If=\"if\",s.Then="    \
  "\"then\",s.Else=\"else\",s.EndIf=\"endif\",s.For=\"for\",s.To=\"to\",s."    \
  "Step=\"step\",s.Onward=\"onward\",s.Next=\"next\",s.While=\"while\",s."     \
  "EndWhile=\"endwhile\",s.Repeat=\"repeat\",s.Until=\"until\",s.Print="       \
  "\"print\",s.Rem=\"<rem>\",s.LineEnding=\"\\\\n\",s.Whitespace=\"<"          \
  "whitespace>\",s.Eof=\"<EOF>\",s.Illegal=\"<illegal>\",s."                   \
  "UnterminatedStringLiteral=\"<unterminated-string>\",s}({});class "          \
  "gi{kind;index;row;offsetStart;offsetEnd;text;value;constructor(t){this."    \
  "kind=t.kind,this.index=t.index,this.row=t.row,this.offsetStart=t."          \
  "offsetStart,this.offsetEnd=t.offsetEnd,this.text=t.text,this.value=t."      \
  "value}format(t){return t.formatToken(this)}}class "                         \
  "N{leadingWs;lineNo;separatingWs;source;constructor(t,e,i,r){this."          \
  "leadingWs=t,this.lineNo=e,this.separatingWs=i,this.source=r}static "        \
  "empty(){return new N(\"\",\"\",\"\",\"\")}static command(t){return new "    \
  "N(\"\",\"\",\"\",t)}static unknown(){return new "                           \
  "N(\"\",\"\",\"\",\"<unknown>\")}clone(){return new "                        \
  "N(this.leadingWs,this.lineNo,this.separatingWs,this.source)}get "           \
  "prefix(){return "                                                           \
  "this.leadingWs+this.lineNo+this.separatingWs}toString(){return "            \
  "this.prefix+this.source}}class "                                            \
  "M{kind=\"<unknown>\";_compiler=null;instr=null;previous=null;parent=null;"  \
  "init(t,e,i,r){this._compiler=t,this.instr=e,this.previous=i,this.parent=r}" \
  "get compiler(){if(!this._compiler)throw b.fromError(new $(`Block "          \
  "${this.kind} not initialized`));return "                                    \
  "this._compiler}begin(t,e){e.init(this.compiler,t,null,this.compiler.block)" \
  ",this.compiler.block=e}next(t,e){e.init(this.compiler,t,this.compiler."     \
  "block,this.compiler.block.parent),this.compiler.block=e}end(){It.ok(this."  \
  "parent),this.compiler.block=this.parent}handle(t){t.accept(this)}invalid("  \
  "t,e){this.compiler.syntaxFault(t,`${e} can not end "                        \
  "blocks`)}mismatched(t,e){this.compiler.syntaxFault(t,`${e} can not end "    \
  "${this.kind}`)}visitPrintInstr(t){this.invalid(t,\"print\")}"               \
  "visitExpressionInstr(t){this.invalid(t,\"expr\")}visitRemInstr(t){this."    \
  "invalid(t,\"rem\")}visitNewInstr(t){this.invalid(t,\"new\")}"               \
  "visitLoadInstr(t){this.invalid(t,\"load\")}visitListInstr(t){this.invalid(" \
  "t,\"list\")}visitRenumInstr(t){this.invalid(t,\"renum\")}visitSaveInstr(t)" \
  "{this.invalid(t,\"save\")}visitRunInstr(t){this.invalid(t,\"run\")}"        \
  "visitExitInstr(t){this.invalid(t,\"exit\")}visitEndInstr(t){this.invalid("  \
  "t,\"end\")}visitLetInstr(t){this.invalid(t,\"let\")}visitAssignInstr(t){"   \
  "this.invalid(t,\"assign\")}visitShortIfInstr(t){this.invalid(t,\"if\")}"    \
  "visitIfInstr(t){this.invalid(t,\"if\")}visitElseInstr(t){this.mismatched("  \
  "t,\"else\")}visitElseIfInstr(t){this.mismatched(t,\"else "                  \
  "if\")}visitEndIfInstr(t){this.mismatched(t,\"endif\")}visitForInstr(t){"    \
  "this.invalid(t,\"for\")}visitOnwardInstr(t){this.invalid(t,\"onward\")}"    \
  "visitNextInstr(t){this.mismatched(t,\"next\")}visitWhileInstr(t){this."     \
  "invalid(t,\"while\")}visitEndWhileInstr(t){this.mismatched(t,\"endwhile\")" \
  "}visitRepeatInstr(t){this.invalid(t,\"repeat\")}visitUntilInstr(t){this."   \
  "mismatched(t,\"until\")}visitCommandInstr(t){this.invalid(t,k.format(t))}}" \
  "var l=function(s){return "                                                  \
  "s[s.Constant=0]=\"Constant\",s[s.Nil=1]=\"Nil\",s[s.Undef=2]=\"Undef\",s["  \
  "s.True=3]=\"True\",s[s.False=4]=\"False\",s[s.Pop=5]=\"Pop\",s[s.GetLocal=" \
  "6]=\"GetLocal\",s[s.SetLocal=7]=\"SetLocal\",s[s.GetGlobal=8]="             \
  "\"GetGlobal\",s[s.DefineGlobal=9]=\"DefineGlobal\",s[s.SetGlobal=10]="      \
  "\"SetGlobal\",s[s.Eq=11]=\"Eq\",s[s.Gt=12]=\"Gt\",s[s.Ge=13]=\"Ge\",s[s."   \
  "Lt=14]=\"Lt\",s[s.Le=15]=\"Le\",s[s.Ne=16]=\"Ne\",s[s.Not=17]=\"Not\",s[s." \
  "Add=18]=\"Add\",s[s.Sub=19]=\"Sub\",s[s.Mul=20]=\"Mul\",s[s.Div=21]="       \
  "\"Div\",s[s.Neg=22]=\"Neg\",s[s.Print=23]=\"Print\",s[s.Exit=24]=\"Exit\"," \
  "s[s.Command=25]=\"Command\",s[s.Jump=26]=\"Jump\",s[s.JumpIfFalse=27]="     \
  "\"JumpIfFalse\",s[s.Loop=28]=\"Loop\",s[s.Return=29]=\"Return\",s}({});"    \
  "const Xt=-1,_e=-1;class "                                                   \
  "wi{compiler;locals;count;depth;constructor(t){this.compiler=t,this.locals=" \
  "[],this.depth=0}begin(){this.depth++}end(){for(this.depth--;this.locals."   \
  "length>0&&this.locals[this.locals.length-1].depth>this.depth;)this."        \
  "compiler.emitByte(l.Pop),this.locals.pop()}ident(t){return "                \
  "this.declare(t),this.depth>0?0:this.compiler.makeIdent(t)}define(t){if("    \
  "this.depth>0){this.initialize(this.locals.length-1);return}this.compiler."  \
  "emitBytes(l.DefineGlobal,t)}initialize(t){this.locals[t].depth=this.depth}" \
  "declare(t){if(this.depth){for(let e=this.locals.length-1;e>=0;e--){const "  \
  "i=this.locals[e];if(i.depth!==Xt&&i.depth<this.depth)break;t.value===i."    \
  "name.value&&this.compiler.syntaxError(this.compiler.peek(),`Already a "     \
  "variable named ${t.value} in this "                                         \
  "scope.`)}this.addLocal(t)}}addLocal(t){const "                              \
  "e={name:t,depth:Xt};this.locals.push(e)}get(t){let "                        \
  "e,i=this.resolveLocal(t);i!==-1?e=l.GetLocal:(i=this.compiler.makeIdent(t)" \
  ",e=l.GetGlobal),this.compiler.emitBytes(e,i)}assign(t){let "                \
  "e,i=this.resolveLocal(t);i!==_e?e=l.SetLocal:(i=this.compiler.makeIdent(t)" \
  ",e=l.SetGlobal),this.compiler.emitBytes(e,i)}resolveLocal(t){for(let "      \
  "e=this.locals.length-1;e>=0;e--){const "                                    \
  "i=this.locals[e];if(t.value===i.name.value)return "                         \
  "i.depth===Xt&&this.compiler.syntaxError(this.compiler.peek(),`Can not "     \
  "read ${t.value} in its own definition.`),e}return _e}}function "            \
  "Pe(s){return[s>>8&255,s&255]}function vi([s,t]){return s<<8|t}class "       \
  "Qt{filename=\"<unknown>\";constants=[];code=[];lines=[];writeOp(t,e){this." \
  "code.push(t),this.lines.push(e)}addConstant(t){return "                     \
  "this.constants.push(t),this.constants.length-1}}function Be(s,t,e,i){var "  \
  "r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e)" \
  ":i,o;if(typeof Reflect==\"object\"&&typeof "                                \
  "Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var "   \
  "h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);"     \
  "return r>3&&n&&Object.defineProperty(t,e,n),n}function pt(s,t){if(typeof "  \
  "Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return "         \
  "Reflect.metadata(s,t)}let mt=class extends "                                \
  "Error{constructor(){super(\"Synchronize\"),Object.setPrototypeOf(this,new." \
  "target.prototype)}};mt=Be([m(\"Synchronize\"),pt(\"design:type\",Function)" \
  ",pt(\"design:paramtypes\",[])],mt);let Oe=class extends "                   \
  "M{kind=\"global\"},Fe=class extends M{kind=\"program\"},je=class extends "  \
  "M{kind=\"command\"};function yi(s){return s instanceof Fe||s instanceof "   \
  "je||s instanceof Oe}let Ae=class extends "                                  \
  "M{elseJump;kind=\"if\";constructor(t){super(),this.elseJump=t}"             \
  "visitElseInstr(t){const "                                                   \
  "e=this.compiler.beginElse(this.elseJump);this.next(t,new "                  \
  "bi(e))}visitElseIfInstr(t){const "                                          \
  "e=this.compiler.beginElse(this.elseJump),i=this.compiler.beginIf(t."        \
  "condition);this.next(t,new We(i,e))}visitEndIfInstr(t){const "              \
  "e=this.compiler.beginElse(this.elseJump);this.compiler.endIf(e),this.end()" \
  "}},bi=class extends "                                                       \
  "M{endJump;kind=\"else\";constructor(t){super(),this.endJump=t}"             \
  "visitEndIfInstr(t){this.compiler.endIf(this.endJump),this.end();let "       \
  "e=this.previous;for(;e instanceof "                                         \
  "We;)e.compiler.endIf(e.endJump),e.end(),e=e.parent}},We=class es extends "  \
  "Ae{endJump;kind=\"else "                                                    \
  "if\";constructor(t,e){super(t),this.endJump=e}visitEndIfInstr(t){const "    \
  "e=this.compiler.beginElse(this.elseJump);this.compiler.endIf(e);let "       \
  "i=this;for(;i instanceof "                                                  \
  "es;)i.compiler.endIf(i.endJump),i.end(),i=i.previous}},Ii=class extends "   \
  "M{incrStart;exitJump;kind=\"for\";constructor(t,e){super(),this.incrStart=" \
  "t,this.exitJump=e}visitOnwardInstr(t){super.visitOnwardInstr(t)}"           \
  "visitNextInstr(t){this.compiler.endFor(this.incrStart,this.exitJump),this." \
  "end()}},Ei=class extends "                                                  \
  "M{loopStart;exitJump;kind=\"while\";constructor(t,e){super(),this."         \
  "loopStart=t,this.exitJump=e}visitOnwardInstr(t){super.visitOnwardInstr(t)}" \
  "visitEndWhileInstr(t){this.compiler.endWhile(this.loopStart,this.exitJump)" \
  ",this.end()}},xi=class extends "                                            \
  "M{startJump;kind=\"repeat\";constructor(t){super(),this.startJump=t}"       \
  "visitOnwardInstr(t){super.visitOnwardInstr(t)}visitUntilInstr(t){this."     \
  "compiler.endRepeat(t,this.startJump),this.end()}};class "                   \
  "Kt{currentChunk;lines=[];currentInstrNo=-1;currentLine=0;filename;"         \
  "routineType=0;isReturningInstruction=!1;isError=!1;errors=[];global;block;" \
  "scope;constructor(t,e,{filename:i}){this.lines=t,this.routineType=e,this."  \
  "currentChunk=new "                                                          \
  "Qt,this.filename=i||\"<unknown>\",this.currentChunk.filename=this."         \
  "filename,this.routineType=e,this.isError=!1,this.errors=[],this.global="    \
  "new Oe,this.global.init(this,null,null,null),this.block=e===1?new Fe:new "  \
  "je,this.block.init(this,null,null,this.global),this.scope=new "             \
  "wi(this)}compile(){let "                                                    \
  "t=this.advance();for(;t;)try{this.instruction(t),t=this.advance()}catch(e)" \
  "{if(e instanceof mt){this.synchronize(),t=this.peek();continue}throw "      \
  "e}try{this.checkBlocksClosed()}catch(e){if(!(e instanceof mt))throw "       \
  "e}if(this.isError)throw new L(this.errors);return "                         \
  "this.emitReturn(),[this.chunk,null]}get chunk(){return "                    \
  "this.currentChunk}match(...t){for(const e of t)if(this.check(e))return "    \
  "this.advance(),!0;return!1}check(t){return "                                \
  "this.done?!1:this.peek()instanceof t}advance(){if(this.done)return "        \
  "null;for(this.currentInstrNo++;!this.done&&this.currentInstrNo>=this."      \
  "lines[this.currentLine].instructions.length;)this.currentLine++,this."      \
  "currentInstrNo=0;return this.done?null:this.peek()}get done(){return "      \
  "this.currentLine>=this.lines.length}peek(){return "                         \
  "this.done?null:this.lines[this.currentLine].instructions[this."             \
  "currentInstrNo]}createSyntaxError(t,e){return new "                         \
  "ct(e,{filename:this.filename,row:this.rowNo,isLine:this.routineType!==0,"   \
  "lineNo:this.lineNo,cmdNo:this.routineType===0?null:this.lineNo,"            \
  "offsetStart:t.offsetStart,offsetEnd:t.offsetEnd,source:this.lineSource})}"  \
  "syntaxError(t,e){const i=this.createSyntaxError(t,e);throw "                \
  "this.isError=!0,this.errors.push(i),new mt}syntaxFault(t,e){const "         \
  "i=this.createSyntaxError(t,e);throw "                                       \
  "b.fromError(i)}synchronize(){this.currentLine++,this.currentInstrNo=0}get " \
  "lineNo(){return "                                                           \
  "this.currentLine>=this.lines.length?this.lines[this.lines.length-1]."       \
  "lineNo:this.lines[this.currentLine].lineNo}get rowNo(){return "             \
  "this.currentLine>=this.lines.length?this.lines[this.lines.length-1].row:"   \
  "this.lines[this.currentLine].row}get lineSource(){return "                  \
  "this.currentLine>=this.lines.length?this.lines[this.lines.length-1]."       \
  "source:this.lines[this.currentLine].source}checkBlocksClosed(){yi(this."    \
  "block)||this.syntaxError(this.block.instr,`${this.block.kind} has not "     \
  "been closed`)}emitByte(t){this.currentChunk.writeOp(t,this.lineNo)}emitBytes(...t){for(const e of t)this.emitByte(e)}emitConstant(t){this.emitBytes(l.Constant,this.makeConstant(t))}emitJump(t){return this.emitByte(t),this.emitBytes(255,255),this.chunk.code.length-2}patchJump(t){const e=this.chunk.code.length-t-2,[i,r]=Pe(e);this.chunk.code[t]=i,this.chunk.code[t+1]=r}emitLoop(t){this.emitByte(l.Loop);const e=this.chunk.code.length-t+2,[i,r]=Pe(e);this.emitBytes(i,r)}emitReturn(){(this.routineType!==0||!this.isReturningInstruction)&&this.emitByte(l.Undef),this.emitByte(l.Return)}makeConstant(t){return this.currentChunk.addConstant(t)}makeIdent(t){return this.makeConstant(t.value)}instruction(t){t.accept(this)}visitPrintInstr(t){t.expression.accept(this),this.emitByte(l.Print)}visitExpressionInstr(t){this.isReturningInstruction=!0,t.expression.accept(this),this.routineType===1&&this.emitByte(l.Pop)}visitRemInstr(t){}visitNewInstr(t){let e=1;this.emitConstant(\"new\"),t.filename&&(t.filename.accept(this),e=2),this.emitBytes(l.Command,e)}visitLoadInstr(t){this.emitConstant(\"load\");for(const e of t.params)e.accept(this);this.emitBytes(l.Command,1+t.params.length)}visitListInstr(t){this.emitConstant(\"list\"),this.emitConstant(t.lineStart||z),this.emitConstant(t.lineEnd||z),this.emitBytes(l.Command,3)}visitRenumInstr(t){this.emitConstant(\"renum\"),this.emitBytes(l.Command,1)}visitSaveInstr(t){this.emitConstant(\"save\"),t.filename?t.filename.accept(this):this.emitConstant(z),this.emitBytes(l.Command,2)}visitRunInstr(t){this.emitConstant(\"run\"),this.emitBytes(l.Command,1)}visitEndInstr(t){this.emitReturn()}visitExitInstr(t){t.expression?t.expression.accept(this):this.emitConstant(0),this.emitByte(l.Exit)}visitLetInstr(t){this.let_(t.variable,t.value)}let_(t,e){const i=this.scope.ident(t.ident);e?e.accept(this):this.emitByte(l.Nil),this.scope.define(i)}visitAssignInstr(t){this.assign(t.variable,t.value)}assign(t,e){e.accept(this),this.scope.assign(t.ident)}visitShortIfInstr(t){const e=this.beginIf(t.condition);for(const r of t.then)this.instruction(r);const i=this.beginElse(e);for(const r of t.else_)this.instruction(r);this.endIf(i)}visitIfInstr(t){const e=this.beginIf(t.condition);this.block.begin(t,new Ae(e))}beginIf(t){t.accept(this);const e=this.emitJump(l.JumpIfFalse);return this.emitByte(l.Pop),e}visitElseInstr(t){this.block.handle(t)}beginElse(t){const e=this.emitJump(l.Jump);return this.patchJump(t),this.emitByte(l.Pop),e}visitElseIfInstr(t){this.block.handle(t)}visitEndIfInstr(t){this.block.handle(t)}endIf(t){this.patchJump(t)}visitForInstr(t){const{variable:e,value:i,stop:r}=t,n=t.step||new Ft(1),[o,h]=this.beginFor(e,i,r,n);this.block.begin(t,new Ii(o,h))}beginFor(t,e,i,r){const n=new K(t,a.Le,i),o=new K(t,a.Plus,r);this.scope.begin(),this.let_(t,e);const h=this.chunk.code.length;n.accept(this);const f=this.emitJump(l.JumpIfFalse);this.emitByte(l.Pop);const g=this.emitJump(l.Jump),p=this.chunk.code.length;return this.assign(t,o),this.emitByte(l.Pop),this.emitLoop(h),this.patchJump(g),[p,f]}visitNextInstr(t){this.block.handle(t)}endFor(t,e){this.emitLoop(t),this.scope.end(),this.patchJump(e)}visitWhileInstr(t){const[e,i]=this.beginWhile(t.condition);this.block.begin(t,new Ei(e,i))}beginWhile(t){const e=this.chunk.code.length;t.accept(this);const i=this.emitJump(l.JumpIfFalse);return this.emitByte(l.Pop),[e,i]}visitEndWhileInstr(t){this.block.handle(t)}endWhile(t,e){this.emitLoop(t),this.patchJump(e)}visitRepeatInstr(t){const e=this.chunk.code.length;this.block.begin(t,new xi(e))}visitUntilInstr(t){this.block.handle(t)}endRepeat(t,e){t.condition.accept(this);const i=this.emitJump(l.JumpIfFalse);this.emitByte(l.Pop),this.emitLoop(e),this.patchJump(i)}visitOnwardInstr(t){this.block.handle(t)}visitCommandInstr(t){t.name.accept(this);for(const e of t.params)e.accept(this);this.emitBytes(l.Command,1+t.params.length)}visitUnaryExpr(t){switch(t.expr.accept(this),t.op){case a.Plus:break;case a.Minus:this.emitByte(l.Neg);break;case a.Not:this.emitByte(l.Not);break;default:this.syntaxError(this.peek(),\"Invalid unary operator\")}}visitBinaryExpr(t){switch(t.left.accept(this),t.right.accept(this),t.op){case a.Plus:this.emitByte(l.Add);break;case a.Minus:this.emitByte(l.Sub);break;case a.Star:this.emitByte(l.Mul);break;case a.Slash:this.emitByte(l.Div);break;case a.EqEq:this.emitByte(l.Eq);break;case a.Gt:this.emitByte(l.Gt);break;case a.Ge:this.emitByte(l.Ge);break;case a.Lt:this.emitByte(l.Lt);break;case a.Le:this.emitByte(l.Le);break;case a.Ne:this.emitByte(l.Ne);break;default:this.syntaxError(this.peek(),\"Invalid binary operator\")}}visitLogicalExpr(t){switch(t.op){case a.And:this.emitAnd(t);break;case a.Or:this.emitOr(t);break;default:this.syntaxError(this.peek(),\"Invalid logical operator\")}}emitAnd(t){t.left.accept(this);const e=this.emitJump(l.JumpIfFalse);this.emitByte(l.Pop),t.right.accept(this),this.patchJump(e)}emitOr(t){t.left.accept(this);const e=this.emitJump(l.JumpIfFalse),i=this.emitJump(l.Jump);this.patchJump(e),this.emitByte(l.Pop),t.right.accept(this),this.patchJump(i)}visitGroupExpr(t){t.expr.accept(this)}visitVariableExpr(t){this.scope.get(t.ident)}visitIntLiteralExpr(t){this.emitConstant(t.value)}visitRealLiteralExpr(t){this.emitConstant(t.value)}visitBoolLiteralExpr(t){this.emitConstant(t.value)}visitStringLiteralExpr(t){this.emitConstant(t.value)}visitShellLiteralExpr(t){this.emitConstant(t.value)}visitPromptLiteralExpr(t){}visitNilLiteralExpr(t){this.emitByte(l.Nil)}}Be([Ht,pt(\"design:type\",Function),pt(\"design:paramtypes\",[]),pt(\"design:returntype\",typeof CompileResult>\"u\"?Object:CompileResult)],Kt.prototype,\"compile\",null);function ki(s,t={}){const{cmdNo:e,cmdSource:i}=t,r=[new Wt(e||100,1,i||N.unknown(),[s])];return new Kt(r,0,t).compile()}function Si(s,t={}){const e=s.map(n=>{const[o,h]=ki(n,t);return[o,h]}),i=e.map(([n,o])=>n),r=e.reduce((n,[o,h])=>h?n.concat(h):n,[]);return[i,tt(r)]}function Li(s,t={}){return new Kt(s.lines,1,t).compile()}function Ni(s,t,e,i){var r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,o;if(typeof Reflect==\"object\"&&typeof Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);return r>3&&n&&Object.defineProperty(t,e,n),n}function Te(s,t){if(typeof Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return Reflect.metadata(s,t)}function Ri(s,t){return function(e,i){t(e,i,s)}}const De=-1;let $i=class{shift;constructor(t){this.shift=t}shiftInstr(t){t.offsetStart+=this.shift,t.offsetEnd+=this.shift}shiftToken(t){t.offsetStart+=this.shift,t.offsetEnd+=this.shift}visitRemInstr(t){this.shiftInstr(t)}visitLetInstr(t){this.shiftInstr(t),t.variable.accept(this)}visitAssignInstr(t){this.shiftInstr(t),t.variable.accept(this)}visitExpressionInstr(t){this.shiftInstr(t),t.expression.accept(this)}visitPrintInstr(t){this.shiftInstr(t),t.expression.accept(this)}visitExitInstr(t){this.shiftInstr(t),t.expression&&t.expression.accept(this)}visitEndInstr(t){this.shiftInstr(t)}visitNewInstr(t){this.shiftInstr(t),t.filename&&t.filename.accept(this)}visitLoadInstr(t){this.shiftInstr(t);for(const e of t.params)e.accept(this)}visitListInstr(t){this.shiftInstr(t)}visitRenumInstr(t){this.shiftInstr(t)}visitRunInstr(t){this.shiftInstr(t)}visitSaveInstr(t){this.shiftInstr(t),t.filename&&t.filename.accept(this)}visitShortIfInstr(t){this.shiftInstr(t),t.condition.accept(this);for(const e of t.then)e.accept(this);for(const e of t.else_)e.accept(this)}visitIfInstr(t){this.shiftInstr(t),t.condition.accept(this)}visitElseInstr(t){this.shiftInstr(t)}visitElseIfInstr(t){this.shiftInstr(t),t.condition.accept(this)}visitEndIfInstr(t){this.shiftInstr(t)}visitForInstr(t){this.shiftInstr(t),t.variable.accept(this),t.value.accept(this),t.stop.accept(this),t.step!==null&&t.step.accept(this)}visitOnwardInstr(t){this.shiftInstr(t)}visitNextInstr(t){this.shiftInstr(t)}visitWhileInstr(t){this.shiftInstr(t),t.condition.accept(this)}visitEndWhileInstr(t){this.shiftInstr(t)}visitRepeatInstr(t){this.shiftInstr(t)}visitUntilInstr(t){this.shiftInstr(t),t.condition.accept(this)}visitCommandInstr(t){this.shiftInstr(t);for(const e of t.params)e.accept(this)}visitUnaryExpr(t){t.expr.accept(this)}visitBinaryExpr(t){t.left.accept(this),t.right.accept(this)}visitLogicalExpr(t){t.left.accept(this),t.right.accept(this)}visitGroupExpr(t){t.expr.accept(this)}visitVariableExpr(t){this.shiftToken(t.ident)}visitIntLiteralExpr(t){}visitRealLiteralExpr(t){}visitBoolLiteralExpr(t){}visitStringLiteralExpr(t){}visitShellLiteralExpr(t){}visitPromptLiteralExpr(t){}visitNilLiteralExpr(t){}};class dt{host;program;warning;justify=0;constructor(t){this.host=t,this.program=new Tt(\"untitled.bas\",[]),this.warning=null}get filename(){return this.host.relativePath(\".\",this.program.filename)}set filename(t){this.program.filename=this.host.resolvePath(t)}init(t,e){this.program=t,this.warning=e}reset(){this.program=new Tt(\"untitled.bas\",[]),this.warning=null}list(t=null,e=null){let i=0,r=this.program.lines[this.program.lines.length-1].lineNo;return t&&(i=t,e||(r=t)),e?r=e:t&&(r=t),this.program.lines.filter(n=>n.lineNo>=i&&n.lineNo<=r).map(n=>n.instructions.length===1&&n.instructions[0]instanceof jt&&n.instructions[0].remark===\"\"?`${n.lineNo}`:n.source).join(`\n`)}renum(){const t={};let e=0;for(let i=0;i<this.program.lines.length;i++){const r=this.program.lines[i],n=r.lineNo,o=(i+1)*10,h=String(o);t[n]={to:o,toStr:h,shift:0,source:r.source},e=Math.max(e,h.length)}for(const i of this.program.lines){const r=i.lineNo,{to:n,toStr:o}=t[r],h=this.justify===0?\"\":\" \".repeat(e-o.length),f=this.justify===0?\" \".repeat(e-o.length+1):\" \",g=i.source.prefix.length,R=h.length+o.length+f.length-g;i.lineNo=n,i.source.leadingWs=h,i.source.lineNo=o,i.source.separatingWs=f;for(const x of i.instructions)x.accept(new $i(R));t[r].shift=R}if(this.warning)for(let i=0;i<this.warning.warnings.length;i++){const r=this.warning.warnings[i],{to:n,shift:o,source:h}=t[r.lineNo];n&&(r.lineNo=n,r.source=h,r.offsetStart+=o,r.offsetEnd+=o)}}findLineIndex(t){let e=0,i=this.program.lines.length-1;if(!this.program.lines.length)return{i:De,lineNo:null,match:!1};let r=this.program.lines[e],n=this.program.lines[i];if(r.lineNo>t)return{i:De,lineNo:null,match:!1};if(r.lineNo===t)return{i:e,lineNo:r.lineNo,match:!0};if(n.lineNo<=t)return{i,lineNo:n.lineNo,match:n.lineNo===t};for(;;){if(i-e<=1)return{i:e,lineNo:r.lineNo,match:!1};const o=Math.floor((e+i)/2),h=this.program.lines[o];if(h.lineNo===t)return{i:o,lineNo:h.lineNo,match:!0};h.lineNo>t?(i=o,n=h):h.lineNo<t&&(e=o,r=h)}}setLine(t,e){const{i,match:r}=this.findLineIndex(t.lineNo);if(!t.instructions.length){r&&(this.program.lines.splice(i,1),this.warning=Xs(this.warning,\"lineNo\",t.lineNo));return}if(r){this.program.lines[i]=t,e&&(this.warning=tt([this.warning,e]));return}this.program.lines.splice(i+1,0,t)}}dt=Ni([it(),Ri(0,yt(\"Host\")),Te(\"design:type\",Function),Te(\"design:paramtypes\",[typeof Host>\"u\"?Object:Host])],dt);const te={true:a.TrueLiteral,false:a.FalseLiteral,nil:a.NilLiteral,and:a.And,or:a.Or,not:a.Not,new:a.New,load:a.Load,save:a.Save,list:a.List,renum:a.Renum,run:a.Run,end:a.End,exit:a.Exit,let:a.Let,if:a.If,then:a.Then,else:a.Else,endif:a.EndIf,for:a.For,to:a.To,step:a.Step,onward:a.Onward,next:a.Next,while:a.While,endwhile:a.EndWhile,repeat:a.Repeat,until:a.Until,print:a.Print},ee=\"\\0\",_i=/[\\r\\t ]/;function Ue(s){return s.match(_i)!==null}const Pi=/[0123456789]/;function Y(s){return s.match(Pi)!==null}const Bi=/[0123456789abcdef]/i;function Oi(s){return s.match(Bi)!==null}const Fi=/[012345678]/;function ji(s){return s.match(Fi)!=null}const Ai=/[01]/;function Wi(s){return s.match(Ai)!=null}const Ti=/[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]/;function Je(s){return s.match(Ti)!=null}function Di(s){return Je(s)||Y(s)}const Ui=/[`#$&*()|[\\]{}:\\\\'\"<>?!]/;function Ge(s){return s.match(Ui)!=null}const Ji=/\\r\\t\\n /;function Gi(s){return s.match(Ji)!=null}class zi{source;filename;start;current;row;offset;constructor(t,e){this.source=t,this.filename=e||\"<unknown>\",this.start=0,this.current=0,this.row=1,this.offset=0}get done(){return this.current>=this.source.length}match(t){return this.done||this.source[this.current]!=t?!1:(this.current++,!0)}peek(){return this.done?ee:this.source[this.current]}peekNext(){return this.current+1>=this.source.length?ee:this.source[this.current+1]}advance(){return this.source[this.current++]}emitToken(t,e=null){const i=this.source.slice(this.start,this.current),r=this.row,n=this.offset,o=this.offset+(this.current-this.start);return t===a.LineEnding?(this.offset=0,this.row++):this.offset+=this.current-this.start,new gi({kind:t,index:this.start,row:r,offsetStart:n,offsetEnd:o,text:i,value:e})}nextToken(){if(this.start=this.current,this.done)return this.emitToken(a.Eof);const t=this.advance();switch(t){case\"\\r\":case\"	\":case\" \":return this.whitespace();case\"(\":return this.emitToken(a.LParen);case\")\":return this.emitToken(a.RParen);case\",\":return this.emitToken(a.Comma);case\";\":return this.emitToken(a.Semicolon);case\":\":return this.emitToken(a.Colon);case\".\":return this.emitToken(a.Dot);case\"+\":return this.emitToken(a.Plus);case\"-\":return this.emitToken(a.Minus);case\"*\":return this.emitToken(a.Star);case\"%\":return this.emitToken(a.Percent);case\"$\":return this.emitToken(a.Dollar);case\"!\":return this.match(\"=\")?this.emitToken(a.BangEq):this.emitToken(a.Bang);case\"/\":return this.emitToken(a.Slash);case\"\\\\\":return this.emitToken(a.BSlash);case\"=\":return this.match(\"=\")?this.emitToken(a.EqEq):this.emitToken(a.Eq);case\">\":return this.match(\"=\")?this.emitToken(a.Ge):this.emitToken(a.Gt);case\"<\":return this.match(\">\")?this.emitToken(a.Ne):this.match(\"=\")?this.emitToken(a.Le):this.emitToken(a.Lt);case\"#\":return this.emitToken(a.Hash);case'\"':return this.string('\"');case\"'\":return this.string(\"'\");case`\n`:return this.emitToken(a.LineEnding);case\"0\":return this.match(\"x\")?this.hex():this.match(\"o\")?this.octal():this.match(\"b\")?this.binary():this.decimal();case\"r\":if(this.peek()===\"e\"&&this.peekNext()===\"m\")return this.rem();default:return Y(t)?this.decimal():Je(t)||t===\"_\"?this.identifier():Ge(t)?this.illegal():this.shell()}}whitespace(){for(;Ue(this.peek());)this.advance();const t=this.source.slice(this.start,this.current);return this.emitToken(a.Whitespace,t)}string(t){let e=t;for(;![t,`\n`,\"\\r\"].includes(this.peek())&&!this.done;){const i=this.advance();e+=i,i===\"\\\\\"&&(e+=this.advance())}return this.peek()!==t?this.emitToken(a.UnterminatedStringLiteral,e):(e+=t,this.advance(),this.emitToken(a.StringLiteral,e))}hex(){for(;(this.peek()===\"_\"||Oi(this.peek()))&&!this.done;)this.advance();let t;try{t=parseInt(this.source.slice(this.start+2,this.current),16)}catch(e){throw new b(\"Invalid hex literal\",e)}return this.emitToken(a.HexLiteral,t)}octal(){for(;(this.peek()===\"_\"||ji(this.peek()))&&!this.done;)this.advance();let t;try{t=parseInt(this.source.slice(this.start+2,this.current),8)}catch(e){throw new b(\"Invalid octal literal\",e)}return this.emitToken(a.OctalLiteral,t)}binary(){for(;(this.peek()===\"_\"||Wi(this.peek()))&&!this.done;)this.advance();let t;try{t=parseInt(this.source.slice(this.start+2,this.current),16)}catch(e){throw new b(\"Invalid binary literal\",e)}return this.emitToken(a.BinaryLiteral,t)}decimal(){let t=!1;for(;(this.peek()===\"_\"||Y(this.peek()))&&!this.done;)this.advance();for(this.peek()===\".\"&&(this.peekNext()===\"_\"||Y(this.peekNext()))&&(t=!0,this.advance());(this.peek()===\"_\"||Y(this.peek()))&&!this.done;)this.advance();for(this.peek()===\"e\"&&(this.peek()===\"_\"||Y(this.peekNext()))&&(t=!0,this.advance());(this.peek()===\"_\"||Y(this.peek()))&&!this.done;)this.advance();let e;try{return t?(e=parseFloat(this.source.slice(this.start,this.current)),this.emitToken(a.RealLiteral,e)):(e=parseInt(this.source.slice(this.start,this.current),10),this.emitToken(a.DecimalLiteral,e))}catch(i){throw new b(\"Invalid decimal literal\",i)}}identifier(){for(;;){const i=this.peek();if(Di(i)||i===\"_\")this.advance();else break}let t,e=this.source.slice(this.start,this.current);switch(this.peek()){case\"%\":t=a.IntIdent,e+=this.advance();break;case\"!\":t=a.RealIdent,e+=this.advance();break;case\"?\":t=a.BoolIdent,e+=this.advance();break;case\"$\":t=a.StringIdent,e+=this.advance();break;default:te[e]?t=te[e]:t=a.Ident;break}return this.emitToken(t,e)}rem(){if(this.advance(),this.advance(),this.match(\" \")||this.match(\"	\")||this.peek()===`\n`||this.peek()===ee){for(;this.peek()!==`\n`&&!this.done;)this.advance();const t=this.source.slice(this.start+3,this.current).trim();return this.emitToken(a.Rem,t)}else return this.identifier()}shell(){for(;!this.done;){const e=this.peek();if(Ge(e)||Ue(e))break;this.advance()}const t=this.source.slice(this.start,this.current);return this.emitToken(a.ShellToken,t)}illegal(){for(;!Gi(this.peek())&&!this.done;)this.advance();const t=this.source.slice(this.start,this.current);return this.emitToken(a.Illegal,t)}}function Ci(s,t){return s.lineNo-t.lineNo}function Mi(s){s.sort(Ci)}function se(s,t,e,i){var r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,o;if(typeof Reflect==\"object\"&&typeof Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);return r>3&&n&&Object.defineProperty(t,e,n),n}function H(s,t){if(typeof Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return Reflect.metadata(s,t)}let gt=class extends Error{constructor(){super(\"Synchronize\"),Object.setPrototypeOf(this,new.target.prototype)}};gt=se([m(\"Synchronize\"),H(\"design:type\",Function),H(\"design:paramtypes\",[])],gt);class ie{filename=\"<unknown>\";scanner;previous;current;leadingWs=\"\";next;trailingWs=\"\";lineErrors=[];errors=[];isError=!1;isWarning=!1;isProgram=!1;isLine=!1;lineNo=null;cmdNo=0;line=N.empty();isShortIf=!1;constructor(){}init(t,e,i){this.filename=e,this.scanner=new zi(t,e),this.previous=null;const[r,n]=this.nextToken();this.current=n;const[o,h]=this.nextToken();this.leadingWs=r,this.next=h,this.trailingWs=o,this.lineErrors=[],this.errors=[],this.isError=!1,this.isWarning=!1,this.isProgram=i,this.isLine=!1,this.lineNo=null,this.line=new N(r,\"\",\"\",this.current.text),this.isShortIf=!1}parseInput(t){this.init(t,\"<input>\",!1);const e=new Hs(this.rows());let i=null;if(this.isError){const r=new L(this.errors);throw ye(r,[\"row\",\"offsetStart\"]),r}else if(this.isWarning){const r=this.errors;i=new D(r),ye(i,[\"row\",\"offsetStart\"])}return[e,i]}parseProgram(t,e){this.init(t,e,!0);const i=this.rows();Mi(i);const r=new Tt(this.filename,i);let n=null;if(this.isError)throw new L(this.errors);if(this.isWarning){const o=this.errors;n=new D(o)}return showTree(r),[r,n]}match(...t){for(const e of t)if(this.check(e))return this.advance(),!0;return!1}check(t){return this.done?t===a.Eof:this.current.kind===t}checkNext(t){return this.done?t===a.Eof:this.next.kind===t}nextToken(t=\"\"){const e=this.scanner.nextToken();return e.kind===a.Whitespace?this.nextToken(t+e.text):[t,e]}advance(){this.previous=this.current,this.current=this.next,this.line.source+=this.trailingWs+this.current.text;const[t,e]=this.nextToken();return this.leadingWs=this.trailingWs,this.trailingWs=t,this.next=e,this.current.kind===a.Illegal&&this.syntaxError(this.current,`Illegal token ${this.current.text}`),this.previous}get done(){return this.current.kind==a.Eof}consume(t,e){if(this.check(t))return this.advance();this.syntaxError(this.current,e)}syntaxError(t,e){const i=new ct(e,{filename:this.filename,row:t.row,isLine:this.isLine,lineNo:this.lineNo,cmdNo:this.isLine?null:this.cmdNo,offsetStart:t.offsetStart,offsetEnd:t.offsetEnd,source:N.unknown()});throw this.isError=!0,this.lineErrors.push(i),new gt}syntaxWarning(t,e){const i=new kt(e,{filename:this.filename,row:t.row,isLine:this.isLine,lineNo:this.lineNo,cmdNo:this.isLine?null:this.cmdNo,offsetStart:t.offsetStart,offsetEnd:t.offsetEnd,source:N.unknown()});this.isWarning=!0,this.lineErrors.push(i)}rows(){const t=[];for(;!this.done;){const e=this.row();e&&t.push(e)}return t}row(){const t=this.current.row;let e,i;try{this.lineNumber(),e=this.instructions(),i=this.rowEnding()}catch(r){if(r instanceof gt)return this.syncNextRow(),null;throw r}return this.lineNo!==null?new Wt(this.lineNo,t,i,e):(this.cmdNo+=10,new Ms(this.cmdNo,t,i,e))}lineNumber(){const t=this.lineNo;this.match(a.DecimalLiteral)?(this.lineNo=this.previous.value,this.line.lineNo=this.previous.text,this.line.separatingWs=this.leadingWs,this.line.source=this.current.text,this.isLine=!0):this.isProgram?this.syntaxError(this.current,\"Expected line number\"):(this.lineNo=null,this.isLine=!1),this.lineNo!==null&&(this.lineNo%10&&this.syntaxWarning(this.previous,\"Line numbers should be in factors of 10\"),this.isProgram&&t!==null&&this.lineNo<=t&&this.syntaxWarning(this.previous,\"Line numbers should be in order\"))}rowEnding(){const t=this.line.clone();t.source.endsWith(`\n`)&&(t.source=t.source.slice(0,-1));for(const i of this.lineErrors)i.source=t,this.errors.push(i);if(this.lineErrors=[],!this.match(a.LineEnding)){const i=this.current;this.consume(a.Eof,`Unexpected token ${i.text.length?i.text:i.kind}`)}const e=new N(this.leadingWs,\"\",\"\",this.current.text);return this.line=e,this.isLine=!1,t}syncNextInstr(){for(;![a.Colon,a.LineEnding,a.Eof,a.Rem].includes(this.current.kind);)this.advance()}syncNextRow(){for(;![a.LineEnding,a.Eof,a.Rem].includes(this.current.kind);)this.advance();this.rowEnding()}get isLineEnding(){return this.done||this.current.kind===a.LineEnding}instructions(){if(this.isLineEnding)return[];let t=this.instruction();const e=t?[t]:[];for(;this.match(a.Colon)||this.check(a.Rem);)try{t=this.instruction(),t&&e.push(t)}catch(i){throw i instanceof gt&&this.syncNextInstr(),i}return e}instruction(){const{offsetStart:t}=this.current;let e;if(this.match(a.Rem))e=new jt(this.previous.value);else if(this.match(a.Semicolon))e=new jt(\"\");else if(this.match(a.Print))e=this.print();else if(this.match(a.New))e=this.new();else if(this.match(a.Load))e=this.load();else if(this.match(a.List))e=this.list();else if(this.match(a.Renum))e=this.renum();else if(this.match(a.Save))e=this.save();else if(this.match(a.Run))e=this.run();else if(this.match(a.End))e=this.end();else if(this.match(a.Exit))e=this.exit();else if(this.match(a.Let))e=this.let();else if(this.match(a.If))e=this.if_();else if(this.match(a.Else))e=this.else_();else if(this.match(a.EndIf))e=this.endIf();else if(this.match(a.For))e=this.for_();else if(this.match(a.Onward))e=this.onward();else if(this.match(a.Next))e=this.endFor();else if(this.match(a.While))e=this.while_();else if(this.match(a.EndWhile))e=this.endWhile();else if(this.match(a.Repeat))e=this.repeat();else if(this.match(a.Until))e=this.until();else{const r=this.assign();r?e=r:this.checkExpressionStatementStart()?e=this.expressionStatement():e=this.command()}const{offsetEnd:i}=this.previous;return e.offsetStart=t,e.offsetEnd=i,e}print(){return new Ss(this.expression())}new(){return new Ns(this.optionalExpression())}load(){const t=this.params();return new Rs(t)}list(){if(this.match(a.DecimalLiteral)){const t=this.previous.value;if(this.match(a.Minus)){const e=this.consume(a.DecimalLiteral,\"Expected line end\").value;return new At(t,e)}return new At(t,null)}return new At(null,null)}renum(){return new $s}save(){return new Ps(this.optionalExpression())}run(){return new _s}end(){return new Ls}exit(){const t=this.optionalExpression();return t?new pe(t):new pe(null)}expressionStatement(){return new ks(this.expression())}let(){let t;this.match(a.IntIdent,a.RealIdent,a.BoolIdent,a.StringIdent)?t=this.variable():this.syntaxError(this.current,\"Expected variable name\");let e=null;return this.match(a.Eq)&&(e=this.expression()),new Es(t,e)}assign(){if((this.check(a.IntIdent)||this.check(a.RealIdent)||this.check(a.BoolIdent)||this.check(a.StringIdent))&&this.checkNext(a.Eq)){this.advance();const t=this.variable();this.consume(a.Eq,\"Expected =\");const e=this.expression();return new xs(t,e)}return null}if_(){const t=this.ifCondition();return!this.isShortIf&&this.isLineEnding?new Os(t):this.shortIf(t)}ifCondition(){const t=this.expression();return this.consume(a.Then,\"Expected then\"),t}shortIf(t){const e=this.isShortIf;this.isShortIf=!0;const i=this.instructions();let r=[];return this.match(a.Else)&&(r=this.instructions()),this.consume(a.EndIf,\"Expected 'endif' after 'if' instruction\"),this.isShortIf=e,new Bs(t,i,r)}else_(){return this.isShortIf&&this.syntaxError(this.previous,\"Unexpected 'else'\"),this.match(a.If)?this.elseIf():new Fs}elseIf(){return new js(this.ifCondition())}endIf(){return this.isShortIf&&this.syntaxError(this.previous,\"Unexpected 'endif'\"),new As}for_(){const t=this.assign();t||this.syntaxError(this.previous,\"Expected assignment\"),this.consume(a.To,\"Expected 'to'\");const e=this.expression();let i=null;return this.match(a.Step)&&(i=this.expression()),new Ws(t.variable,t.value,e,i)}onward(){return new Ts}endFor(){return new Ds}while_(){const t=this.expression();return new Us(t)}endWhile(){return new Js}repeat(){return new Gs}until(){const t=this.expression();return new zs(t)}checkPrimaryStart(){return this.check(a.DecimalLiteral)||this.check(a.HexLiteral)||this.check(a.OctalLiteral)||this.check(a.BinaryLiteral)||this.check(a.RealLiteral)||this.check(a.TrueLiteral)||this.check(a.FalseLiteral)||this.check(a.StringLiteral)||this.check(a.NilLiteral)||this.check(a.IntIdent)||this.check(a.RealIdent)||this.check(a.BoolIdent)||this.check(a.StringIdent)||this.check(a.LParen)}checkExpressionStatementStart(){return this.checkPrimaryStart()||[...Object.values(te),a.Plus,a.Minus].reduce((t,e)=>this.check(e)||t,!1)}command(){const t=this.param();if(!t){const i=this.current;this.syntaxError(i,`Unexpected token ${i.text.length?i.text:i.kind}`)}const e=this.params();return new Cs(t,e)}optionalExpression(){for(const t of[a.Colon,a.LineEnding,a.Eof])if(this.check(t))return null;return this.expression()}expression(){return this.or()}infixOperator(t,e,i){let r=e();for(;this.match(...t);){const n=this.previous.kind,o=e();r=i(r,n,o)}return r}prefixOperator(t,e,i){const r=this.prefixOperator.bind(this,t,e,i);if(this.match(...t)){const n=this.previous.kind,o=r();return i(n,o)}return e()}or(){return this.infixOperator([a.Or],this.and.bind(this),(t,e,i)=>new ue(t,e,i))}and(){return this.infixOperator([a.And],this.not.bind(this),(t,e,i)=>new ue(t,e,i))}not(){return this.prefixOperator([a.Not],this.equality.bind(this),(t,e)=>new le(t,e))}equality(){return this.infixOperator([a.Eq,a.EqEq,a.BangEq,a.Ne],this.comparison.bind(this),(t,e,i)=>(e==a.Eq?(this.syntaxWarning(this.previous,\"Use `==` instead of `==` for equality\"),e=a.EqEq):e==a.BangEq&&(this.syntaxWarning(this.previous,\"Use `<>` instead of `!=` for equality\"),e=a.Ne),new K(t,e,i)))}comparison(){return this.infixOperator([a.Gt,a.Ge,a.Lt,a.Le],this.term.bind(this),(t,e,i)=>new K(t,e,i))}term(){return this.infixOperator([a.Minus,a.Plus],this.factor.bind(this),(t,e,i)=>new K(t,e,i))}factor(){return this.infixOperator([a.Slash,a.Star],this.unary.bind(this),(t,e,i)=>new K(t,e,i))}unary(){return this.prefixOperator([a.Minus,a.Plus],this.primary.bind(this),(t,e)=>new le(t,e))}primary(){if(this.match(a.DecimalLiteral,a.HexLiteral,a.OctalLiteral,a.BinaryLiteral))return new Ft(this.previous.value);if(this.match(a.RealLiteral))return new ws(this.previous.value);if(this.match(a.TrueLiteral))return new fe(!0);if(this.match(a.FalseLiteral))return new fe(!1);if(this.match(a.StringLiteral))return this.string();if(this.match(a.NilLiteral))return new Is;if(this.match(a.IntIdent,a.RealIdent,a.BoolIdent,a.StringIdent))return this.variable();if(this.match(a.LParen))return this.group();{const t=this.current;let e=`Unexpected token ${t.text.length?t.text:t.kind}`;t.kind==a.UnterminatedStringLiteral&&(e=`Unterminated string ${t.text}`),this.syntaxError(t,e)}}variable(){return new gs(this.previous)}group(){const t=this.expression();return this.consume(a.RParen,\"Expected `)` after expression\"),new ds(t)}string(){return new vs(this.parseStringEscapeCodes(!1))}prompt(){return new bs(this.parseStringEscapeCodes(!0))}parseStringEscapeCodes(t){const e=[],i=this.previous.text,r=this.previous.value;let n=\"\",o=1;function h(){return o++,r[o-1]}function f(){return o>=r.length-1}for(;!f();){const g=h();if(g===\"\\\\\"){const p=h();switch(p){case\"a\":n+=\"\\x07\";break;case\"b\":n+=\"\\b\";break;case\"e\":n+=\"\\x1B\";break;case\"t\":t?n+=\"\\\\t\":n+=\"	\";break;case\"r\":n+=\"\\r\";break;case\"v\":n+=\"\\v\";break;case\"f\":n+=\"\\f\";break;case\"n\":n+=`\n`;break;case\"'\":case'\"':n+=p;break;case\"\\\\\":n+=\"\\\\\";break;default:e.push(new kt(`Invalid escape sequence \\`\\\\${p}\\``,{filename:this.filename,row:this.current.row,isLine:this.isLine,lineNo:this.lineNo,cmdNo:this.isLine?null:this.cmdNo,offsetStart:this.previous.offsetStart+o-2,offsetEnd:this.previous.offsetStart+o,source:N.unknown()})),this.isWarning=!0,n+=\"\\\\\",n+=p}}else n+=g}for(const g of e)g.message+=` in string ${i}`,this.lineErrors.push(g),this.isWarning=!0;return n}params(){const t=[];let e=this.param();for(;e;)t.push(e),e=this.param();return t}param(){return this.checkPrimaryStart()?this.primary():this.shellLiteral()}shellLiteral(){let[t,e]=this.matchShellPart();if(!t)return null;let i=\"\";for(;t&&(i+=this.previous.text,!e);)[t,e]=this.matchShellPart();return new ys(i)}checkShellPart(){return this.check(a.Rem)||this.check(a.LineEnding)||this.check(a.Eof)?!1:!this.current.text.match(/[`#$&*()|[\\]{}:'\"<>?!]+/)}matchShellPart(){return this.checkShellPart()?(this.advance(),[!0,!!this.leadingWs.length]):[!1,!!this.trailingWs.length]}}se([Ht,H(\"design:type\",Function),H(\"design:paramtypes\",[String]),H(\"design:returntype\",typeof ParseResult>\"u\"?Object:ParseResult)],ie.prototype,\"parseInput\",null),se([Ht,H(\"design:type\",Function),H(\"design:paramtypes\",[String,String]),H(\"design:returntype\",typeof ParseResult>\"u\"?Object:ParseResult)],ie.prototype,\"parseProgram\",null);class ze{stack=[];push(t){this.stack.push(t)}pop(){const t=this.stack.pop();return It.notEqual(typeof t,\"undefined\",\"Popped empty stack\"),t}peek(t=0){return this.empty?null:this.stack[this.stack.length-t-1]}set(t,e){this.stack[t]=e}get empty(){return this.stack.length===0}get size(){return this.stack.length}reset(){this.stack=[]}format(t){return t.formatStack(this)}}class Hi{next;filename;lineNo;constructor(t,e,i){this.next=t,this.filename=e,this.lineNo=i}format(t){return t.formatTraceback(this)}}function Ce(s,t=c.Any){switch(t===c.Any&&(t=U(s)),t){case c.Integer:case c.Real:return s===0;case c.Boolean:return!s;case c.String:return!s.length;case c.Exception:return!1;case c.Nil:case c.Undef:return!0;default:throw new T(`Cannot determine if ${k.format(s)} is truthy`,s,t,c.Boolean)}}function v(s,t,e){throw new T(`Cannot cast ${t} to ${e}`,s,t,e)}function X(s,t,e){try{v(s,t,e)}catch(i){throw new b(`Cannot cast ${t} to ${e}`,i)}}function qi(s,t){switch(t){case c.Integer:return s;case c.Real:return s;case c.Boolean:return!!s;case c.String:return v(s,c.Integer,c.String);case c.Exception:return v(s,c.Integer,c.Exception);case c.Nil:return v(s,c.Integer,c.Nil)}return X(s,c.Integer,c.Unknown)}function Vi(s,t){switch(t){case c.Integer:return Math.floor(s);case c.Real:return s;case c.Boolean:return!!s;case c.String:return v(s,c.Real,c.String);case c.Exception:return v(s,c.Real,c.Exception);case c.Nil:return v(s,c.Real,c.Nil)}return X(s,c.Real,c.Unknown)}function Zi(s,t){switch(t){case c.Integer:return 1;case c.Real:return 1;case c.Boolean:return s;case c.String:return v(s,c.Boolean,c.String);case c.Exception:return v(s,c.Boolean,c.Exception);case c.Nil:return v(s,c.Boolean,c.Nil)}return X(s,c.Boolean,c.Unknown)}function Yi(s,t){switch(t){case c.Integer:return v(s,c.String,c.Integer);case c.Real:return v(s,c.String,c.Real);case c.Boolean:return!!s.length;case c.String:return s;case c.Exception:return v(s,c.String,c.Exception);case c.Nil:return v(s,c.String,c.Nil)}return X(s,c.String,c.Unknown)}function Xi(s,t){switch(t){case c.Integer:return v(s,c.Exception,c.Integer);case c.Real:return v(s,c.Exception,c.Real);case c.Boolean:return!0;case c.String:return v(s,c.Exception,c.String);case c.Exception:return s;case c.Nil:return v(s,c.Exception,c.Nil)}return X(s,c.Exception,c.Unknown)}function Me(s,t){switch(t){case c.Integer:return v(s,c.Nil,c.Integer);case c.Real:return v(s,c.Nil,c.Integer);case c.Boolean:return!1;case c.String:return v(s,c.Nil,c.String);case c.Exception:return v(s,c.Nil,c.Exception);case c.Nil:return s}return X(s,c.Nil,c.Unknown)}function He(s,t,e){switch(t===c.Any&&(t=U(s)),t){case c.Integer:return qi(s,e);case c.Real:return Vi(s,e);case c.Boolean:return Zi(s,e);case c.String:return Yi(s,e);case c.Exception:return Xi(s,e);case c.Nil:return Me(s,e);case c.Undef:return Me(z,e);default:return X(s,c.Unknown,c.Unknown)}}function Qi(s,t,e,i){var r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,o;if(typeof Reflect==\"object\"&&typeof Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);return r>3&&n&&Object.defineProperty(t,e,n),n}function qe(s,t){if(typeof Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return Reflect.metadata(s,t)}function Ve(s){switch(s){case c.Boolean:return 0;case c.Integer:return 1;case c.Real:return 2;case c.String:return 3;default:return 4}}function Ki(s,t){return Ve(s)>Ve(t)?s:t}let et=class extends Error{constructor(){super(\"Invalid\"),Object.setPrototypeOf(this,new.target.prototype)}};et=Qi([m(\"Invalid\"),qe(\"design:type\",Function),qe(\"design:paramtypes\",[])],et);function _(){throw new et}function $t(s){return function(e,i){const r=U(e),n=U(i),o=Ki(r,n),h=He(e,r,o),f=He(i,n,o);let g;try{switch(o){case c.Boolean:g=\"boolean\";break;case c.Integer:g=\"integer\";break;case c.Real:g=\"real\";break;case c.String:g=\"string\";break;default:_()}return s.check&&s.check(e,r,h,i,n,f,o),s[g](h,f)}catch(p){throw p instanceof et?new T(`Invalid operand for ${s.name} on ${r}: ${n}`,i,n,c.Invalid):p}}}function tr(s){return function(e){const i=U(e);try{switch(i){case c.Boolean:return s.boolean(e);case c.Integer:return s.integer(e);case c.Real:return s.real(e);case c.String:return s.string(e);default:_()}}catch(r){throw r instanceof et?new T(`Invalid operand for ${s.name}: ${i}`,e,i,c.Invalid):r}}}function st(s){return function(e,i){const r=U(e),n=U(i);try{if(r!=n)return s.any(e,r,i,n);switch(r){case c.Boolean:return s.boolean(e,i);case c.Integer:return s.integer(e,i);case c.Real:return s.real(e,i);case c.String:return s.string(e,i);default:_()}}catch(o){throw o instanceof et?new T(`Invalid operand for ${s.name} on ${r}: ${n}`,i,n,c.Invalid):o}}}const er=$t({name:\"+\",boolean:(s,t)=>s?t?2:1:t?1:0,integer:(s,t)=>s+t,real:(s,t)=>s+t,string:(s,t)=>s+t}),sr=$t({name:\"-\",boolean:(s,t)=>s?t?0:1:t?-1:0,integer:(s,t)=>s-t,real:(s,t)=>s-t,string:(s,t)=>_()}),ir=$t({name:\"*\",boolean:(s,t)=>s&&t,integer:(s,t)=>s*t,real:(s,t)=>s*t,string:(s,t)=>_()}),rr=$t({name:\"/\",check:(s,t,e,i,r,n,o)=>{if(!n)throw new Jt(s,t,i,r)},boolean:(s,t)=>s?1:0,integer:(s,t)=>s/t,real:(s,t)=>s/t,string:(s,t)=>_()}),nr=tr({name:\"-\",boolean:s=>s?-1:0,integer:s=>-s,real:s=>-s,string:s=>_()}),ar=st({name:\"==\",any:(s,t,e,i)=>!1,boolean:(s,t)=>s===t,integer:(s,t)=>s===t,real:(s,t)=>s===t,string:(s,t)=>s===t}),or=st({name:\"<>\",any:(s,t,e,i)=>!0,boolean:(s,t)=>s!==t,integer:(s,t)=>s!==t,real:(s,t)=>s!==t,string:(s,t)=>s!==t}),cr=st({name:\">\",any:(s,t,e,i)=>_(),boolean:(s,t)=>s>t,integer:(s,t)=>s>t,real:(s,t)=>s>t,string:(s,t)=>s>t}),hr=st({name:\">=\",any:(s,t,e,i)=>_(),boolean:(s,t)=>s>=t,integer:(s,t)=>s>=t,real:(s,t)=>s>=t,string:(s,t)=>s>=t}),lr=st({name:\"<\",any:(s,t,e,i)=>_(),boolean:(s,t)=>s<t,integer:(s,t)=>s<t,real:(s,t)=>s<t,string:(s,t)=>s<t}),ur=st({name:\"<=\",any:(s,t,e,i)=>_(),boolean:(s,t)=>s<=t,integer:(s,t)=>s<=t,real:(s,t)=>s<=t,string:(s,t)=>s<=t});function fr(s){const t=U(s);try{return Ce(s,t)}catch(e){throw e instanceof T?new T(`Invalid operand for not: ${t}`,s,t,c.Invalid):e}}class pr{host;executor;stack;pc=-1;chunk=new Qt;globals={};constructor(t,e){this.host=t,this.executor=e,this.stack=new ze}reset(){this.stack=new ze,this.chunk=new Qt,this.pc=0}async using(t){const e=this.chunk,i=this.pc,r=await t();return this.chunk=e,this.pc=i,r}async interpret(t){return this.chunk=t,this.pc=0,await this.run()}readByte(){const t=this.chunk.code[this.pc];return this.pc++,t}readCode(){return this.readByte()}readConstant(){return this.chunk.constants[this.readByte()]}readShort(){return vi([this.readByte(),this.readByte()])}readString(){const t=this.readConstant();return It.equal(typeof t,\"string\",\"Value is string\"),t}createTraceback(){return new Hi(null,this.chunk.filename,this.chunk.lines[this.pc-1])}async command(){const t=[];let e=this.readByte();for(;e>1;)t.unshift(this.stack.pop()),e--;const i=this.stack.pop();await this.executor.command(i,t)}async run(){let t=null,e=null;try{for(;;){const i=this.readCode();switch(i){case l.Constant:this.stack.push(this.readConstant());break;case l.Nil:this.stack.push(z);break;case l.Undef:this.stack.push(Ee);break;case l.True:this.stack.push(!0);break;case l.False:this.stack.push(!1);break;case l.Pop:this.stack.pop();break;case l.GetLocal:t=this.readByte(),this.stack.push(this.stack.peek(t));break;case l.SetLocal:t=this.readByte(),this.stack.set(t,this.stack.peek());break;case l.GetGlobal:if(t=this.readString(),e=this.globals[t],typeof e>\"u\")throw new ot(`Variable ${t} is undefined`);this.stack.push(e);break;case l.DefineGlobal:if(t=this.readString(),e=this.stack.peek(),typeof this.globals[t]<\"u\")throw new ot(`Cannot define variable ${t} twice`);this.globals[t]=e,this.stack.pop();break;case l.SetGlobal:if(t=this.readString(),e=this.stack.peek(),typeof this.globals[t]>\"u\")throw new ot(`Cannot assign to undefined variable ${t}`);this.globals[t]=e;break;case l.Eq:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(ar(t,e));break;case l.Gt:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(cr(t,e));break;case l.Ge:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(hr(t,e));break;case l.Lt:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(lr(t,e));break;case l.Le:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(ur(t,e));break;case l.Ne:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(or(t,e));break;case l.Not:t=this.stack.pop(),this.stack.push(fr(t));break;case l.Add:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(er(t,e));break;case l.Sub:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(sr(t,e));break;case l.Mul:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(ir(t,e));break;case l.Div:e=this.stack.pop(),t=this.stack.pop(),this.stack.push(rr(t,e));break;case l.Neg:t=this.stack.pop(),this.stack.push(nr(t));break;case l.Print:this.host.writeLine(this.stack.pop());break;case l.Exit:return t=this.stack.pop(),typeof t==\"number\"?e=Math.floor(t):ut(t)?e=0:t?e=1:e=0,this.host.exit(e),Ee;case l.Command:await this.command();break;case l.Jump:t=this.readShort(),this.pc+=t;break;case l.JumpIfFalse:t=this.readShort(),e=this.stack.peek(),Ce(e)&&(this.pc+=t);break;case l.Loop:t=this.readShort(),this.pc-=t;break;case l.Return:return t=this.stack.pop(),t;default:It.ok(this.pc<this.chunk.code.length,\"Program counter out of bounds\"),this.notImplemented(`Unknown opcode: ${i}`)}}}catch(i){let r=i;throw i instanceof A?i:(i instanceof W||(r=b.fromError(i)),r.traceback=this.createTraceback(),r)}}notImplemented(t){throw new Gt(t)}}const mr=Bt.version.split(\".\").slice(0,2).join(\".\");let re=null;const Ze=new Set(\"01234567\".split(\"\")),dr=6;function Ye(s,t){return re===null&&(re=new RegExp(`^${t.homedir()}`)),s.replace(re,\"~\")}class gr{ps1;historyFileSize;host;constructor(t,e,i){this.ps1=t,this.historyFileSize=e,this.host=i}render(t){let e=\"\",i=0,r=null;const n=()=>{const f=r||this.host.now();return r=f,f},o=()=>(i++,this.ps1[i-1]),h=()=>i>=this.ps1.length;for(;i<this.ps1.length;){const f=o();if(f===\"\\\\\"){if(h())return e+\"\\\\\";const g=o();let p=\"\",R=null;switch(g){case\"d\":e+=Q(\"%a %b %d\",n());break;case\"D\":if(this.ps1[i]!==\"{\"){e+=`\\\\D${o()}`;break}for(o();!h()&&this.ps1[i]!==\"}\";)p+=o();h()||o(),p.length||(p=\"%H:%M:%S\"),e+=Q(p,n());break;case\"h\":e+=this.host.hostname().split(\".\")[0];break;case\"H\":e+=this.host.hostname();break;case\"j\":e+=\"0\";break;case\"l\":R=this.host.tty(),R?e+=oe(R):e+=\"cons0\";break;case\"s\":e+=this.host.shell();break;case\"t\":e+=Q(\"%H:%M:%S\",n());break;case\"T\":e+=Q(\"%I:%M:%S\",n());break;case\"@\":e+=Q(\"%I:%M %p\",n());break;case\"A\":e+=Q(\"%H:%M\",n());break;case\"u\":e+=this.host.username();break;case\"v\":e+=mr;break;case\"V\":e+=Bt.version;break;case\"w\":e+=Ye(this.host.cwd,this.host);break;case\"W\":e+=Ye(oe(this.host.cwd),this.host);break;case\"!\":e+=t+this.historyFileSize+1;break;case\"#\":e+=t+1;break;case\"$\":e+=this.host.uid()===0?\"#\":\"$\";break;case\"\\\\\":e+=\"\\\\\";break;case\"[\":case\"]\":break;default:if(Ze.has(g)){let x=g,u=1;for(;Ze.has(this.ps1[i])&&u<dr;)x+=o(),u++;if(x.length<3){e+=`\\\\${x}`;break}const F=parseInt(x,8);e+=String.fromCharCode(F);break}e+=`\\\\${g}`}}else e+=f}return e}}function wr(s,t,e,i){var r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,o;if(typeof Reflect==\"object\"&&typeof Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);return r>3&&n&&Object.defineProperty(t,e,n),n}function Xe(s,t){if(typeof Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return Reflect.metadata(s,t)}function vr(s,t){return function(e,i){t(e,i,s)}}class wt{config;editor;host;parser;runtime;_readline;history;ps1;cmdNo=0;interactive;commands;_deferred=[];constructor(t,e,i){this.config=t,this.editor=e,this.host=i,this.parser=new ie,this.runtime=new pr(i,this),this._readline=null,this.history=[],this.ps1=new gr(\"\\\\u@\\\\h:\\\\w\\\\$\",this.config.historyFileSize,i),this.interactive=!1,this.commands={...di}}async init(){await this.close(!1),await this.loadHistory(),this.readline=this.createInterface(),this.readline.on(\"SIGINT\",()=>{this.host.writeError(`\n`),this.host.writeDebug(\"Received SIGINT (ctrl-c)\"),this.close()}),this.readline.on(\"history\",t=>{this.history=t})}async close(t=!0){let e=Promise.resolve();if(this._readline){const i=this._readline;e=new Promise((r,n)=>{i.once(\"close\",()=>{r()})}),this._readline.close()}return Promise.all([e,t?this.saveHistory():Promise.resolve()]).then(()=>{})}async using(t){await this.init();try{await t()}finally{await this.close()}}get readline(){return this._readline===null&&(this._readline=this.createInterface()),this._readline}set readline(t){this._readline=t}createInterface(){return ps.createInterface({input:this.host.inputStream,output:this.host.outputStream,terminal:!0,history:this.history,historySize:this.config.historySize})}get historyFile(){return rt.join(this.host.homedir(),\".matbas_history\")}async loadHistory(){try{this.history=(await this.host.readFile(this.historyFile)).split(`\n`)}catch(t){t.code!==\"ENOENT\"?this.host.writeWarn(t):this.host.writeDebug(t)}}async saveHistory(){const t=Math.max(this.history.length-this.config.historyFileSize,0),e=this.history.slice(t);try{await this.host.writeFile(this.historyFile,e.join(`\n`))}catch(i){this.host.writeWarn(i)}}input(t){return this.readline.question(`${t} > `)}async prompt(){const t=await this.readline.question(`${this.ps1.render(this.cmdNo)} `);return this.cmdNo++,t}defer(t){this._deferred.push(t)}async load(t){const e=await this.host.readFile(t);let i;try{i=this.parser.parseProgram(e,this.host.resolvePath(t))}catch(o){throw o instanceof B?o:b.fromException(o)}const[r,n]=i;this.editor.program=r,this.editor.warning=n}async run(){const t=this.editor.program,e=this.editor.warning,i=t.filename;let r,n;try{const o=Li(t,{filename:i});r=o[0],n=o[1]}catch(o){let h=o;if(o instanceof L&&(h=tt([e,o])),h instanceof B){this.host.writeException(o);return}throw h}n=tt([e,n]),n&&this.host.writeWarn(n),await this.runtime.using(async()=>{const o=this.interactive;this.interactive=!1,await this.runtime.interpret(r),this.interactive=o})}async eval(t){const[e,i]=this.parser.parseInput(t),r=Ys(i,\"row\");for(const n of e.input){const o=r[n.row]||null;n instanceof Wt?(o&&this.host.writeWarn(o),this.editor.setLine(n,o)):await this._eval([n,o])}this.runDeferred()}async _eval([t,e]){let i=null;try{const r=Si(t.instructions,{filename:\"<input>\",cmdNo:t.cmdNo,cmdSource:t.source}),n=r[0];i=r[1],i=tt([e,i]),i&&this.host.writeWarn(i);const o=n.pop();for(const h of n)await this.runtime.interpret(h);if(o){const h=await this.runtime.interpret(o);h instanceof qt||this.host.writeLine(Zs.format(h))}}catch(r){let n=r;throw r instanceof L&&(n=tt([e,r])),n}}async runDeferred(){for(const t of this._deferred)await t();this._deferred=[]}async command(t,e){const i=this.commands[t];if(!i)throw new $(`Unknown command ${t}`);const r=new ai(t,this,this.host,this.interactive?this.editor:null);await i.main(r,e)}}wt=wr([it(),vr(2,yt(\"Host\")),Xe(\"design:type\",Function),Xe(\"design:paramtypes\",[typeof O>\"u\"?Object:O,typeof dt>\"u\"?Object:dt,typeof Host>\"u\"?Object:Host])],wt);function yr(s,t,e,i){var r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,o;if(typeof Reflect==\"object\"&&typeof Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);return r>3&&n&&Object.defineProperty(t,e,n),n}function Qe(s,t){if(typeof Reflect==\"object\"&&typeof Reflect.metadata==\"function\")return Reflect.metadata(s,t)}function Ke(s,t){return function(e,i){t(e,i,s)}}async function br(s,t){for(s.interactive=!0;;)try{const e=await s.prompt();await s.eval(e)}catch(e){if(e instanceof lt||e instanceof A)throw e;if(e instanceof W){t.writeException(e);return}throw b.fromError(e,null)}s.interactive=!1}class _t{host;exit;config;executor;constructor(t,e,i,r){this.host=t,this.exit=e,this.config=i,this.executor=r}async start(){const{host:t,exit:e,config:i,executor:r}=this;let n=null;t.setLevel(i.level);function o(f){e(typeof f.exitCode==\"number\"?f.exitCode:w.Software)}function h(f){ts(f,t),o(f)}process.on(\"uncaughtException\",h),process.on(\"unhandledRejection\",h);try{await r.using(async()=>{i.script?(await r.load(i.script),await r.run()):await br(r,t)})}catch(f){ts(f,t),n=f}if(process.removeListener(\"uncaughtException\",h),process.removeListener(\"unhandledRejection\",h),n){o(n);return}e(0)}}_t=yr([it(),Ke(0,yt(\"Host\")),Ke(1,yt(\"exitFn\")),Qe(\"design:type\",Function),Qe(\"design:paramtypes\",[typeof Host>\"u\"?Object:Host,typeof ExitFn>\"u\"?Object:ExitFn,typeof O>\"u\"?Object:O,typeof wt>\"u\"?Object:wt])],_t);function ts(s,t){if(s instanceof Lt&&t.writeLine(s),s instanceof A){s.message.length&&t.writeLine(s.message);return}if(s.format)try{t.writeException(s)}catch{const i=b.fromError(s,null);t.writeException(i)}else{const e=b.fromError(s,null);t.writeException(e)}}function Ir(s,t,e,i){var r=arguments.length,n=r<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,o;if(typeof Reflect==\"object\"&&typeof Reflect.decorate==\"function\")n=Reflect.decorate(s,t,e,i);else for(var h=s.length-1;h>=0;h--)(o=s[h])&&(n=(r<3?o(n):r>3?o(t,e,n):o(t,e))||n);return r>3&&n&&Object.defineProperty(t,e,n),n}async function Er(s){process.exit(s)}function xr(s,t){try{return O.load(s,t)}catch(e){throw e instanceof A&&(e.message.length&&console.log(e.message),process.exit(e.exitCode)),e}}class ne{}ne=Ir([ss({providers:[{provide:\"argv\",useValue:process.argv.slice(2)},{provide:\"env\",useValue:process.env},{provide:\"exitFn\",useValue:Er},{provide:O,useFactory:xr,inject:[\"argv\",\"env\"]},{provide:\"Host\",useClass:Zt},dt,wt,_t]})],ne);async function kr(){await(await is.createApplicationContext(ne,{logger:!1})).get(_t).start()}kr();\n//# sourceMappingURL=main.js.map\n"

#endif
