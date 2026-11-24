'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useDragControls, useReducedMotion } from 'framer-motion'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { usePreferences } from './Shell'

export function Sheet({ title, onClose, children, full = false, sharedId }: {
  title: string; onClose: () => void; children: React.ReactNode; full?: boolean; sharedId?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const controls = useDragControls()
  const [large, setLarge] = useState(false)
  const reduced = useReducedMotion()
  const { t } = usePreferences()
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const previous = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])
  return <dialog className={full ? 'sheet-dialog story-dialog' : 'sheet-dialog'} ref={dialog} aria-label={title}
    onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <motion.div layoutId={reduced ? undefined : sharedId} className={'sheet-panel' + (large ? ' large' : '')}
      initial={reduced ? false : { y: 80 }}
      animate={{ y: 0, opacity: 1 }}
      drag={reduced ? false : 'y'} dragControls={controls} dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }} dragElastic={.6}
      onDragEnd={(_, info) => {
        if (info.offset.y > 90 || info.velocity.y > 650) onClose()
        else if (info.offset.y < -55) setLarge(true)
      }}>
      <div className="sheet-handle" aria-hidden onPointerDown={event => { if (!reduced) controls.start(event) }}><i /></div>
      <header className="sheet-heading"><h2>{title}</h2><div className="inline">
        {!full && <button type="button" className="icon-button" onClick={() => setLarge(!large)} aria-label={large ? t('Formindsk', 'Collapse') : t('Udvid', 'Expand')}>{large ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>}
        <button type="button" className="icon-button" onClick={onClose} aria-label={t('Luk', 'Close')}><X size={20} /></button>
      </div></header>
      {children}
    </motion.div>
  </dialog>
}

