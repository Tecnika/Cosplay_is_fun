import type { TaskNode, Reference, ShoppingItem } from '@/types'
import { TaskNodeEditor } from './TaskNodeEditor'
import styles from './WorkPlanTree.module.css'

interface WorkPlanTreeProps {
  tasks: TaskNode[]
  references: Reference[]
  shoppingItems: ShoppingItem[]
  onChange: (tasks: TaskNode[]) => void
}

export function WorkPlanTree({ tasks, references, shoppingItems, onChange }: WorkPlanTreeProps) {
  function handleUpdate(path: number[], updated: TaskNode) {
    const newTasks = [...tasks]
    let current = newTasks
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children
    }
    current[path[path.length - 1]] = updated
    onChange(newTasks)
  }

  function handleDelete(path: number[]) {
    if (path.length === 0) return
    const newTasks = [...tasks]
    let current = newTasks
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children
    }
    current.splice(path[path.length - 1], 1)
    onChange(newTasks)
  }

  function addRootTask() {
    const task: TaskNode = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      status: 'pending',
      milestone: false,
      referenceIds: [],
      shoppingItemIds: [],
      children: [],
    }
    onChange([...tasks, task])
  }

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <h3 className={styles.title}>План работ</h3>
        <button type="button" onClick={addRootTask} className={styles.addBtn}>+ Задача</button>
      </div>
      {tasks.length === 0 && <p className={styles.empty}>Нет задач</p>}
      {tasks.map((node, i) => (
        <TaskNodeEditor
          key={node.id}
          node={node}
          index={i}
          parents={[]}
          references={references}
          shoppingItems={shoppingItems}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
