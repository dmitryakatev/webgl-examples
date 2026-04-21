import { useEffect, useRef } from 'react'

export const useThrottle = (initialInterval: number) => {
  const interval = useRef(initialInterval)
  const timerId = useRef<number | null>(null)

  useEffect(() => {
    () => {
      if (timerId.current !== null) {
        clearTimeout(timerId.current)
        timerId.current = null
      }
    }
  }, [timerId])

  return (callback: () => void) => {
    if (timerId.current === null) {
      timerId.current = window.setTimeout(() => {
        timerId.current = null
        callback()
      }, interval.current)
    }
  }
}
