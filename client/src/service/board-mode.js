import config from '@/config'

const isSingleBoardMode = () => {
  return config.VITE_APP_SINGLEBOARD_MODE
}

export {
  isSingleBoardMode
}
