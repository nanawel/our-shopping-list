import repository from '@/service/repository'

export default {
  install: (Vue) => {
    Vue.prototype.$repository = repository
    Vue.$repository = Vue.prototype.$repository
  }
}
