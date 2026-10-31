import type { RunView } from '../adapters/run'
import { finalStatus } from '../adapters/run'
import type { SchedulerId } from '../api/types'
import { CLASS_LABEL, SCHED_LABEL, fmtClock, fmtUs, packetAlias } from '../lib/format'
import { Close } from './Icons'

/** Human label + tone for a packet's final recorded outcome under one scheduler. */
const STATUS_LABEL: Record<ReturnType<typeof finalStatus>, string> = {
  DELIVERED: 'Delivered on time', DEADLINE_MISSED: 'Delivered late', DROPPED: 'Dropped', PENDING: 'Not yet reached',
}
const STATUS_TONE: Record<ReturnType<typeof finalStatus>, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  DELIVERED: 'ok', DEADLINE_MISSED: 'warn', DROPPED: 'bad', PENDING: 'neutral',
}
const DROP_REASON_LABEL: Record<string, string> = { QUEUE_OVERFLOW: 'Queue was full on arrival', DEADLINE_EXPIRED: 'Deadline expired before transmission' }

const fc = (us: number | null | undefined) => (us == null ? 'Not reached' : fmtClock(us))

/**
 * Full raw record of one packet, on demand (click a packet in the flow canvas). Deliberately
 * separate from the always-visible ACAPS Decision Basis panel: that panel explains a *decision*
 * (ACAPS's own reasoning, at the current playback instant); this shows a *packet* (everything the
 * backend recorded about it, under whichever scheduler is currently selected), independent of
 * decision logic and independent of the playback clock. Real backend fields only — nothing here is
 * computed or estimated in the frontend.
 */
export function PacketInspector({ view, sched, packetId, onClose }: { view: RunView; sched: SchedulerId; packetId: number; onClose: () => void }) {
  const p = view.pkt.get(packetId)
  const rec = view.schedulers[sched].rec.get(packetId)
  if (!p) return null
  const status = finalStatus(rec)
  return (
    <div className="decision glass" aria-label="Packet inspector">
      <div className="row spread">
        <span className="eyebrow">Packet Inspector · {SCHED_LABEL[sched]} run</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close packet inspector"><Close /></button>
      </div>
      <div className="who">
        <span className="pid num">{packetAlias(p.trafficClass, p.packetId)}</span>
        <span className="cls small">{CLASS_LABEL[p.trafficClass]}</span>
        <span className={`badge ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>
      </div>
      <div className="dgrid">
        <div><div className="k">Packet ID</div><div className="v">{p.packetId}</div></div>
        <div><div className="k">Criticality rank</div><div className="v">{p.criticalityRank}</div></div>
        <div><div className="k">Size</div><div className="v">{p.sizeBytes} B</div></div>
        <div><div className="k">Packet delay budget</div><div className="v">{fmtUs(p.delayBudgetUs)}</div></div>
        <div><div className="k">Arrival time</div><div className="v">{fmtClock(p.arrivalTimeUs)}</div></div>
        <div><div className="k">Deadline</div><div className="v">{fmtClock(p.deadlineUs)}</div></div>
        <div><div className="k">Entered queue</div><div className="v">{fc(rec?.enqueueTimeUs)}</div></div>
        <div><div className="k">Transmission start</div><div className="v">{fc(rec?.txStartUs)}</div></div>
        <div><div className="k">Transmission end</div><div className="v">{fc(rec?.txEndUs)}</div></div>
        <div><div className="k">Queueing delay</div><div className="v">{rec?.waitingTimeUs != null ? fmtUs(rec.waitingTimeUs) : 'Not available'}</div></div>
        <div><div className="k">Transmission time</div><div className="v">{rec?.serviceTimeUs != null ? fmtUs(rec.serviceTimeUs) : 'Not available'}</div></div>
        <div><div className="k">Total delay</div><div className="v">{rec?.totalDelayUs != null ? fmtUs(rec.totalDelayUs) : 'Not available'}</div></div>
        <div><div className="k">Overtaken count</div><div className="v">{rec?.overtakenCount ?? 'Not available'}</div></div>
        {rec?.dropReason && <div><div className="k">Drop reason</div><div className="v">{DROP_REASON_LABEL[rec.dropReason] ?? rec.dropReason}</div></div>}
      </div>
      <p className="small muted" style={{ margin: 0 }}>Source: {p.source} → {p.destination}. These are the backend's own recorded fields for this packet under the {SCHED_LABEL[sched]} run — nothing here is recomputed by the frontend.</p>
    </div>
  )
}
