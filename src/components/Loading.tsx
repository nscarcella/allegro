import * as React from 'react'
import { FiLoader as SpinnerIcon } from 'react-icons/fi'
import { compose } from 'recompose'
import $ from './Loading.module.scss'

interface LoadingOuterProps {
}

interface LoadingInnerProps extends LoadingOuterProps {
}

const Loading = compose<LoadingInnerProps, LoadingOuterProps>(
)(({ }) =>
  <div className={$.Loading}>
    <SpinnerIcon />
  </div>
)

export default Loading