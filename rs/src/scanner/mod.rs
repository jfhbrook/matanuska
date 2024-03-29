// This file will contain the lexer - ie, functions for taking &str input and
// converting it into a collection of Tokens. The parser will then convert
// those tokens into expressions, statements, and so on.
//
// This is basically ready for an attempt at writing a parser!

use nom::{
    branch::alt,
    bytes::complete::{tag, tag_no_case, take_till, take_while},
    character::complete::{anychar, digit1, line_ending, space0, space1},
    character::{is_alphabetic, is_alphanumeric},
    combinator::{map, map_res, opt, peek, recognize},
    multi::{many0, many1, many_till, separated_list0, separated_list1},
    sequence::{delimited, pair, preceded, terminated, tuple},
    IResult,
};
use nom_locate::position;

mod numbers;
mod strings;

use crate::tokens::{Ident, LocatedToken, Span, Token};
use numbers::{digits, float};
use strings::string_literal;

// TODO: This is the name monkey-rust gives this type of macro. I don't really
// like the name - maybe workshop it a bit?
macro_rules! syntax {
    ($func_name: ident, $tag_string: literal, $output_token: expr) => {
        fn $func_name<'a>(s: Span<'a>) -> IResult<Span<'a>, Token> {
            map(tag_no_case($tag_string), |_| $output_token)(s)
        }
    };
    ($func_name: ident, $parser: expr, $output_token: expr) => {
        fn $func_name<'a>(s: Span<'a>) -> IResult<Span<'a>, Token> {
            map($parser, |_| $output_token)(s)
        }
    };
}

fn name(input: Span) -> IResult<Span, Ident> {
    // first character can't be a number
    let starts_with = take_while(|c: char| is_alphabetic(c as u8) || c == '_');
    // subsequent characters CAN include numbers
    let followed_by = take_while(|c: char| is_alphanumeric(c as u8) || c == '_');

    let simple_name = map(recognize(pair(starts_with, followed_by)), |n: Span| {
        n.fragment().to_string()
    });

    map(separated_list1(tag("."), simple_name), |names| {
        Ident::new(names)
    })(input)
}

// colons separate multiple instructions within a command.
syntax!(sep, ":", Token::Sep);

// Used to get everything until the end of the line. We take pains not to
// consume \n or \r\n so that those are parsed as separators.
fn until_line_ending(input: Span) -> IResult<Span, Span> {
    // TODO: test for happy path
    // TODO: test for immediate line ending
    // TODO: how to handle end-of-input?
    //   - assume input is complete and read rest
    //   - return incomplete and wait for a line ending
    //   - might be able to use flags w/ cond
    //   - may be most straightforward with a stateful Vec<Token> parser
    recognize(many_till(opt(anychar), line_ending))(input)
}

fn rem(input: Span) -> IResult<Span, Token> {
    preceded(
        tag_no_case("REM"),
        alt((
            map(recognize(pair(space1, until_line_ending)), |rem: Span| {
                let mut rem = rem.fragment().to_string();
                // first space is significant whitespace
                rem.remove(0);
                Token::Rem(rem)
            }),
            map(peek(line_ending), |_: Span| Token::Rem(String::new())),
        )),
    )(input)
}

// slash-style comments
fn comment(input: Span) -> IResult<Span, Token> {
    map(
        preceded(alt((tag("//"), tag("#"), tag("'"))), until_line_ending),
        |comment: Span| Token::Comment(comment.fragment().to_string()),
    )(input)
}

// NOTE: yabasic emits three tokens for this: a Label, a Ident and a Sep. In
// our case, we emit a single Import token.
fn import(input: Span) -> IResult<Span, Token> {
    // NOTE: yabasic either consumes a newline or injects a separator after
    // matching an import statement
    map(
        preceded(pair(tag_no_case("import"), space1), name),
        |name| Token::Import(name),
    )(input)
}

