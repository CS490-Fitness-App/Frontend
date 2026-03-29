import React from 'react'
import { ActivityBarGraph } from '../components/ActivityBarGraph'

const data = [
    { label: "Monday", value: 0.5 },
    { label: "Tuesday", value: 0.6 },
    { label: "Wednesday", value: 0.9 },
    { label: "Thursday", value: 1 },
    { label: "Friday", value: 0.4 },
    { label: "Saturday", value: 0 },
    { label: "Sunday", value: 0.6 },

]

export const Activity = () => {
    return (
        <div>
            
            <div className='activity-logger-title'>
                Activity Logger
            </div>

            <div className='activity-logger-info-container'>
                <div className='activity-logger-date-header'>

                </div>
                <div className='activity-logger-bar-graph-container'>
                    <ActivityBarGraph daysJSON={data}></ActivityBarGraph>
                </div>
            </div>
        </div>
    )
}