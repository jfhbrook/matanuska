// yabasic inlines basic command execution in this file. I would probably want
// to move it to a command.rs. but let's document what that would actually
// entail here.
//
// Basically, there's a little VM that eats up little commands, which are
// generated by evaluating statements/expressions. The code for this looks like
// a big ol' switch/case statement. In other words, a big match statement.

mod ast;
mod lexer;
mod parser;
mod tokens;

fn main() {
    println!("Hello, world!");
}
