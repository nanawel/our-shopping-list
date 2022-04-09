export default {
  VUE_APP_SINGLEBOARD_MODE: !!parseInt(process.env.VUE_APP_SINGLEBOARD_MODE),
  VUE_APP_SINGLEBOARD_SLUG: process.env.VUE_APP_SINGLEBOARD_SLUG || '_',
}
