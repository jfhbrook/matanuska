#include "dist.h"
#include <QCoreApplication>
#include <QDebug>
#include <QJSEngine>
#include <QJSValue>
#include <QString>

/*

Uncaught Error: ponyyy
    at foo (REPL1:1:24)

 * file:///Users/josh/code/jfhbrook/matanuska/test.js:6
  throw new Error('ponyyy');
        ^

Error: ponyyy
    at bar (file:///Users/josh/code/jfhbrook/matanuska/test.js:6:9)
    at foo (file:///Users/josh/code/jfhbrook/matanuska/test.js:2:3)
    at file:///Users/josh/code/jfhbrook/matanuska/test.js:9:1
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__
(node:internal/modules/esm/loader:671:26) at async
asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)
*/

void logResult(QJSValue result) {
  QDebug warn = qWarning();
  warn.noquote();

  if (result.isError()) {
    warn << result.toString() << "\n";

    QJSValue lineNumber = result.property("lineNumber");

    QJSValue stackTrace = result.property("stack");

    if (lineNumber.isNumber()) {
      warn << "Line:" << lineNumber.toInt() << "\n";
    }
    if (stackTrace.isString()) {
      warn << "Stack:\n" << stackTrace.toString() << "\n";
    }
  }
}

int main(int argc, char *argv[]) {
  QCoreApplication a(argc, argv);

  QJSEngine engine;

  QJSValue result = engine.evaluate(DIST);

  logResult(result);

  return 0;
}
