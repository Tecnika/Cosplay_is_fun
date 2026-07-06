import { Link } from 'react-router-dom'
import type { WorkshopProject } from '@/types'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  project: WorkshopProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/planner/project/${project.id}`} className={styles.card}>
      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        {project.description && <p className={styles.desc}>{project.description}</p>}
        <div className={styles.meta}>
          <span className={styles.badge}>
            {project.type === 'group' ? 'Групповой' : 'Личный'}
          </span>
          <span className={styles.count}>
            {project.members.length} участник(ов)
          </span>
        </div>
      </div>
    </Link>
  )
}
