export enum OpCode {
  // Constants and values
  Constant,
  Nil,
  True,
  False,
  Pop,
  GetLocal,
  SetLocal,
  GetGlobal,
  DefineGlobal,
  SetGlobal,

  // Operators
  //
  // TODO: BASIC is typed - we can check the types in the compiler and use
  // typed op codes. However, this requires tracking the state of the stack
  // in the compiler. I'm keeping the opcodes untyped for now, just to get
  // something working, but would like to switch to typed opcodes later.

  // Comparison operators
  Eq,
  Gt,
  Ge,
  Lt,
  Le,
  Ne,

  // Operators
  Not,
  Add,
  Sub,
  Mul,
  Div,
  Neg,

  // Commands
  Print,
  Exit,

  // Jumping
  Jump,
  JumpIfFalse,
  Loop,

  Return,
}