fn docu(input: Span) -> IResult<Span, Token> {
    map(
        preceded(
            pair(
                alt((
                    tag_no_case("DOCU"),
                    tag_no_case("DOC"),
                    tag_no_case("DOCUMENTATION"),
                )),
                space1,
            ),
            until_line_ending,
        ),
        |docu| Token::Docu(docu.fragment().to_string()),
    )(input)
}

syntax!(execute, "EXECUTE", Token::Execute);
syntax!(execute2, "EXECUTE$", Token::Execute2);
syntax!(compile, "COMPILE", Token::Compile);
syntax!(eval, "EVAL", Token::Eval);
syntax!(eval2, "EVAL$", Token::Eval2);
syntax!(
    runtime_created_sub,
    "RUNTIME_CREATED_SUB",
    Token::RuntimeCreatedSub
);
syntax!(
    end_sub,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("SUB")
    )),
    Token::EndSub
);
syntax!(
    end_if,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("IF")
    )),
    Token::EndIf
);
// TODO: ick
syntax!(fi, "FI", Token::EndIf);
syntax!(
    end_while,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("WHILE")
    )),
    Token::EndWhile
);
// TODO: ick
syntax!(wend, "WEND", Token::EndWhile);
syntax!(
    end_switch,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("SWITCH")
    )),
    Token::EndSwitch
);
syntax!(export, "EXPORT", Token::Export);
syntax!(error, "ERROR", Token::Error);
syntax!(for_, "FOR", Token::For);
syntax!(break_, "BREAK", Token::Break);
syntax!(switch, "SWITCH", Token::Switch);
syntax!(case, "CASE", Token::Case);
syntax!(default, "DEFAULT", Token::Default);
syntax!(loop_, "LOOP", Token::Loop);
syntax!(do_, "DO", Token::Do);
syntax!(to, "TO", Token::To);
syntax!(as_, "AS", Token::As);
syntax!(reading, "READING", Token::Reading);
syntax!(writing, "WRITING", Token::Writing);
syntax!(step, "STEP", Token::Step);
syntax!(next, "NEXT", Token::Next);
syntax!(while_, "WHILE", Token::While);
syntax!(repeat, "REPEAT", Token::Repeat);
syntax!(until, "UNTIL", Token::Until);
syntax!(goto, "GOTO", Token::Goto);
syntax!(gosub, "GOSUB", Token::Gosub);
syntax!(
    sub,
    alt((tag_no_case("SUBROUTINE"), tag_no_case("SUB"))),
    Token::Sub
);
syntax!(local, "LOCAL", Token::Local);
syntax!(static_, "STATIC", Token::Static);
syntax!(on, "ON", Token::On);
syntax!(interrupt, "INTERRUPT", Token::Interrupt);
syntax!(continue_, "CONTINUE", Token::Continue);
syntax!(label, "LABEL", Token::Label);
syntax!(if_, "IF", Token::If);
syntax!(then_, "THEN", Token::Then);
syntax!(else_, "ELSE", Token::Else);
syntax!(
    elsif,
    alt((tag_no_case("ELSIF"), tag_no_case("ELSEIF"))),
    Token::Elsif
);
syntax!(open, "OPEN", Token::Open);
syntax!(close, "CLOSE", Token::Close);
syntax!(seek, "SEEK", Token::Seek);
syntax!(tell, "TELL", Token::Tell);
// TODO: ick
syntax!(print, alt((tag_no_case("PRINT"), tag("\\?"))), Token::Print);
syntax!(using, "USING", Token::Using);
syntax!(reverse, "REVERSE", Token::Reverse);
syntax!(
    color,
    alt((tag_no_case("COLOR"), tag_no_case("COLOUR"))),
    Token::Color
);
syntax!(
    backcolor,
    alt((tag_no_case("BACKCOLOR"), tag_no_case("BACKCOLOUR"))),
    Token::BackColor
);
syntax!(input, "INPUT", Token::Input);
syntax!(return_, "RETURN", Token::Return);
// TODO: what is REDIM?
syntax!(
    dim,
    alt((tag_no_case("DIM"), tag_no_case("REDIM"))),
    Token::Dim
);
// NOTE: This must come AFTER other end-ish lexers
syntax!(end, "END", Token::End);
syntax!(exit, "EXIT", Token::Exit);
syntax!(read, "READ", Token::Read);
syntax!(data, "DATA", Token::Data);
syntax!(restore, "RESTORE", Token::Restore);
syntax!(and, "AND", Token::And);
syntax!(or, "OR", Token::Or);
// TODO: Can I use more C-like syntax for bitwise not?
syntax!(bitnot, "BITNOT", Token::BitNot);
syntax!(eor, "EOR", Token::EOr);
syntax!(xor, "XOR", Token::XOr);
// TODO: What are these? lol
syntax!(shl, "SHL", Token::Shl);
syntax!(shr, "SHR", Token::Shr);
syntax!(window, "WINDOW", Token::Window);
syntax!(origin, "ORIGIN", Token::Origin);
syntax!(printer, "PRINTER", Token::Printer);
syntax!(dot, "DOT", Token::Dot);
syntax!(line_, "LINE", Token::Line);
syntax!(curve, "CURVE", Token::Curve);
syntax!(circle, "CIRCLE", Token::Circle);
syntax!(triangle, "TRIANGLE", Token::Triangle);
syntax!(clear, "CLEAR", Token::Clear);
syntax!(
    fill,
    alt((tag_no_case("FILLED"), tag_no_case("FILL"))),
    Token::Fill
);
syntax!(text, "TEXT", Token::Text);
// TODO: This is an entirely unreasonable number of ways to spell these lmao
syntax!(
    rectangle,
    alt((
        tag_no_case("RECTANGLE"),
        tag_no_case("RECT"),
        tag_no_case("BOX")
    )),
    Token::Rect
);
syntax!(
    put_bit,
    alt((
        tag_no_case("BITBLIT"),
        tag_no_case("BITBLT"),
        tag_no_case("PUTBIT")
    )),
    Token::PutBit
);
syntax!(
    get_bit,
    alt((
        tag_no_case("BITBLIT$"),
        tag_no_case("BITBLT$"),
        tag_no_case("GETBIT$")
    )),
    Token::GetBit
);
syntax!(putchar, "PUTSCREEN", Token::PutChar);
syntax!(getchar, "GETSCREEN$", Token::GetChar);
syntax!(new, "NEW", Token::New);
syntax!(
    wait,
    alt((
        tag_no_case("WAIT"),
        tag_no_case("PAUSE"),
        tag_no_case("SLEEP")
    )),
    Token::Wait
);
syntax!(
    bell,
    alt((tag_no_case("BELL"), tag_no_case("BEEP"))),
    Token::Bell
);
syntax!(let_, "LET", Token::Let);
syntax!(
    ardim,
    alt((
        tag_no_case("ARRAYDIMENSION"),
        tag_no_case("ARRAYDIM"),
        tag_no_case("ARRAYSIZE")
    )),
    Token::ArDim
);
fn numparam(input: Span) -> IResult<Span, Token> {
    map(
        tuple((
            tag_no_case("NUMPARAM"),
            opt(tag_no_case("S")),
            opt(tuple((space0, tag("("), space0, tag(")")))),
        )),
        |_| Token::Ident(Ident::new(vec!["numparams".to_string()])),
    )(input)
}
syntax!(bind, "BIND", Token::Bind);

