import { Repository } from "./types"

const forEach = (node: Element | null, cb: (n: Element) => void) => {
  if (!node) {
    return
  }
  cb(node)
  for (let i = 0; i < node.children.length; i++) {
    forEach(node.children[i], cb)
  }
}

const githubUrl = (uri: string, repo: Repository) => {
  const base = `https://github.com/${repo.owner.login}/${repo.name}/raw/${repo.default_branch}/`
  const url = new URL(uri, base)
  return url.href
}

const renderGitHubURL = (node: HTMLElement, repo: Repository) => {
  forEach(node, (c) => {
    if (c.tagName.toLowerCase() === 'img') {
      const uri = c.getAttribute('src')
      if (uri && !uri.startsWith('http')) {
        c.setAttribute('src', githubUrl(uri, repo))
      }
    }
    if (c.tagName.toLowerCase() === 'a') {
      const uri = c.getAttribute('href')
      if (uri && !uri.startsWith('http') && !uri.startsWith('#')) {
        c.setAttribute('href', githubUrl(uri, repo))
      }
    }
  })
  return node.innerHTML
}

export default renderGitHubURL