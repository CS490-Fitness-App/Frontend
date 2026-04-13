import React, { useState, useEffect } from 'react'

import { CoachCard } from "../components/CoachCard"
import { ViewCoach } from "../components/ViewCoach"
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

    const openModal = (coach) => {
        setSelectedCoach(coach)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedCoach(null)
    }

    useEffect(() => {
        fetch(`${API_BASE_URL}/coaches?name=${query}`)
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
    }, [query]);

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

            
                <input
                    className='search-bar'
                    type="text"
                    placeholder="Search for a coach..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
    
                <FontAwesomeIcon icon={faAngleDown} style={{marginTop: '2rem',width:'3rem', height: '3rem'}} />



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
