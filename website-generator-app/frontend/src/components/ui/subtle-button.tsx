'use client'

import React, { useState } from 'react'

type SubtleButtonProps = {
  label?: string
  className?: string
  onClick?: () => void
}

const SubtleButton = ({
  label = 'Get Started',
  className = '',
  onClick,
}: SubtleButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      type='button'
      className={`group relative flex h-11 w-[11.5rem] items-center justify-center gap-3 overflow-hidden rounded-lg border-2 border-foreground/60 bg-background/65 backdrop-blur-sm transition-all duration-500 ease-out hover:cursor-pointer hover:scale-105 hover:border-primary hover:shadow-lg hover:shadow-primary/15 active:scale-95 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[100%] ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-amber-200/0 via-amber-200/10 to-amber-200/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

      <span className='relative z-10 text-sm font-medium tracking-wide text-foreground transition-all duration-300 group-hover:text-primary'>
        {label}
      </span>

      <span
        className={`relative z-10 h-4 w-4 rounded-full bg-amber-200 transition-all duration-500 ease-out before:absolute before:inset-0 before:rounded-full before:bg-amber-400 before:opacity-0 before:animate-pulse group-hover:before:opacity-30 ${
          isHovered ? 'scale-110 bg-amber-300 shadow-lg shadow-amber-300/50' : ''
        } ${isPressed ? 'scale-90' : ''}`}
      >
        <div
          className='absolute inset-0 rounded-full bg-amber-200 opacity-0 animate-ping group-hover:opacity-75'
          style={{ animationDuration: '2s' }}
        />
      </span>

      <div className='absolute inset-0 rounded-lg border-2 border-primary/0 opacity-0 transition-all duration-500 group-hover:border-primary/30 group-hover:opacity-100 animate-pulse' />
    </button>
  )
}

export default SubtleButton
