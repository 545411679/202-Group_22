export const SPECIALIST_STATUS = {
  PENDING:  { tag: 'warning', label: 'Pending review',  color: '#d48806', bg: '#fff8e6', msg: 'Your profile is awaiting admin approval. You will be visible to clients once approved.' },
  ACTIVE:   { tag: 'success', label: 'Active',           color: '#52c41a', bg: '#f6ffed', msg: 'Your profile is active and visible to clients.' },
  PAUSED:   { tag: 'info',    label: 'Paused',           color: '#1890ff', bg: '#e6f7ff', msg: 'Your profile is paused. Clients cannot find or book you. Activate to resume.' },
  REJECTED: { tag: 'danger',  label: 'Rejected',         color: '#cf1322', bg: '#fff1f0', msg: 'Your profile was rejected. Please review the reason below, update your profile, and resubmit.' },
}

export const BOOKING_STATUS = {
  PENDING:   { tag: 'warning', label: 'Pending',    color: '#d48806', bg: '#fff8e6' },
  CONFIRMED: { tag: 'success', label: 'Confirmed',  color: '#52c41a', bg: '#f6ffed' },
  REJECTED:  { tag: 'danger',  label: 'Rejected',   color: '#cf1322', bg: '#fff1f0' },
  CANCELLED: { tag: 'danger',  label: 'Cancelled',  color: '#8c8c8c', bg: '#fafafa' },
  COMPLETED: { tag: 'info',    label: 'Completed',  color: '#1890ff', bg: '#e6f7ff' },
  CONDUCTED: { tag: 'info',    label: 'Conducted',  color: '#722ed1', bg: '#f9f0ff' },
  REVIEWED:  { tag: 'success', label: 'Reviewed',   color: '#389e0d', bg: '#f6ffed' },
}

export const SLOT_STATUS = {
  AVAILABLE:   { tag: 'success', label: 'Available',    color: '#52c41a', bg: '#f6ffed' },
  UNAVAILABLE: { tag: 'danger',  label: 'Unavailable',  color: '#8c8c8c', bg: '#fafafa' },
}

export function specialistStatusTagHtml(status) {
  const s = SPECIALIST_STATUS[status] || { tag: 'info', label: status || '—' }
  return `<span class="tag tag-${s.tag}">${s.label}</span>`
}

export function bookingStatusTagHtml(status) {
  const s = BOOKING_STATUS[status] || { tag: 'info', label: status || '—' }
  return `<span class="tag tag-${s.tag}">${s.label}</span>`
}
