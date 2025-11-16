#include "dist.h"
#include <QCoreApplication>
#include <QDebug>
#include <QJSEngine>
#include <QJSValue>
#include <QString>

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

  engine.installExtensions(QJSEngine::ConsoleExtension);

  QJSValue result = engine.evaluate(DIST);

  logResult(result);

  return 0;
}
