import React, { useState } from 'react'

import { ExerciseCard } from "../components/ExerciseCard"
import { ViewExercise } from "../components/ViewExercise"

export const Exercises = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Exercises </span>
                </div>
            </div>
            <div>
                <ExerciseCard onClick={openModal} />
            </div>

            <ViewExercise isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}