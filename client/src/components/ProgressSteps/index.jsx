import React from 'react'

const ProgressSteps = ({ steps, currentStep }) => {
  return (
    <div className='flex flex-col justify-center items-center w-full p-4'>
      <h2 className='text-2xl font-bold pb-4'>  {steps[currentStep - 1]} </h2>
      <div className='flex justify-center items-center gap-4 w-full'>
        {steps.map((step, index) => (
          <div key={index} className="flex-1 items-center w-full h-2 rounded-full">
            <div className={`w-full h-full rounded-full ${index <= currentStep - 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        ))}
      </div>
    </div >
  )
}

export default ProgressSteps