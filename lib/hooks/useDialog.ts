// useDialog Hook - For managing dialog/modal state and components
'use client'

import { useState, useCallback } from 'react'

interface DialogConfig {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  onClose?: () => void
}

interface DialogState {
  isOpen: boolean
  component: React.ComponentType<any> | null
  props: any
  config: DialogConfig
}

export function useDialog() {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    component: null,
    props: {},
    config: {}
  })

  const openDialog = useCallback((
    component: React.ComponentType<any>,
    props: any = {},
    config: DialogConfig = {}
  ) => {
    setDialog({
      isOpen: true,
      component,
      props,
      config: {
        size: 'md',
        closable: true,
        ...config
      }
    })
  }, [])

  const closeDialog = useCallback(() => {
    if (dialog.config.onClose) {
      dialog.config.onClose()
    }
    setDialog(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [dialog.config])

  const updateDialogProps = useCallback((newProps: any) => {
    setDialog(prev => ({
      ...prev,
      props: { ...prev.props, ...newProps }
    }))
  }, [])

  return {
    dialog,
    openDialog,
    closeDialog,
    updateDialogProps,
    isDialogOpen: dialog.isOpen
  }
}
