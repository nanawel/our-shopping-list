import config from '@/config'

const isSingleBoardMode = () => {
  return config.VITE_SINGLEBOARD_MODE
}

export {
  isSingleBoardMode
}
