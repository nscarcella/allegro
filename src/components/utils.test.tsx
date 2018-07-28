import { lifecycle } from 'recompose'

export const logLifecycle = (who: string) => lifecycle({
  componentDidMount() {
    // tslint:disable-next-line:no-console
    console.log(who + ':componentDidMount')
  },
  componentWillReceiveProps(next) {
    // tslint:disable-next-line:no-console
    console.log(who + ':componentWillReceiveProps')
  },
  componentWillUnmount() {
    // tslint:disable-next-line:no-console
    console.log(who + ':componentWillUnmount')
  },
  componentDidUpdate() {
    // tslint:disable-next-line:no-console
    console.log(who + ':componentDidUpdate')
  },
})