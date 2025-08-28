import { useRef, useState } from 'react'
import DragDropUpload from '@/components/Upload'
import LineGraph from '@/components/LineGraph'
import Documents from '@/components/Documents'

export default function Manager() {

  return (
    <div className='w-full flex flex-col items-center justify-center'>
      <div className='w-full h-96 flex flex-row items-center justify-between'>

        <div className='w-1/2 h-full p-2'>
          <LineGraph />
        </div>

        <div className='w-1/2 h-full p-2'>
          <DragDropUpload />
        </div>

      </div>

      <div className='w-full p-2'>
        <Documents role='admin' />
      </div>

    </div>
  )
}