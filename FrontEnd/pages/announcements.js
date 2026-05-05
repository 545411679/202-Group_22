import { renderLayout } from '/app.js'
import { renderAnnouncementsCard } from '/pages/shared/announcements-card.js'

export function render(app) {
  renderLayout('Announcements', container => {
    container.innerHTML = '<div id="ann-all-host"></div>'
    renderAnnouncementsCard(document.getElementById('ann-all-host'), { limit: 0, showViewAll: false })
  })
}