// TODO: Should these be functions?
syntax!(sin, "SIN", Token::Sin);
syntax!(asin, "ASIN", Token::Asin);
syntax!(cos, "COS", Token::Cos);
syntax!(acos, "ACOS", Token::Acos);
syntax!(tan, "TAN", Token::Tan);
syntax!(atan, "ATAN", Token::Atan);
syntax!(exp, "EXP", Token::Exp);
syntax!(log, "LOG", Token::Log);
syntax!(sqrt, "SQRT", Token::Sqrt);
syntax!(sqr, "SQR", Token::Sqr);
syntax!(int, "INT", Token::Int);
syntax!(ceil, "CEIL", Token::Ceil);
syntax!(floor, "FLOOR", Token::Floor);
syntax!(round, "ROUND", Token::Round);
syntax!(frac, "FRAC", Token::Frac);
syntax!(abs, "ABS", Token::Abs);
syntax!(sig, "SIG", Token::Sig);
syntax!(mod_, "MOD", Token::Mod);
// TODO: Random?
syntax!(ran, "RAN", Token::Ran);
syntax!(min, "MIN", Token::Min);
syntax!(max, "MAX", Token::Max);
syntax!(left, "LEFT$", Token::Left);
syntax!(right, "RIGHT$", Token::Right);
syntax!(mid, "MID$", Token::Mid);
syntax!(lower, "LOWER$", Token::Lower);
syntax!(upper, "UPPER$", Token::Upper);
syntax!(ltrim, "LTRIM$", Token::Ltrim);
syntax!(rtrim, "RTRIM$", Token::Rtrim);
syntax!(trim, "TRIM$", Token::Trim);
syntax!(instr, "INSTR", Token::Instr);
syntax!(rinstr, "RINSTR", Token::RInstr);
syntax!(chomp, "CHOMP$", Token::Chomp);
syntax!(len, "LEN", Token::Len);
syntax!(val, "VAL", Token::Val);
// TODO: This is not a good name for this lol
syntax!(my_eof, "EOF", Token::MyEof);
syntax!(str_, "STR$", Token::Str);
syntax!(inkey, "INKEY$", Token::InKey);
syntax!(mousex, "MOUSEX", Token::MouseX);
syntax!(mousey, "MOUSEY", Token::MouseY);
syntax!(
    mouseb,
    alt((tag_no_case("MOUSEBUTTON"), tag_no_case("MOUSEB"))),
    Token::MouseB
);
syntax!(
    mousemod,
    alt((tag_no_case("MOUSEMODIFIER"), tag_no_case("MOUSEMOD"))),
    Token::MouseMod
);
syntax!(chr_, "CHR$", Token::Chr);
syntax!(asc, "ASC", Token::Asc);
syntax!(hex, "HEX$", Token::Hex);
syntax!(bin, "BIN$", Token::Bin);
syntax!(dec, "DEC", Token::Dec);
syntax!(at, alt((tag_no_case("AT"), tag_no_case("@"))), Token::At);
syntax!(screen, "SCREEN", Token::Screen);
syntax!(system, "SYSTEM", Token::System);
syntax!(system2, "SYSTEM$", Token::System2);
syntax!(date, "DATE$", Token::Date);
syntax!(time, "TIME$", Token::Time);
syntax!(peek_, "PEEK", Token::Peek);
syntax!(poke, "POKE", Token::Poke);
syntax!(
    frnfn_call,
    alt((
        tag_no_case("FOREIGN_FUNCTION_CALL"),
        tag_no_case("FRNFN_CALL")
    )),
    Token::FrnfnCall
);
syntax!(
    frnfn_call2,
    alt((
        tag_no_case("FOREIGN_FUNCTION_CALL$"),
        tag_no_case("FRNFN_CALL$")
    )),
    Token::FrnfnCall2
);

