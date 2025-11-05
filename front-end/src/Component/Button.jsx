import React from 'react'

function Button({text,action,className}) {
  return (
    <div>
      <button onClick={action} className={`rounded-md py-2 ${className}`} >{text}</button>
    </div>
  )
}

export default Button
