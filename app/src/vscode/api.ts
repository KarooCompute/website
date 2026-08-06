import type { SourceLocation } from '../types/roseReport'

export type WebviewToExtensionMessage =
  | { type: 'listYamlFiles' }
  | { type: 'readYamlFile'; path: string }
  | { type: 'openSourceLocation'; location: SourceLocation }

/** No-op on the website — VS Code navigation is unavailable. */
export function postToExtension(_message: WebviewToExtensionMessage | unknown): void {
  // intentionally empty
}

export interface WebviewPersistedState {
  selectedPath?: string | null
  selectedDebugPath?: string | null
}

export function getPersistedState(): WebviewPersistedState {
  return {}
}

export function setPersistedState(_state: WebviewPersistedState): void {
  // intentionally empty — no VS Code webview state on the website
}
