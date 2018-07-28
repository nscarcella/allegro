import UserStatus from '@components/UserStatus'
import * as React from 'react'
import { compose } from 'recompose'
import $ from './Header.module.scss'


interface HeaderOuterProps {
}

interface HeaderInnerProps extends HeaderOuterProps {
}

const Header = compose<HeaderInnerProps, HeaderOuterProps>(
)(({ }) =>
  <header className={$.Header}>
    <h1>Allegro</h1>
    <UserStatus />
  </header>
)

export default Header