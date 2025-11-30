10  rem Some example functions
20
30  rem "Short" function
40  def add(a%, b%) a + b enddef
50
60  rem Multi-line function
70  def hello()
80    print "hello world!"
90  enddef
100
110 rem Lambda
120 let sub = def(a%, b%) (a% - b%) enddef
130
140 print add(1, 1)
150 hello()
160 print sub(2, 1)
