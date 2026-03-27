import "./ActivityBarGraph.css"
import React from 'react'
import { useState } from 'react'

const ActivtyBarGraphElement = ({label, style}) => 
{
    return (
        <div className="activity-bar-graph-element-container">
            <div className="activity-bar-graph-element" style={style}>
                
            </div>
            <h1 className="activity-bar-graph-day-text">{label}</h1>
        </div>
    )
}

export const ActivityBarGraph = ({daysJSON}) => {
    return (
        <div className="activity-bar-graph">
            { daysJSON.map((element, index) => (
                <ActivtyBarGraphElement
                key={index}
                label={element.label}
                style={{ height: `${element.value * 100}%` }}
                ></ActivtyBarGraphElement>
            ))}
        </div>
    )
}