syntax!(
    frnfn_size,
    alt((
        tag_no_case("FOREIGN_FUNCTION_SIZE"),
        tag_no_case("FRNFN_SIZE")
    )),
    Token::FrnfnSize
);
syntax!(
    frnbf_get,
    alt((tag_no_case("FOREIGN_BUFFER_GET"), tag_no_case("FRNBF_GET"))),
    Token::FrnbfGet
);
syntax!(
    frnbf_get2,
    alt((
        tag_no_case("FOREIGN_BUFFER_GET$"),
        tag_no_case("FRNBF_GET$")
    )),
    Token::FrnbfGet2
);
syntax!(
    frnbf_get_buffer,
    alt((
        tag_no_case("FOREIGN_BUFFER_GET_BUFFER$"),
        tag_no_case("FRNBF_GET_BUFFER$"),
    )),
    Token::FrnbfGetBuffer
);
syntax!(
    frnbf_set,
    alt((tag_no_case("FOREIGN_BUFFER_SET"), tag_no_case("FRNBF_SET"))),
    Token::FrnbfSet
);
syntax!(
    frnbf_set_buffer,
    alt((
        tag_no_case("FOREIGN_BUFFER_SET_BUFFER"),
        tag_no_case("FRNBF_SET_BUFFER")
    )),
    Token::FrnbfSetBuffer
);
syntax!(
    frnbf_alloc,
    alt((
        tag_no_case("FOREIGN_BUFFER_ALLOCATE$"),
        tag_no_case("FOREIGN_BUFFER_ALLOC$"),
        tag_no_case("FRNBF_ALLOC$")
    )),
    Token::FrnbfAlloc
);
syntax!(
    frnbf_dump,
    alt((
        tag_no_case("FOREIGN_BUFFER_DUMP$"),
        tag_no_case("FRNBF_DUMP")
    )),
    Token::FrnbfDump
);
syntax!(
    frnbf_size,
    alt((
        tag_no_case("FOREIGN_BUFFER_SIZE"),
        tag_no_case("FRNBF_SIZE")
    )),
    Token::FrnbfSize
);
syntax!(
    frnbf_free,
    alt((
        tag_no_case("FOREIGN_BUFFER_FREE"),
        tag_no_case("FRNBF_FREE")
    )),
    Token::FrnbfFree
);
syntax!(token_, "TOKEN", Token::Token);
syntax!(token2, "TOKEN$", Token::Token2);
syntax!(split, "SPLIT", Token::Split);
syntax!(split2, "SPLIT$", Token::Split2);
syntax!(glob, "GLOB", Token::Glob);
syntax!(pow, alt((tag("^"), tag("**"))), Token::Pow);
syntax!(ne, alt((tag("<>"), tag("!="))), Token::Ne);
syntax!(le, "<=", Token::Le);
syntax!(ge, ">-", Token::Ge);
syntax!(eq, "=", Token::Eq);
syntax!(eq2, "==", Token::Eq2);
syntax!(lt, "<", Token::Lt);
syntax!(gt, ">", Token::Gt);
syntax!(not, alt((tag("!"), tag_no_case("NOT"))), Token::Not);
syntax!(subtract, "-", Token::Subtract);
syntax!(add, "+", Token::Add);
syntax!(multiply, "*", Token::Multiply);
syntax!(divide, "/", Token::Divide);
syntax!(lparen, "(", Token::LParen);
syntax!(rparen, ")", Token::RParen);
syntax!(comma, ",", Token::Comma);
syntax!(period, ".", Token::Period);
syntax!(semicolon, ";", Token::Semicolon);

