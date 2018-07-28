import * as React from 'react'
import { IconType } from 'react-icons'
import { FiLoader as SpinnerIcon } from 'react-icons/fi'
import { compose, withHandlers, withState } from 'recompose'
import $ from './Sidebar.module.scss'

interface SidebarOuterProps {
}

interface SidebarInnerProps extends SidebarOuterProps {
}

export const Sidebar = compose<SidebarInnerProps, SidebarOuterProps>(
)(({ children }) =>
  <div className={$.Sidebar}>{children}</div>
)

interface ActionOuterProps {
  name: string
  Icon: IconType
  disabled?: boolean
  onClick: () => Promise<void>
}

interface ActionInnerProps extends ActionOuterProps {
  loading: boolean,
  setLoading: (next: boolean) => void,
  clickHandler: () => Promise<void>,
}

export const Action = compose<ActionInnerProps, ActionOuterProps>(

  withState('loading', 'setLoading', false),

  withHandlers<ActionInnerProps, Partial<ActionInnerProps>>({
    clickHandler: ({ disabled, loading, setLoading, onClick }) => async () => {
      if (!disabled && !loading) {
        setLoading(true)
        await onClick()
        setLoading(false)
      }
    },
  }),

)(({ Icon, name, disabled, loading, clickHandler }) =>
  <div className={$.Action} title={name} onClick={clickHandler}>
    {loading
      ? <SpinnerIcon className={$.loading} />
      : <Icon className={disabled && $.disabled} />
    }
  </div>
)