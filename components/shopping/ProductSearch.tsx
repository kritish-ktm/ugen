'use client'
import { useId, useState } from 'react'
import { shoppingSuggestions } from '../../lib/shopping-suggestions'
import { usePreferences } from '../ui/Shell'

export function ProductSearch({value,onChange,onSelect,productNames}: {
  value: string
  onChange: (value:string)=>void
  onSelect: (value:string)=>void
  productNames: string[]
}) {
  const {t}=usePreferences()
  const id=useId()
  const [open,setOpen]=useState(false), [active,setActive]=useState(-1)
  const suggestions=shoppingSuggestions(value,productNames)
  const expanded=open&&suggestions.length>0
  function choose(title:string) {
    onChange(title)
    setOpen(false)
    setActive(-1)
    onSelect(title)
  }
  return <div className="product-search">
    <label htmlFor={id}>{t('Produkt eller mærke','Product or brand')}</label>
    <input id={id} type="search" role="combobox" aria-autocomplete="list" aria-expanded={expanded}
      aria-controls={id+'-suggestions'} aria-activedescendant={expanded&&suggestions[active]?id+'-option-'+active:undefined}
      autoComplete="off" value={value} maxLength={80} required placeholder="Mælk, kaffe, Tuborg…"
      onFocus={()=>{setOpen(true);setActive(-1)}} onBlur={()=>{setOpen(false);setActive(-1)}}
      onChange={event=>{onChange(event.target.value);setOpen(true);setActive(-1)}}
      onKeyDown={event=>{
        if(event.nativeEvent.isComposing) return
        if(event.key==='Escape') {event.preventDefault();setOpen(false);setActive(-1)}
        if((event.key==='ArrowDown'||event.key==='ArrowUp')&&suggestions.length) {
          event.preventDefault()
          setOpen(true)
          setActive(event.key==='ArrowDown'?(!expanded?0:(active+1)%suggestions.length):(!expanded||active<0?suggestions.length-1:(active-1+suggestions.length)%suggestions.length))
        }
        if(event.key==='Enter'&&expanded&&suggestions[active]) {event.preventDefault();choose(suggestions[active])}
      }}/>
    <ul id={id+'-suggestions'} className="product-suggestions" role="listbox" aria-label={t('Søgeforslag','Search suggestions')} hidden={!expanded}>
      {suggestions.map((title,index)=><li id={id+'-option-'+index} role="option" aria-selected={active===index} key={title}
        onPointerDown={event=>event.preventDefault()} onMouseEnter={()=>setActive(index)} onClick={()=>choose(title)}>{title}</li>)}
    </ul>
  </div>
}