// TODO: Finish banging out all the basic syntax matchers - whew!

// TODO: Would rather encode these constants as Idents or tokens
fn pi(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("PI"), |_| Token::Num(std::f64::consts::PI))(input)
}

fn euler(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("EULER"), |_| Token::Num(std::f64::consts::E))(input)
}

fn true_(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("TRUE"), |_| Token::Bool(true))(input)
}

fn false_(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("FALSE"), |_| Token::Bool(false))(input)
}

fn bool_(input: Span) -> IResult<Span, Token> {
    alt((true_, false_))(input)
}

fn strsym(input: Span) -> IResult<Span, Token> {
    map(terminated(name, tag("$")), |sym| Token::StrSym(sym))(input)
}

fn symbol(input: Span) -> IResult<Span, Token> {
    map(name, |sym| Token::Ident(sym))(input)
}

fn illegal(input: Span) -> IResult<Span, Token> {
    map(take_till(|c: char| c.is_whitespace()), |s: Span| {
        Token::Illegal(s.fragment().to_string())
    })(input)
}

// giddyup!

// alts have a limited length, as they're implemented separately for each size
// of tuple. therefore, we need to break these up into groups of at most 13.
//
// TODO: Either (a) find a more sensible way to group these; or (b) write a
// macro that handles this problem better.
fn part_one(input: Span) -> IResult<Span, Token> {
    alt((
        // NOTE: line_no is currently indistinguishable from a digit at the
        // lexer level. yabasic solves this by carrying state at the lexer
        // level, but we'll need to manage that at the parser level.
        digits,
        rem,
        comment,
        sep,
        import,
        docu,
        execute,
        execute2,
        compile,
        eval,
        eval2,
        runtime_created_sub,
        end_sub,
    ))(input)
}

