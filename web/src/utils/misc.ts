// Will return whether the current environment is a regular browser
// and not CEF
export const isEnvBrowser = (): boolean => !(window as any).invokeNative;