import React, { useState, useEffect } from 'react'

import { CoachCard } from "../components/CoachCard"
import { ViewCoach } from "../components/ViewCoach"
import { CoachFilters } from "../components/CoachFilters"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faAngleDown} from '@fortawesome/free-solid-svg-icons';

import './Coaches.css'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const Coaches = () => {
    const [coaches, setCoachs] = useState([])
    const [selectedCoach, setSelectedCoach] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [query, setQuery] = useState('');

    const [filters, setFilters] = useState({
        name: "",
        min_rate: 0,
        max_rate: 0,
        nutritionist: false,
        trainer: false,
        session_format: "",
        specialty: "",
        avg_rating: 0
    });

    const openModal = (coach) => {
        setSelectedCoach(coach)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedCoach(null)
    }

    const buildQuery = (filters) => {
        const params = new URLSearchParams()

        if (filters.name) params.append("name", filters.name)
        if (filters.min_rate) params.append("min_rate", filters.min_rate)
        if (filters.max_rate) params.append("max_rate", filters.max_rate)
        if (filters.nutritionist) params.append("nutritionist", filters.nutritionist)
        if (filters.trainer) params.append("trainer", filters.trainer)
        if (filters.session_format) params.append("session_format", filters.session_format)
        if (filters.specialty) params.append("specialty", filters.specialty)
        if (filters.avg_rating) params.append("avg_rating", filters.avg_rating)

        return params.toString();
    };

    useEffect(() => {
        setLoading(true)
        const queryString = buildQuery(filters);
        fetch(`${API_BASE_URL}/coaches?${queryString}`)
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
    }, [filters]);

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
