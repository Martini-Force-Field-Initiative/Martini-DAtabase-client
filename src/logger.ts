const isDebugEnabled = (): boolean => process.env.REACT_APP_DEBUG !== 'false';

export function debugLog(...args: any[]): void {
  if (isDebugEnabled()) console.log(...args);
}

export function debugDir(item?: any, options?: any): void {
  if (isDebugEnabled()) console.dir(item, options);
}

export function debugInfo(...args: any[]): void {
  if (isDebugEnabled()) console.info(...args);
}

export function debugDebug(...args: any[]): void {
  if (isDebugEnabled()) console.debug(...args);
}
