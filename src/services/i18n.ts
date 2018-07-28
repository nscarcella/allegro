import * as i18next from 'i18next'
import * as xhr from 'i18next-xhr-backend'

const isDevelopment = process.env.NODE_ENV === 'development'

export const init = () => new Promise((resolve, reject) =>
  i18next.use(xhr).init({
    fallbackLng: 'en',
    preload: ['en'],
    debug: isDevelopment,
    backend: {
      loadPath: '/i18n/{{lng}}.json',
      crossDomain: false,
    },
  }, errors => errors ? reject(errors) : resolve())

)
export const t = i18next.t