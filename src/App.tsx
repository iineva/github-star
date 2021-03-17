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

const { Header, Sider } = Layout


const App = () => {

  const [collapseState, setCollapseState] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stars, setStars] = useState<StarredRepositoryEdge[]>([])
  const [groups, setGroups] = useState([{
    title: 'tags',
    tags: ['iOS', 'Android', 'React', 'React Native']
  }, {
    title: 'languages',
    tags: ['Object-C', 'Java', 'JavaScript']
  }, {
    title: 'default tags',
    tags: ['iOS', 'Android', 'React Native']
  }])
  const [selectedRepository, setSelectedRepository] = useState<StarredRepositoryEdge>()

  const load = async () => {
    // TODO: data from api
    // github.userStars('iineva', 2).then((stars: Repository[]) => {
    //   this.setState({ stars: stars })
    // })

    setLoading(true)

    let list: StarredRepositoryEdge[] = []
    await fetchAllUserStars(l => {
      list = [...list, ...l]
      setStars(list)
    })
    // console.log(stars)
    // window.localStorage.setItem('test', JSON.stringify(list))
    // setStars(stars)
    setLoading(false)
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

      <Header style={{
        padding: '0 20px',
        background: '#fff',
        // color: '#fff',
        // position: 'fixed', zIndex: 1, width: '100%'
      }}>
        {React.createElement(collapseState === 2 ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: 'trigger',
          onClick: toggle,
        })}

        <Button onClick={oauth}>
          Login GitHub
        </Button>

      </Header>

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
          borderRightColor: '#ddd',
          borderRightStyle: 'solid',
        }}
      >
        <TagList loading={loading} groups={groups} onReloadClick={load} />
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
          left: 0,
          borderRightWidth: 1,
          borderRightColor: '#ddd',
          borderRightStyle: 'solid',
        }}
      >
        <Divider orientation="left">Repository</Divider>
        <RepositoryList loading={loading} list={stars} onItemSelected={(index: number) => {
          setSelectedRepository(stars[index])
        }} />
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
