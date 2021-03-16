import { useEffect, useState, useRef } from 'react'
import { Repository } from '../lib/github/types'
import {
  Empty,
  Skeleton,
  BackTop,
} from 'antd'

import {
  VerticalAlignTopOutlined,
} from '@ant-design/icons'

import github from '../lib/github'
import renderGitHubURL from '../lib/github/parse'

const readmeCache: {
  [key: string]: string
} = {}

const ReadmeComponent = (props: {
  repo?: Repository
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

      // match cache
      if (readmeCache[props.repo!.full_name]) {
        setMarkdown(readmeCache[props.repo!.full_name])
        setLoading(false)
        return
      }

      const data = await github.repoReadme(props.repo!)
      const domparser = new DOMParser()
      const doc = domparser.parseFromString(data, 'text/html')
      const m = renderGitHubURL(doc.body, props.repo!)
      const key = props.repo!.full_name || ''
      readmeCache[key] = m
      setMarkdown(m)
      setLoading(false)
    })()
  }, [props.repo])

  return (
    <div style={{ padding: 20, paddingTop: 0, background: '#fff' }} ref={markdownRef} className="markdown-body">
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
                  borderRadius: 20,
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