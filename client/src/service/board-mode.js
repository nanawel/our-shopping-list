import config from '@/config'

const isSingleBoardMode = () => {
  return config.VUE_APP_SINGLEBOARD_MODE
}

export {
  isSingleBoardMode
}
