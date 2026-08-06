import type { EquivalenceWorkspace, FunctionId, FunctionRecord, MatchKind } from '../../types'
import '../topo-smt/EquivalenceDetailShell.css'
import './MatchListView.css'

export interface MatchListViewProps {
  workspace: EquivalenceWorkspace | null
  selectedId: FunctionId | null
  onSelect: (id: FunctionId) => void
}

function FunctionRow({
  record,
  selected,
  onSelect,
}: {
  record: FunctionRecord
  selected: boolean
  onSelect: (id: FunctionId) => void
}) {
  const hasSrc = Boolean(record.src_func)
  const hasTgt = Boolean(record.tgt_func)

  return (
    <button
      type="button"
      className={`match-list-row${selected ? ' selected' : ''}`}
      onClick={() => onSelect(record.id)}
    >
      <span className="match-list-row-names">
        {hasSrc ? (
          <span className="func-bubble src" title={record.src_sig ?? undefined}>
            {record.src_func}
          </span>
        ) : null}
        {hasSrc && hasTgt ? <span className="topo-smt-approx">≈</span> : null}
        {hasTgt ? (
          <span className="func-bubble tgt" title={record.tgt_sig ?? undefined}>
            {record.tgt_func}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function MatchSection({
  title,
  ids,
  workspace,
  selectedId,
  onSelect,
}: {
  title: string
  ids: FunctionId[]
  workspace: EquivalenceWorkspace
  selectedId: FunctionId | null
  onSelect: (id: FunctionId) => void
}) {
  if (ids.length === 0) return null

  return (
    <section className="match-list-section">
      <h2 className="match-list-section-title">
        {title}
        <span className="match-list-section-count">{ids.length}</span>
      </h2>
      <div className="match-list-rows">
        {ids.map((id) => {
          const record = workspace.records.get(id)
          if (!record) return null
          return (
            <FunctionRow
              key={id}
              record={record}
              selected={selectedId === id}
              onSelect={onSelect}
            />
          )
        })}
      </div>
    </section>
  )
}

function idsOfKind(workspace: EquivalenceWorkspace, kind: MatchKind): FunctionId[] {
  if (kind === 'unmatched_tgt') {
    return workspace.unmatchedTgtIds
  }
  return workspace.srcSideIds.filter((id) => workspace.records.get(id)?.match_kind === kind)
}

export function MatchListView({ workspace, selectedId, onSelect }: MatchListViewProps) {
  if (!workspace || workspace.records.size === 0) {
    return <div className="match-list-empty">No match report available.</div>
  }

  return (
    <div className="match-list-view">
      <MatchSection
        title="Matched"
        ids={idsOfKind(workspace, 'matched')}
        workspace={workspace}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <MatchSection
        title="Unmatched source"
        ids={idsOfKind(workspace, 'unmatched_src')}
        workspace={workspace}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <MatchSection
        title="Unmatched target"
        ids={idsOfKind(workspace, 'unmatched_tgt')}
        workspace={workspace}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  )
}
