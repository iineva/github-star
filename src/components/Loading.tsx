
import { Spin, Skeleton } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

const Loading = () => (
  <div>
    <Spin indicator={antIcon} />
    <Skeleton active />
  </div>
)

export default Loading