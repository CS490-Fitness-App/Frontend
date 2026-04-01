import "./CoachCard.css"
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonRunning, faCutlery, faStarHalfStroke, faStar as faSolidStar} from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { faX } from "@fortawesome/free-solid-svg-icons/faX";

export const CoachCard = ({ coach, onClick }) => {
    let reviewDomElements = [];
    let positiveStars = coach.avg_rating-1;
    for (let i = 0; i < 5; i++)
    {
        if (positiveStars >= 1)
        {
            reviewDomElements.push(<FontAwesomeIcon icon={faSolidStar} />)
            positiveStars--;
        }
        else if (positiveStars > 0)
        {
            positiveStars = 0;
            reviewDomElements.push(<FontAwesomeIcon icon={faStarHalfStroke} />)
        }
        else
        {
            reviewDomElements.push(<FontAwesomeIcon icon={faRegularStar} />)
        }
    }
    return (
        <div className="card-container" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <div style={{flex:2}}>
                    <h2 className="card-title">{coach.first_name || "N/A"} {coach.last_name || "N/A"}</h2>
                    <div className="card-tags-container">
                        <div style={{flex:1}} className="card-tag">${coach.hourly_rate || 'N/A'}/hr</div>
                        <FontAwesomeIcon style={{flex:1}} icon={coach.is_trainer ? faPersonRunning : faX} />  
                        <FontAwesomeIcon style={{flex:1}} icon={coach.is_nutrionist ? faCutlery : faX} />
                        <div style={{flex:2}}>  
                            {reviewDomElements}
                        </div>
                    </div>
                </div>

                <img
                className="card-img"
                src={coach.profile_picture || 'https://picsum.photos/300/200'}
                alt={coach.first_name}
                />
            </div>
            

            

            <span className="card-btn">View Coach Bio</span>
        </div>
    )
}
