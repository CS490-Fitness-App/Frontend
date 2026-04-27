import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Sidebar } from '../components/Sidebar'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import './Pages.css'
import './ViewProgress.css'

const localizer = momentLocalizer(moment)

const LineChart = ({ title, subtitle, points, series, timeRange, onTimeRangeChange, progressData, selectedMonth, onMonthChange, monthOptions, onDateSelect }) => {
    const width = 880
    const height = 320
    const margin = { top: 32, right: 32, bottom: timeRange === 'monthly' ? 64 : 56, left: 68 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const allValues = series.flatMap((line) => points.map((point) => line.getValue(point)).filter((value) => value !== null && value !== undefined))
    const safeMin = allValues.length ? Math.min(...allValues) : 0
    const safeMax = allValues.length ? Math.max(...allValues) : 10
    
    // Round to multiples of 5 with padding
    const roundDown = (n) => Math.floor(n / 5) * 5
    const roundUp = (n) => Math.ceil(n / 5) * 5
    const yMin = roundDown(safeMin - 2.5)
    const yMax = roundUp(safeMax + 2.5)
    const yRange = Math.max(5, yMax - yMin)
    
    // Generate grid lines at multiples of 5
    const gridValues = []
    for (let val = yMin; val <= yMax; val += 5) {
        gridValues.push(val)
    }

    const xForIndex = (index) => {
        if (points.length <= 1) return margin.left
        return margin.left + (index / (points.length - 1)) * innerWidth
    }

    const yForValue = (value) => margin.top + ((yMax - value) / yRange) * innerHeight

    const segmentsForSeries = (line) => {
        const segments = []
        let currentSegment = []

        points.forEach((point, index) => {
            const value = line.getValue(point)
            if (value === null || value === undefined) {
                if (currentSegment.length) {
                    segments.push(currentSegment)
                    currentSegment = []
                }
                return
            }

            currentSegment.push({
                date: point.date,
                x: xForIndex(index),
                y: yForValue(value),
                value,
            })
        })

        if (currentSegment.length) {
            segments.push(currentSegment)
        }

        return segments
    }

    const monthlyLabelInterval = Math.max(1, Math.ceil((points.length - 1) / 7))
    const shouldRenderXAxisLabel = (index) => {
        if (timeRange !== 'monthly') return true
        if (index === 0 || index === points.length - 1) return true
        return index % monthlyLabelInterval === 0
    }

    return (
        <div className="progress-panel">
            <div className="progress-panel-header">
                <div className="progress-header-top">
                    <div className="progress-header-info">
                        <h3>{title}</h3>
                        <p>{subtitle}</p>
                        {progressData?.progress_message && (
                            <div className="progress-metric">
                                <span className={`progress-badge ${progressData.progress_percent > 0 ? 'positive' : progressData.progress_percent < 0 ? 'negative' : 'neutral'}`}>
                                    {progressData.progress_message}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="progress-month-display">
                        {timeRange === 'monthly' ? (
                            <select
                                className="month-select"
                                value={selectedMonth}
                                onChange={(event) => onMonthChange(event.target.value)}
                            >
                                {monthOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        ) : (
                            (() => {
                                const [year, month] = selectedMonth.split('-').map(Number)
                                const labelDate = new Date(year, month - 1, 1)
                                return labelDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                            })()
                        )}
                    </div>
                    <div className="progress-header-controls">
                        <button
                            className={`time-range-btn ${timeRange === 'weekly' ? 'active' : ''}`}
                            onClick={() => onTimeRangeChange('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={`time-range-btn ${timeRange === 'monthly' ? 'active' : ''}`}
                            onClick={() => onTimeRangeChange('monthly')}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
            </div>

            <svg className="progress-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
                {/* Grid lines and Y-axis labels */}
                {gridValues.map((gridValue) => {
                    const y = yForValue(gridValue)
                    return (
                        <g key={`grid-${gridValue}`}>
                            <line x1={margin.left} y1={y} x2={margin.left + innerWidth} y2={y} className="chart-grid-line" />
                            <text x={margin.left - 8} y={y + 5} className="chart-axis-label" textAnchor="end">{Math.round(gridValue)}</text>
                        </g>
                    )
                })}

                {/* Lines */}
                {series.map((line) => (
                    <g key={line.key}>
                        {segmentsForSeries(line).map((segment, segmentIndex) => {
                            const d = segment.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
                            return <path key={`${line.key}-${segmentIndex}`} d={d} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                        })}
                        {/* Dots at data points */}
                        {segmentsForSeries(line).map((segment, segmentIndex) =>
                            segment.map((point, pointIndex) => (
                                <circle
                                    key={`dot-${line.key}-${segmentIndex}-${pointIndex}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="6"
                                    fill={line.color}
                                    opacity="0.28"
                                    className="progress-chart-hit"
                                    onClick={() => onDateSelect?.(point.date)}
                                />
                            ))
                        )}
                        {segmentsForSeries(line).map((segment, segmentIndex) =>
                            segment.map((point, pointIndex) => (
                                <circle
                                    key={`visible-dot-${line.key}-${segmentIndex}-${pointIndex}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="3"
                                    fill={line.color}
                                    opacity="0.9"
                                    className="progress-chart-point progress-chart-point-clickable"
                                    onClick={() => onDateSelect?.(point.date)}
                                />
                            ))
                        )}
                    </g>
                ))}

                {/* X-axis labels */}
                {points.map((point, index) => {
                    if (!shouldRenderXAxisLabel(index)) return null
                    return (
                        <text
                            key={point.date}
                            x={xForIndex(index)}
                            y={height - 12}
                            textAnchor="middle"
                            className={`chart-axis-label ${timeRange === 'monthly' ? 'chart-axis-label-monthly' : ''}`}
                        >
                            {point.label}
                        </text>
                    )
                })}
            </svg>

            <div className="progress-chart-hint">Click a data point to open that day&apos;s activity log.</div>

            <div className="progress-legend">
                {series.map((line) => (
                    <div key={line.key} className="legend-item">
                        <span className="legend-swatch" style={{ backgroundColor: line.color }} />
                        <span>{line.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const StepsBarChart = ({ points, averageSteps, onDateSelect }) => {
    const sortedPoints = useMemo(
        () => [...points].sort((a, b) => new Date(a.date) - new Date(b.date)),
        [points]
    )

    const stepValues = sortedPoints.map((point) => point.steps)
    const minSteps = Math.min(...stepValues, averageSteps)
    const maxSteps = Math.max(...stepValues, averageSteps)
    const axisPadding = Math.max(300, (maxSteps - minSteps) * 0.2)
    const axisMin = Math.max(0, minSteps - axisPadding)
    const axisMax = maxSteps + axisPadding
    const axisRange = Math.max(1, axisMax - axisMin)

    const percentForSteps = (steps) => {
        const pct = ((steps - axisMin) / axisRange) * 100
        return Math.max(8, Math.min(100, pct))
    }

    const averagePct = percentForSteps(averageSteps)

    return (
        <div className="progress-panel">
            <div className="progress-panel-header">
                <h3>Weekly Steps</h3>
                <p>Daily steps with a weekly average line.</p>
            </div>

            <div className="steps-chart">
                {sortedPoints.map((point, index) => {
                    const heightPct = percentForSteps(point.steps)
                    const previousSteps = index > 0 ? sortedPoints[index - 1].steps : null
                    const delta = previousSteps === null ? null : point.steps - previousSteps
                    const trendClass = delta === null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
                    const trendLabel = delta === null ? 'Start' : `${delta > 0 ? '+' : ''}${delta.toLocaleString()}`

                    return (
                        <button
                            key={point.date}
                            type="button"
                            className="steps-chart-day steps-chart-day-btn"
                            onClick={() => onDateSelect?.(point.date)}
                        >
                            <div className="steps-chart-column-wrap">
                                <div className="steps-avg-line" style={{ bottom: `${averagePct}%` }} />
                                <div className={`steps-chart-column ${trendClass}`} style={{ height: `${heightPct}%` }} />
                            </div>
                            <div className="steps-day-label">{point.label}</div>
                            <div className="steps-value-label">{point.steps.toLocaleString()}</div>
                            <div className={`steps-trend-label ${trendClass}`}>{trendLabel}</div>
                        </button>
                    )
                })}
            </div>

            <div className="progress-chart-hint">Click a day column to review that submitted log.</div>
            <div className="progress-summary">Weekly average: {averageSteps.toFixed(1)} steps</div>
        </div>
    )
}

const WeeklyAveragesChart = ({ averages }) => {
    const moodShifted = averages.mood_score === null || averages.mood_score === undefined ? 0 : averages.mood_score + 2
    const bars = [
        {
            key: 'water',
            label: 'Water (glasses)',
            value: averages.water_intake || 0,
            max: Math.max(12, (averages.water_intake || 0) * 1.25, 1),
            color: '#7aa2ff',
            display: averages.water_intake === null || averages.water_intake === undefined ? 'No data' : averages.water_intake.toFixed(1),
        },
        {
            key: 'calories',
            label: 'Calories',
            value: averages.calories_intake || 0,
            max: Math.max(3000, (averages.calories_intake || 0) * 1.2, 1),
            color: '#f7a35c',
            display: averages.calories_intake === null || averages.calories_intake === undefined ? 'No data' : averages.calories_intake.toFixed(1),
        },
        {
            key: 'mood',
            label: 'Mood (-2 to +2)',
            value: moodShifted,
            max: 4,
            color: '#7ccf9a',
            display: `${averages.mood_label} (${averages.mood_score === null || averages.mood_score === undefined ? 'No data' : averages.mood_score.toFixed(2)})`,
        },
    ]

    return (
        <div className="progress-panel">
            <div className="progress-panel-header">
                <h3>Weekly Averages</h3>
                <p>Average water intake, calories, and mood for the week.</p>
            </div>

            <div className="weekly-averages-chart">
                {bars.map((bar) => {
                    const widthPct = Math.max(0, Math.min(100, (bar.value / bar.max) * 100))
                    return (
                        <div key={bar.key} className="weekly-averages-row">
                            <div className="weekly-averages-meta">
                                <span className="weekly-averages-label">{bar.label}</span>
                                <span className="weekly-averages-value">{bar.display}</span>
                            </div>
                            <div className="weekly-averages-track">
                                <div className="weekly-averages-fill" style={{ width: `${widthPct}%`, backgroundColor: bar.color }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const STATUS_COLOR = {
    Completed: '#6fbf73',
    Scheduled: '#8B8BF5',
    Missed: '#ef8354',
}

const SummaryCards = ({ summary }) => {
    const cards = [
        { label: 'Weekly Streak', value: summary.weekly_streak != null ? `${summary.weekly_streak} wks` : '—' },
        { label: 'Current Plan', value: summary.current_plan_name || 'None assigned' },
        {
            label: 'Plan Progress',
            value: summary.intended_duration_weeks
                ? `${summary.weeks_completed} / ${summary.intended_duration_weeks} wks`
                : summary.weeks_completed != null ? `${summary.weeks_completed} wks` : '—',
        },
        { label: 'Last Workout', value: summary.last_workout_date || 'No logs yet' },
        { label: 'Height', value: summary.height || '—' },
        { label: 'Weight', value: summary.current_weight_lb != null ? `${summary.current_weight_lb} lb` : '—' },
        { label: 'Goal Weight', value: summary.goal_weight_lb != null ? `${summary.goal_weight_lb} lb` : '—' },
        { label: 'Age', value: summary.age != null ? `${summary.age} yrs` : '—' },
        { label: 'Sex', value: summary.sex || '—' },
    ]
    return (
        <div className="progress-panel">
            <div className="progress-panel-header">
                <h3>Overview</h3>
                <p>Streak, current workout plan, and recent activity.</p>
            </div>
            <div className="cp-summary-grid">
                {cards.map((c) => (
                    <div key={c.label} className="cp-summary-card">
                        <div className="cp-summary-label">{c.label}</div>
                        <div className="cp-summary-value">{c.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const GoalsPanel = ({ goals }) => (
    <div className="progress-panel">
        <div className="progress-panel-header">
            <h3>Goals</h3>
            <p>Fitness goals the client has set.</p>
        </div>
        {goals.length === 0 ? (
            <p className="cp-empty">No goals recorded.</p>
        ) : (
            <div className="cp-goals-list">
                {goals.map((g, i) => (
                    <span key={i} className="cp-goal-tag">{g.goal_type}</span>
                ))}
            </div>
        )}
    </div>
)

const WorkoutCalendarPanel = ({ events }) => {
    const calEvents = useMemo(() => events.map((e) => ({
        title: e.workout_name,
        start: moment(e.date, 'YYYY-MM-DD').toDate(),
        end: moment(e.date, 'YYYY-MM-DD').add(1, 'day').toDate(),
        allDay: true,
        status: e.status,
    })), [events])

    return (
        <div className="progress-panel">
            <div className="progress-panel-header">
                <h3>Workout Calendar</h3>
                <p>Scheduled workouts — past 30 days and next 90 days.</p>
            </div>
            <div style={{ height: 480 }}>
                <Calendar
                    localizer={localizer}
                    events={calEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    views={['month', 'week']}
                    style={{ height: '100%' }}
                    eventPropGetter={(event) => ({
                        style: { backgroundColor: STATUS_COLOR[event.status] || '#8B8BF5' },
                    })}
                />
            </div>
            <div className="cp-cal-legend">
                {Object.entries(STATUS_COLOR).map(([label, color]) => (
                    <span key={label} className="cp-cal-legend-item">
                        <span className="cp-cal-dot" style={{ backgroundColor: color }} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    )
}



export const ViewProgress = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()
    const { customAuth } = useCustomAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const clientUserId = searchParams.get('client_id')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [progressData, setProgressData] = useState(null)
    const [timeRange, setTimeRange] = useState('weekly')
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true)
            setError('')

            try {
                let token
                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    setError('You must be logged in to view progress.')
                    return
                }

                let url = `${API_BASE_URL}/dashboard/client/progress?time_range=${timeRange}`
                if (timeRange === 'monthly') {
                    url += `&selected_month=${selectedMonth}`
                }
                if (clientUserId) {
                    url += `&client_user_id=${clientUserId}`
                }

                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!response.ok) {
                    throw new Error('Unable to load progress data.')
                }

                const payload = await response.json()
                setProgressData(payload)

                if (payload?.weight_chart?.selected_month && payload.weight_chart.selected_month !== selectedMonth) {
                    setSelectedMonth(payload.weight_chart.selected_month)
                }
            } catch (fetchError) {
                setError(fetchError.message || 'Unable to load progress data.')
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [isAuthenticated, customAuth, getAccessTokenSilently, timeRange, selectedMonth, clientUserId])

    const monthOptions = useMemo(() => {
        const options = progressData?.weight_chart?.available_months || []
        return options.length
            ? options
            : [{
                value: selectedMonth,
                label: (() => {
                    const [year, month] = selectedMonth.split('-').map(Number)
                    const labelDate = new Date(year, month - 1, 1)
                    return labelDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                })(),
            }]
    }, [progressData, selectedMonth])

    const weightSeries = useMemo(() => ([
        {
            key: 'goal',
            label: 'Goal Weight',
            color: '#6fbf73',
            getValue: (point) => point.goal_weight_lb,
        },
        {
            key: 'survey',
            label: 'Daily Survey Weight',
            color: '#ef8354',
            getValue: (point) => point.survey_weight_lb,
        },
    ]), [])

    const openActivityDay = (date) => {
        navigate(`/activity-logger?date=${date}`)
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="view-progress-container">
                <div className="page-heading">
                    <div className="h2">
                        {progressData?.client_name ? (
                            <>
                                <span className="text-black">{progressData.client_name}&apos;s Progress </span>
                                <span className="text-purple">Insights</span>
                            </>
                        ) : (
                            <>
                                <span className="text-black">Your Progress </span>
                                <span className="text-purple">Insights</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="view-progress-content">
                    {loading && <p className="stat-descriptor">Loading progress charts...</p>}
                    {!loading && error && <p className="feedback-msg error">{error}</p>}

                    {!loading && !error && progressData && (
                        <>
                            {progressData.summary && (
                                <SummaryCards summary={progressData.summary} />
                            )}

                            {progressData.goals && (
                                <GoalsPanel goals={progressData.goals} />
                            )}

                            <LineChart
                                title="Weight Trend"
                                subtitle="Current weight, goal weight, and daily survey weight changes."
                                points={progressData.weight_chart.points}
                                series={weightSeries}
                                timeRange={timeRange}
                                onTimeRangeChange={setTimeRange}
                                progressData={progressData.weight_chart}
                                selectedMonth={selectedMonth}
                                onMonthChange={setSelectedMonth}
                                monthOptions={monthOptions}
                                onDateSelect={openActivityDay}
                            />

                            <StepsBarChart
                                points={progressData.steps_chart.points}
                                averageSteps={progressData.steps_chart.average_steps}
                                onDateSelect={openActivityDay}
                            />

                            <WeeklyAveragesChart averages={progressData.weekly_averages} />

                            {progressData.calendar_events && (
                                <WorkoutCalendarPanel events={progressData.calendar_events} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
