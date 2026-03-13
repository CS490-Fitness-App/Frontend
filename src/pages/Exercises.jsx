import React from 'react'

import { ExerciseCard } from "../components/ExerciseCard"

export const Exercises = () => {
    return (
        <div>
            <h2>Exercises</h2>
            <div>
                <ExerciseCard />
                <ExerciseCard />
                <ExerciseCard />
                <ExerciseCard />
                <ExerciseCard />
            </div>
        </div>
    )
}