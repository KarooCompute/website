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

export function getLeftLanguage(_state: ContentResolverState): EditorLanguage {
  return 'json'
}

export function getRightLanguage(_state: ContentResolverState): EditorLanguage {
  return 'json'
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