fn part_two(input: Span) -> IResult<Span, Token> {
    alt((
        end_if, fi, end_while, wend, end_switch, export, error, for_, break_, switch, case,
        default, loop_,
    ))(input)
}

fn part_three(input: Span) -> IResult<Span, Token> {
    alt((
        do_, to, as_, reading, writing, step, next, while_, repeat, until, goto, gosub, sub,
    ))(input)
}

fn part_four(input: Span) -> IResult<Span, Token> {
    alt((
        local, static_, on, interrupt, continue_, label, if_, then_, else_, elsif, open, close,
        seek,
    ))(input)
}

fn part_five(input_: Span) -> IResult<Span, Token> {
    alt((
        tell, print, using, reverse, color, backcolor, input, return_, dim, end, exit, read, data,
    ))(input_)
}

fn part_six(input: Span) -> IResult<Span, Token> {
    alt((
        restore, and, or, bitnot, eor, xor, shl, shr, window, origin, printer, dot, line_,
    ))(input)
}

fn part_seven(input: Span) -> IResult<Span, Token> {
    alt((
        curve, circle, triangle, clear, fill, text, rectangle, put_bit, get_bit, putchar, getchar,
        new, wait,
    ))(input)
}

fn part_eight(input: Span) -> IResult<Span, Token> {
    alt((
        bell, ardim, numparam, bind, sin, asin, cos, acos, tan, atan, exp, log, sqrt,
    ))(input)
}

fn part_nine(input: Span) -> IResult<Span, Token> {
    alt((
        sqr, int, ceil, floor, round, frac, abs, sig, mod_, ran, min, max, left,
    ))(input)
}

fn part_ten(input: Span) -> IResult<Span, Token> {
    alt((
        right, mid, lower, upper, ltrim, rtrim, trim, instr, rinstr, chomp, len, val, my_eof,
    ))(input)
}

fn part_eleven(input: Span) -> IResult<Span, Token> {
    alt((
        str_,
        inkey,
        mousex,
        mousey,
        float,
        digits,
        pi,
        euler,
        bool_,
        strsym,
        symbol,
        string_literal,
        mouseb,
    ))(input)
}

fn part_twelve(input: Span) -> IResult<Span, Token> {
    alt((
        mousemod, chr_, asc, hex, bin, dec, at, screen, system, system2, date, time, peek_,
    ))(input)
}

fn part_thirteen(input: Span) -> IResult<Span, Token> {
    alt((
        poke,
        frnfn_call,
        frnfn_call2,
        frnfn_size,
        frnbf_get,
        frnbf_get2,
        frnbf_get_buffer,
        frnbf_set,
        frnbf_set_buffer,
        frnbf_alloc,
        frnbf_dump,
        frnbf_size,
        frnbf_free,
    ))(input)
}

fn part_fourteen(input: Span) -> IResult<Span, Token> {
    alt((
        token_, token2, split, split2, glob, pow, ne, le, ge, eq, eq2, lt, gt,
    ))(input)
}

fn part_fifteen(input: Span) -> IResult<Span, Token> {
    alt((
        not, subtract, add, multiply, divide, lparen, rparen, comma, period, semicolon,
    ))(input)
}

fn token(input: Span) -> IResult<Span, LocatedToken> {
    let (s, position) = position(input)?;
    let (s, token) = alt((
        part_one,
        part_two,
        part_three,
        part_four,
        part_five,
        part_six,
        part_seven,
        part_eight,
        part_nine,
        part_ten,
        part_eleven,
        part_twelve,
        part_thirteen,
        part_fourteen,
        part_fifteen,
        illegal,
    ))(s)?;

    Ok((s, LocatedToken { token, position }))
}

