export class Logger {
  /**
   * Error log output
   *
   * @param args message
   *
   * @returns void
   */

  public static Error(...args: Array<any>): void {
    const prefix: string = `${time()} [\u001b[31mError\u001b[37m]`;
    console.log(prefix, ...args);
  }

  /**
   * Event log output
   *
   * @param args message
   *
   * @returns void
   */

  public static Event(...args: Array<any>): void {
    const prefix: string = `${time()} [\u001b[32mEvent\u001b[37m]`;
    console.log(prefix, ...args);
  }

  /**
   * Warn log output
   *
   * @param args message
   *
   * @returns void
   */

  public static Warning(...args: Array<any>): void {
    const prefix: string = `${time()} [\u001b[33mWarning\u001b[37m]`;
    console.log(prefix, ...args);
  }

  /**
   * Info log output
   *
   * @param args message
   *
   * @returns void
   */

  public static Info(...args: Array<any>): void {
    const prefix: string = `${time()} [\u001b[34mInfo\u001b[37m]`;
    console.log(prefix, ...args);
  }
}

/**
 * Function to get the Logger timestamp
 *
 * @returns string
 */

const time = (): string => {
  const now: Date = new Date();
  const date: string = now.getUTCDate() < 10 ? `0${now.getUTCDate()}` : now.getUTCDate().toString();
  const month: string = now.getUTCMonth() < 10 ? `0${now.getUTCMonth()}` : now.getUTCMonth().toString();
  const year: string = now.getUTCFullYear().toString();

  const hours: string = now.getUTCHours() < 10 ? `0${now.getUTCHours()}` : now.getUTCHours().toString();
  const minutes: string = now.getUTCMinutes() < 10 ? `0${now.getUTCMinutes()}` : now.getUTCMinutes().toString();
  const seconds: string = now.getUTCSeconds() < 10 ? `0${now.getUTCSeconds()}` : now.getUTCSeconds().toString();
  return `[${date}.${month}.${year} | ${hours}.${minutes}.${seconds}]`;
};
