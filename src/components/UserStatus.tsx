import { onSignInOrOut, signIn, signOut } from '@services/google'
import { t } from '@services/i18n'
import * as React from 'react'
import { compose, lifecycle, withState } from 'recompose'
import GoogleUser = gapi.auth2.GoogleUser
import googleLogo from './google-logo.svg'
import $ from './UserStatus.module.scss'


interface UserStatusOuterProps {
}

interface UserStatusInnerProps extends UserStatusOuterProps {
  user: GoogleUser | null,
  setUser: (next: GoogleUser | null) => void,
}

const UserStatus = compose<UserStatusInnerProps, UserStatusOuterProps>(

  withState('user', 'setUser', null),

  lifecycle<UserStatusInnerProps, {}>({
    componentDidMount() {
      onSignInOrOut(this.props.setUser)
    },
  })
)(({ user }) =>
  <div className={$.UserStatus}>
    {
      user
        ? <div onClick={signOut}>
          <img src={user.getBasicProfile().getImageUrl()} />
          <label>{t('UserStatus.signOut')}</label>
        </div>
        : (
          <div onClick={signIn}>
            <img src={googleLogo} />
            <label>{t('UserStatus.signIn')}</label>
          </div>
        )
    }
  </div>
)

export default UserStatus