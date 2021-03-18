import React, { useState, useEffect } from 'react'
import {
  Layout, Divider,
  Button,
} from 'antd'
import {
  MenuUnfoldOutlined, MenuFoldOutlined,
} from '@ant-design/icons'
import './App.css'


import TagList from './pages/TagList'
import RepositoryList from './pages/RepositoryList'
import Readme from './pages/Readme'

import { oauth } from './common/github/oauth'
import { fetchAllUserStars, StarredRepositoryEdge } from './common/github/graphql'
import { DB } from './common/github/cache'

const { Header, Sider } = Layout


const App = () => {

  const [collapseState, setCollapseState] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stars, setStars] = useState<StarredRepositoryEdge[]>([])
  const [groups, setGroups] = useState([{
    name: 'tags',
    tags: ['iOS', 'Android', 'React', 'React Native']
  }, {
    name: 'languages',
    tags: ['Object-C', 'Java', 'JavaScript']
  }, {
    name: 'topics',
    tags: ['iOS', 'Android', 'React Native']
  }])
  const [selectedRepository, setSelectedRepository] = useState<StarredRepositoryEdge>()

  const load = async (userClick?: boolean) => {

    const count = await DB.stars.count({
      _cache: false,
    })

    // update UI
    setLoading(true)

    // load all from cache
    if (count && !userClick) {
      const stars = await DB.stars.find<StarredRepositoryEdge>({}).sort({
        starredAt: -1
      })
      console.info('cache matched!', stars[0])
      setStars(stars)
      setLoading(false)
      return
    }

    try {
      let list: StarredRepositoryEdge[] = []
      await fetchAllUserStars(async l => {
        // callback per request
        list = [...list, ...l]
        setStars(list)
      })

      // update UI
      setLoading(false)
    } catch (err) {
      console.error('loading stars error:', err)
      setLoading(false)
    }

  }

  useEffect(() => {
    load()
  }, [])

  const toggle = () => {
    let state = collapseState + 1
    if (state >= 3) {
      state = 0
    }
    setCollapseState(state)
  }

  return (
    <Layout>

      <div>
        <Header style={{
          padding: '0 20px',
          background: '#fff',
          // color: '#fff',
          // position: 'fixed', zIndex: 1, width: '100%'
          flexDirection: 'column',
        }}>
          {React.createElement(collapseState === 2 ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: toggle,
          })}
        </Header>
        <Button onClick={oauth} style={{ margin: 12 }} type='primary'>
          Login GitHub
        </Button>
      </div>

      {/* all tags */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapseState > 0}
        collapsedWidth={0}
        width={300}
        theme='light'
        style={{
          overflow: 'auto',
          height: '100vh',
          left: 0,
          borderRightWidth: 1,
          borderRightColor: '#ddd5',
          borderRightStyle: 'solid',
        }}
      >
        <TagList loading={loading} groups={groups} onReloadClick={() => {
          load(true)
        }} />
      </Sider>

      {/* repository list */}
      <Sider
        trigger={null}
        theme='light'
        width={350}
        collapsible
        collapsed={collapseState > 1}
        collapsedWidth={0}
        style={{
          overflow: 'auto',
          height: '100vh',
          borderRightWidth: 1,
          borderRightColor: '#ddd',
          borderRightStyle: 'solid',
        }}
      >
        <div className='repo-list'>
          <Divider orientation="left">Repository{stars.length ? `(${stars.length})` : ''}</Divider>
          <RepositoryList loading={loading} list={stars} onItemSelected={(index: number) => {
            setSelectedRepository(stars[index])
          }} />
        </div>
      </Sider>

      {/* readme content */}
      <Layout
        style={{
          overflow: 'auto',
          height: '100vh',
          left: 0,
          background: '#fff',
        }}
      >
        <Readme repo={selectedRepository} />
      </Layout>

    </Layout>
  )
}

export default App
