export class Logger {
  /**
   * Error log output
   *
   * @param args message
   *
   * @returns void
   */

  public static Error(...args: Array<any>): void {
    const prefix: string = '[\u001b[31mError\u001b[37m]';
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
    const prefix: string = '[\u001b[32mEvent\u001b[37m]';
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
    const prefix: string = '[\u001b[33mWarning\u001b[37m]';
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
    const prefix: string = '[\u001b[34mInfo\u001b[37m]';
    console.log(prefix, ...args);
  }
}
