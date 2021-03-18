import { Repository } from "./graphql"

const forEach = (node: Element | null, cb: (n: Element) => void) => {
  if (!node) {
    return
  }
  cb(node)
  for (let i = 0; i < node.children.length; i++) {
    forEach(node.children[i], cb)
  }
}

export const githubBaseUrl = (repo: Repository, blob?: boolean) => {
  return `https://github.com/${repo.owner.login}/${repo.name}/${blob ? 'blob' : 'raw'}/${repo.defaultBranchRef.name}/`
}

export const githubUrl = (uri: string, repo: Repository, blob?: boolean) => {
  if (uri.startsWith('/')) {
    uri = uri.substring(1)
  }
  const base = githubBaseUrl(repo, blob)
  const url = new URL(uri, base)
  return url.href
}

const renderGitHubURLNode = (node: HTMLElement, repo: Repository) => {
  forEach(node, (c) => {
    if (c.tagName.toLowerCase() === 'img') {
      const uri = c.getAttribute('src')
      if (!uri) {
        return
      }
      if (!uri.startsWith('http')) {
        c.setAttribute('src', githubUrl(uri, repo))
      } else {
        // https://github.com/user/project-name/blob/master/path/to/file.ext
        // to
        // https://github.com/user/project-name/raw/master/path/to/file.ext
        const u = new URL(uri)
        const p = u.pathname.split('/')
        if (u.hostname === 'github.com' && p.length >= 6 && p[3] === 'blob') {
          p[3] = 'raw'
          u.pathname = p.join('/')
        }
        c.setAttribute('src', u.toString())
      }
    }
    if (c.tagName.toLowerCase() === 'a') {
      let uri = c.getAttribute('href')
      if (!uri) {
        return
      }
      if (!uri.startsWith('http') && !uri.startsWith('#')) {
        uri = githubUrl(uri, repo, true)
        c.setAttribute('href', uri)
      }
      // use new window to open outlink
      if (uri.startsWith('http')) {
        c.setAttribute('target', '_blank')
        c.setAttribute('rel', 'noreferrer')
      }
    }
  })
  return node.innerHTML
}

export const renderGitHubURL = (html: string, repo: Repository) => {
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(html, 'text/html')
  return renderGitHubURLNode(doc.body, repo)
}

export default renderGitHubURL