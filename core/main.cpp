#include "dist.h"
#include <QCoreApplication>
#include <QDebug>
#include <QJSEngine>
#include <QJSValue>

int main(int argc, char *argv[]) {
  QCoreApplication a(argc, argv);

  QJSEngine engine;

  QJSValue result = engine.evaluate(DIST);

  if (result.isError()) {
    qWarning() << "Flagrant error:" << result.toString();
    return 1;
  }

  qDebug() << result.toString();
  return 0;
}
