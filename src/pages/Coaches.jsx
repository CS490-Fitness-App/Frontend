import React, { useState, useEffect } from 'react'

import { CoachCard } from "../components/CoachCard"
import { ViewCoach } from "../components/ViewCoach"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const Coaches = () => {
    const [coaches, setCoachs] = useState([])
    const [selectedCoach, setSelectedCoach] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const openModal = (coach) => {
        setSelectedCoach(coach)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedCoach(null)
    }

    useEffect(() => {
        fetch(`${API_BASE_URL}/coaches`)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load coaches (${res.status})`)
                return res.json()
            })
            .then(data => {
                console.log(data);
                setCoachs(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, []);

    /*const selectedcoach = coachs.find(
        ex => ex.coach_id === selectedcoachId
    );*/

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Coach </span>
                    <span className="text-purple">Browser</span>
                </div>
            </div>

            {loading && <p>Loading coachs...</p>}
            {error && <p>Error: {error}</p>}

            <div style={{ display: 'flex', marginTop:'2rem', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                {coaches.map(coach => (
                    <CoachCard
                        key={coach.coach_id}
                        coach={coach}
                        onClick={() => openModal(coach)}
                    />
                ))}
            </div>

            <ViewCoach isOpen={isModalOpen} onClose={closeModal} coach={selectedCoach} />
        </div>
    )
}
