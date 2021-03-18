import { useEffect, useState, useRef } from 'react'
import {
  Empty,
  Skeleton,
  BackTop,
  Select,
} from 'antd'
import {
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import marked from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import { fetchRootFiles, fetchTextFile, FileInfo } from '../common/github/graphql'
import { renderGitHubURL } from '../common/github/parse'
import { StarredRepositoryEdge } from '../common/github/graphql'

const DOC_EXTS = ['.markdown', '.mdown', '.mkdn', '.md',
  '.textile', '.rdoc', '.org', '.creole',
  '.mediawiki', 'wiki', '.rst',
  '.asciidoc', 'adoc', 'asc', '.pod']

const updateCodeSyntaxHighlighting = () => {
  document.querySelectorAll("pre code").forEach(block => {
    // @ts-ignore
    hljs.highlightBlock(block)
  })
}

const readmeCache: {
  file: {
    [key: string]: string
  }
  list: {
    [key: string]: FileInfo[]
  }
} = {
  file: {},
  list: {},
}

const ReadmeComponent = (props: {
  repo?: StarredRepositoryEdge
}) => {

  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [readmeFiles, setReadmeFiles] = useState<FileInfo[]>([])
  const [loadingReadmeFiles, setLoadingReadmeFiles] = useState(false)
  const [readmeFile, setReadmeFile] = useState<FileInfo>()
  const markdownRef = useRef(null)

  const selectReadmeFile = async (file?: FileInfo) => {
    setReadmeFile(file)
    if (!props.repo || !file) {
      return
    }

    setLoading(true)
    const repo = props.repo.node
    const README_CACKE_KEY = `README_CACKE_KEY:${repo.nameWithOwner}:${file.path}`
    // match cache
    let readmeData = readmeCache.file[README_CACKE_KEY]
    if (!readmeData) {
      const readme = await fetchTextFile(repo.owner.login, repo.name, file.path)
      if (!readme.data) {
        throw new Error('error!!')
      }
      const r = readme.data.repository.file ? readme.data.repository.file.text : ''
      readmeData = renderGitHubURL(marked(r), repo)
      readmeCache.file[README_CACKE_KEY] = readmeData
    }

    setMarkdown(readmeData)
    setLoading(false)
    updateCodeSyntaxHighlighting()
  }

  useEffect(() => {
    if (!props.repo) {
      return
    }

    setLoadingReadmeFiles(true)
    setReadmeFile(undefined)
    setReadmeFiles([])
    setLoading(true);
    (async () => {

      if (!props.repo) {
        return
      }

      const repo = props.repo.node
      const README_CACKE_KEY = 'README_CACKE_KEY:' + repo.nameWithOwner

      // loading raadme files
      let files = readmeCache.list[README_CACKE_KEY]
      if (!files) {
        const rootFiles = await fetchRootFiles(repo.owner.login, repo.name)
        if (!rootFiles.data) {
          throw new Error('error!!')
        }

        files = rootFiles.data.repository.files.entries.filter(row => {
          if (row.type !== 'blob') return false
          if (DOC_EXTS.find(ex => row.name.toLowerCase().endsWith(ex))) return true
          return false
        })
        files = [...files.filter(row => {
          if (row.name.toLowerCase().startsWith('readme')) return true
          return false
        }).sort((l, r) => l.name.length - r.name.length),
        ...files.filter(row => {
          if (!row.name.toLowerCase().startsWith('readme')) return true
          return false
        }).sort()]
        readmeCache.list[README_CACKE_KEY] = files
      }
      setReadmeFiles(files)
      setLoadingReadmeFiles(false)

      // loading readme file
      const file = files[0]
      await selectReadmeFile(file)

    })()
  }, [props.repo])

  return (
    <div style={{ padding: 20, background: '#fff' }} ref={markdownRef} className="markdown-body">
      {(!props.repo || !markdown) && (!loading) ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
        }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Plase Select a Repository' />
        </div>
      ) : (
        <>
          <Select value={readmeFile?.path} loading={loadingReadmeFiles} style={{ minWidth: 200, width: 'auto' }} onChange={v => {
            selectReadmeFile(readmeFiles.find(r => r.path === v))
          }}>
            {readmeFiles.map((row, i) => (
              <Select.Option key={i} value={row.path}>{row.name}</Select.Option>
            ))}
          </Select>
          <Skeleton loading={loading} active>
            <div dangerouslySetInnerHTML={{ __html: markdown }} />
            {markdownRef && markdownRef.current && (
              // @ts-ignore
              <BackTop target={() => markdownRef.current.parentElement}>
                <div style={{
                  height: 40,
                  width: 40,
                  lineHeight: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1088e9dd',
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 14,
                }}>
                  <VerticalAlignTopOutlined />
                </div>
              </BackTop>

            )}
          </Skeleton>
          <Skeleton loading={loading} active />
          <Skeleton loading={loading} active />
          <Skeleton loading={loading} active />
        </>
      )
      }
    </div >
  )
}

export default ReadmeComponent