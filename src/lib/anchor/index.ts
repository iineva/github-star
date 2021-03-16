export function scrollToAnchor() {
  if (document.querySelector(':target')) return
  if (!window.location.hash || window.location.hash.length <= 1) return
  const id = window.location.hash.substring(1)
  const el = document.getElementById(`user-content-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else if (id.startsWith('user-content-')) { // compat for links with old 'user-content-' prefixed hashes
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

export default function initMarkdownAnchors() {
  // if (!document.querySelector('.markdown-body')) return
  scrollToAnchor()
  window.addEventListener('hashchange', scrollToAnchor)
}