// any tokens which can show up in a command. this does not include line
// numbers or newlines.
pub fn command(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    many0(delimited(space0, token, space0))(input)
}

// properly scanning a line requires maintaining state - that is, knowing if
// you're at the beginning of a line. yabasic handles this by maintaining
// state in global variables. here, I get a little fancier with the
// combinators.

// a line number looks a heck of a lot like a decimal integer, but the type
// is constrained to a u16 and is only looked for at the beginning of a line.
fn line_no(input: Span) -> IResult<Span, LocatedToken> {
    let (s, position) = position(input)?;
    let (s, token) = map(
        map_res(digit1, |s: Span| s.fragment().parse::<u16>()),
        |n: u16| Token::LineNo(n),
    )(s)?;

    Ok((s, LocatedToken { token, position }))
}

// double line endings are used by yabasic to trigger state changes in the
// repl. I'm not sure we'll need anything similar, but we support parsing
// these as a separate case for now.
fn double_line_ending(input: Span) -> IResult<Span, LocatedToken> {
    let (s, position) = position(input)?;
    let (s, _) = pair(line_ending, line_ending)(s)?;

    Ok((
        s,
        LocatedToken {
            token: Token::DoubleLineEnding,
            position,
        },
    ))
}

fn single_line_ending(input: Span) -> IResult<Span, LocatedToken> {
    let (s, position) = position(input)?;
    let (s, _) = line_ending(s)?;

    Ok((
        s,
        LocatedToken {
            token: Token::SingleLineEnding,
            position,
        },
    ))
}

// these public, since there may be novel cases where I want to parse
// line endings outside of the supplied combinators.
pub fn line_endings0(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    many0(delimited(
        space0,
        alt((double_line_ending, single_line_ending)),
        space0,
    ))(input)
}

pub fn line_endings1(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    many1(delimited(
        space0,
        alt((double_line_ending, single_line_ending)),
        space0,
    ))(input)
}

// a line is made up of a line number, then a command (a series of
// non-line-ending tokens), then any number of line endings.

// parsing a line without trying to grab the line endings
fn line_no_ending(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    let (s, ln) = delimited(space0, line_no, space0)(input)?;
    let (s, cmd) = command(s)?;

    let mut tok = vec![ln];
    tok.extend(cmd);

    Ok((s, tok))
}

// when parsing a line in isolation, we allow for any number of trailing
// newlines. note, this does not absorb *initial* line endings, only trailing
// line endings.
pub fn line(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    let (s, ln) = line_no_ending(input)?;
    let (s, les) = line_endings0(s)?;

    let mut tok = ln.clone();
    tok.extend(les);

    Ok((s, tok))
}

// a module is made up of multiple lines. these lines MUST be separated by some
// amount of newlines, and *may* contain both leading and trailing newlines.
pub fn module(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    let (s, leading) = line_endings0(input)?;
    let (s, lines) = separated_list0(line_endings1, line_no_ending)(s)?;
    let (s, trailing) = line_endings0(s)?;

    let mut tok = leading.clone();
    tok.extend(lines.into_iter().flatten().collect::<Vec<LocatedToken>>());
    tok.extend(trailing);

    Ok((s, tok))
}

// chances are good that, in practice, I'll know what we expect to parse.
// however, if I have completely unknown input, I can try out multiple
// parsers anyway. this is in-line, very roughly, with what yabasic does.
// this will probably get deleted when I prove I don't need it.
pub fn tokens(input: Span) -> IResult<Span, Vec<LocatedToken>> {
    let (s, tok) = many0(map(
        tuple((
            line_endings0,
            alt((
                // any number of lines definitely separated by line endings
                module, // a non-numbered command in isolation
                command,
            )),
            line_endings0,
        )),
        |(leading, commands, trailing)| {
            let mut tok = leading.clone();
            tok.extend(commands);
            tok.extend(trailing);
            tok
        },
    ))(input)?;

    Ok((s, tok.into_iter().flatten().collect::<Vec<LocatedToken>>()))
}
