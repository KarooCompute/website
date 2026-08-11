import type { DebugInfo } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface SampleData {
  c_code: string
  r_code: string
}

export interface EquivalenceResponse {
  errors?: unknown
  report?: unknown
  debug?: unknown
  /** Kept for backward compat; only used if `report` is absent. */
  debug_info?: DebugInfo
}

export async function fetchSamples(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/samples`)
  const data = await res.json()
  return data.samples || []
}

export async function fetchSample(name: string): Promise<SampleData> {
  const res = await fetch(`${API_BASE}/api/samples/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Failed to fetch sample')
  return res.json()
}

export async function postEquivalence(body: {
  c_code: string
  r_code: string
  mapping_yaml: string
}): Promise<EquivalenceResponse> {
  const response = await fetch(`${API_BASE}/api/equivalence?include=debug,report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}
