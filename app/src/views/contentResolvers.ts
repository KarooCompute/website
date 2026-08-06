import type { BlockDebugTabType, DebugInfo, EditorLanguage } from '../types'

export interface ContentResolverState {
  blockDebugTab: BlockDebugTabType
  debugInfo: DebugInfo | null
}

export function getLeftContent(_state: ContentResolverState): string {
  return ''
}

export function getRightContent(_state: ContentResolverState): string {
  return ''
}

export function getLeftLanguage(state: ContentResolverState): EditorLanguage {
  return isSourceCodeTab(state) ? 'cpp' : 'json'
}

export function getRightLanguage(state: ContentResolverState): EditorLanguage {
  return isSourceCodeTab(state) ? 'rust' : 'json'
}

export function isSourceCodeTab(state: ContentResolverState): boolean {
  return state.blockDebugTab === 'source_code'
}

export function isTopoSmtTab(state: ContentResolverState): boolean {
  return state.blockDebugTab === 'topo_smt_report'
}

export function isMatchListTab(state: ContentResolverState): boolean {
  return state.blockDebugTab === 'match_list'
}

export function isErrorsTab(state: ContentResolverState): boolean {
  return state.blockDebugTab === 'errors'
}

export function isFullWidthTab(state: ContentResolverState): boolean {
  return isTopoSmtTab(state) || isMatchListTab(state) || isErrorsTab(state)
}
