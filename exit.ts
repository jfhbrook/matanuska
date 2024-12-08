import { errorType } from './errors';
import { Formatter, Formattable } from './format';

/**
 * A system exit code, as in sysexits.h.
 *
 * There are no hard and fast rules for how these map to OS errors, as far
 * as I know, and in fact this standard is not commonly implemented.
 *
 * See: https://man.freebsd.org/cgi/man.cgi?query=sysexits&manpath=FreeBSD+4.3-RELEASE
 */
export enum ExitCode {
  /**
   * The command completed successfully.
   */
  Success = 0,

  /**
   * The command was used incorrectly, e.g., with the wrong number of
   * arguments, a bad flag, a bad syntax in a parameter, or whatever.
   */
  Usage = 64,

  /**
   * The input data was incorrect in some way. This should only be used for
   * the user's data and not system files.
   */
  DataError = 65,

  /**
   * An input file (not a system file) did not exist or was not readable. This
   * could also include errors like "No message" to a mailer (if it cared to
   * catch it).
   */
  NoInput = 66,

  /**
   * The user specified did not exist. This might be used for mail addresses
   * or remote logins.
   */
  NoUser = 67,

  /**
   * The host specified did not exist. This is used in mail addresses or
   * network requests.
   */
  NoHost = 68,

  /**
   * A service is unavailable. This can occur if a support program or file
   * does not exist. This can also be used as a catchall message when something
   * you wanted to do doesn't work, but you don't know why.
   */
  Unavailable = 69,

  /**
   * An internal software error has been detected. This should be limited to
   * non-operating system related errors as possible.
   *
   * If an exception does not otherwise specify an exit code, this exit code
   * will be used.
   */
  Software = 70,

  /**
   * An operating system error has been detected. This is intended to be used
   * for such things as "cannot fork", "cannot create pipe", or the like. It
   * includes things like getuid returning a user that does not exist in the
   * passwd file.
   */
  OsError = 71,

  /**
   * Some system file (e.g., /etc/passwd, /var/run/utmp, etc.) does not exist,
   * cannot be opened, or has some sort of error (e.g., syntax error).
   */
  OsFile = 72,

  /**
   * A (user specified) output file cannot be created.
   */
  CantCreate = 73,

  /**
   * An error occurred while doing I/O on some file.
   */
  IoError = 74,

  /**
   * Temporary failure, indicating something that is not really an error. In
   * sendmail, this means that a mailer (e.g.) could not create a connection,
   * and the request should be reattempted later.
   */
  TempFail = 75,

  /**
   * The remote system returned something that was "not possible" during a
   * protocol exchange.
   */
  Protocol = 76,

  /**
   * You did not have sufficient permission to perform the operation. This is
   * not intended for file system problems, which should use
   * ExitCode.NoInput or ExitCode.CantCreate, but rather for higher-level
   * permissions.
   */
  NoPermission = 77,

  /**
   * Something was found in an unconfigured or misconfigured state.
   */
  Config = 78,
}

/**
 * A function that exits the app.
 */
export type ExitFn = (exitCode: number) => Promise<void>;

/**
 * Objects implementing this interface have an exit code corresponding to
 * sysexits.h.
 */
export interface ExitCoded {
  /**
   * A system exit code, as per sysexits.h. If this exception causes the
   * interpreter to exit, this will be the process exit code.
   */
  exitCode: ExitCode;
}

/**
 * When thrown, causes the program to exit successfully. Takes an optional
 * message.
 */
@errorType('Exit')
export class Exit extends Error implements ExitCoded, Formattable {
  constructor(
    public exitCode: number | ExitCode = ExitCode.Success,
    message: string = '',
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  format(formatter: Formatter): string {
    return formatter.formatExit(this);
  }
}
