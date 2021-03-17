import { useEffect, useState, useRef } from 'react'
import {
  Empty,
  Skeleton,
  BackTop,
} from 'antd'

import {
  VerticalAlignTopOutlined,
} from '@ant-design/icons'

import github from '../lib/github'
import { fetchREADME } from '../lib/github/graphql'
import { StarredRepositoryEdge } from '../lib/github/graphql'

const readmeCache: {
  [key: string]: string
} = {}

const ReadmeComponent = (props: {
  repo?: StarredRepositoryEdge
}) => {

  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const markdownRef = useRef(null)

  useEffect(() => {
    if (!props.repo) {
      return
    }

    setLoading(true);
    (async () => {

      if (!props.repo) {
        return
      }

      const repo = props.repo.node

      // match cache
      if (readmeCache[repo.nameWithOwner]) {
        setMarkdown(readmeCache[repo.nameWithOwner])
        setLoading(false)
        return
      }

      const readme = await fetchREADME({
        owner: repo.owner.login,
        name: repo.name,
      })

      if (!readme.data || !readme.data.repository) {
        throw new Error('error!!')
      }

      const r = (readme.data.repository.README_md || readme.data.repository.readme_md || readme.data.repository.readme) || { text: '' }
      const html = await github.readmeToHTML(repo, r.text)
      const key = repo.nameWithOwner || ''
      readmeCache[key] = html
      setMarkdown(html)
      setLoading(false)
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