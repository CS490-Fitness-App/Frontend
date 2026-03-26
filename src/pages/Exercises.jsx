import React, { useState, useEffect } from 'react'

import { ExerciseCard } from "../components/ExerciseCard"
import { ViewExercise } from "../components/ViewExercise"


import './Exercises.css'

export const Exercises = () => {

    const [exercises, setExercises] = useState([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const openModal = (id) => setSelectedExerciseId(id);
    const closeModal = () => setSelectedExerciseId(null);
    const baseURL = "http://localhost:8000"; // LOCALHOST TODO
        useEffect(() => {
        async function getExercises() {
            try
            {
                
                const response = await fetch(`${baseURL}/exercises/`);
                const exercises = await response.json();
                console.log(exercises);

                setExercises(exercises);

            }
            catch (err)
            {
                console.error("Failed to get Exercises", err);
            }
        }

        getExercises();
    }, []);

    
    const selectedExercise = exercises.find(
        ex => ex.exercise_id === selectedExerciseId
    );
    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Exercise </span>
                    <span className="text-black">Library</span>
                </div>
            </div>
            <div  className="exerciseCards">
                {exercises.map(ex => (
                    <ExerciseCard key={ex.exercise_id}
                    name={ex.name} 
                    level={ex.experience_level} 
                    onClick={() => openModal(ex.exercise_id)} />
                ))}
            </div>

            
            <div className="viewExercises">
                
                {selectedExercise && (
                    <ViewExercise 
                        name={selectedExercise.name}
                        level={selectedExercise.experience_level}
                        type={selectedExercise.category}
                        equipment={selectedExercise.equipment}
                        muscleGroups={selectedExercise.muscleGroups}
                        isOpen={true}
                        onClose={closeModal}
                        />
                    )}
            </div>
        </div>
    )
}