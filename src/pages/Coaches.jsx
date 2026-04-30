import React, { useState, useEffect } from 'react'

import { CoachCard } from "../components/CoachCard"
import { ViewCoach } from "../components/ViewCoach"
import { CoachFilters } from '../components/CoachFilters'

import './Coaches.css'
import { API_BASE_URL } from '../utils/apiBaseUrl'

export const Coaches = () => {
    const [coaches, setCoachs] = useState([])
    const [selectedCoach, setSelectedCoach] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        name: '',
        min_rate: '',
        max_rate: '',
        nutritionist: false,
        trainer: false,
        session_format: '',
        specialty: '',
        avg_rating: 0,
        day: '',
    })

    const buildQuery = (values) => {
        const params = new URLSearchParams()

        if (values.name) params.append('name', values.name)
        if (values.min_rate) params.append('min_rate', values.min_rate)
        if (values.max_rate) params.append('max_rate', values.max_rate)
        if (values.nutritionist) params.append('nutritionist', 'true')
        if (values.trainer) params.append('trainer', 'true')
        if (values.session_format) params.append('session_format', values.session_format)
        if (values.specialty) params.append('specialty', values.specialty)
        if (values.avg_rating) params.append('avg_rating', values.avg_rating)
        if (values.day) params.append('day', values.day)

        return params.toString()
    }

    const openModal = (coach) => {
        setSelectedCoach(coach)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedCoach(null)
    }

    useEffect(() => {
        const queryString = buildQuery(filters)
        const coachesUrl = queryString ? `${API_BASE_URL}/coaches/?${queryString}` : `${API_BASE_URL}/coaches/`

        setLoading(true)
        setError(null)

        fetch(coachesUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load coaches (${res.status})`)
                return res.json()
            })
            .then(data => {
                setCoachs(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [filters])

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
            {error && <p className="feedback-msg error" style={{ padding: '1rem 2rem' }}>{error}</p>}
            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>

                <CoachFilters filters={filters} setFilters={setFilters} />

                <div style={{ display: 'flex', marginTop:'2rem', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                    {coaches.map(coach => (
                        <CoachCard
                            key={coach.coach_id}
                            coach={coach}
                            onClick={() => openModal(coach)}
                        />
                    ))}
                </div>
            </div>

            <ViewCoach isOpen={isModalOpen} onClose={closeModal} coach={selectedCoach} />
        </div>
    )
}
