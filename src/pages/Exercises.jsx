import React from 'react'

import { ExerciseCard } from "../components/ExerciseCard"

export const Exercises = () => {
    return (
        <div>
            <div class="page-heading">
                <div class="h1">
                    <span class="text-black">Exercises </span>
                </div>
            </div>
            <div>
                <ExerciseCard />
            </div>
        </div>
    )
}