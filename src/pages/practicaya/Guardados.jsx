import { useState } from 'react'
import JobCard from '../../components/practicaya/JobCard.jsx'
import FilterBar from '../../components/practicaya/FilterBar.jsx'
import { savedJobs, emptyStates } from '../../data/practicaYaContent.js'
import './practicaya-pages.css'

function Guardados() {
  const [jobs, setJobs] = useState(savedJobs)

  const removeJob = (id) => {
    setJobs((prev) => prev.filter((job) => job.id !== id))
  }

  return (
    <section className="pya-page">
      <FilterBar />

      {jobs.length === 0 ? (
        <p className="pya-page__empty">{emptyStates.guardados}</p>
      ) : (
        <div className="pya-page__grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} saved onRemove={() => removeJob(job.id)} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Guardados
