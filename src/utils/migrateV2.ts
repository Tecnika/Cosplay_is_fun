import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'

export async function migrateShoppingItems() {
  const db = getFirebaseDb()
  console.log('🚀 Миграция: shoppingList → shoppingItems')

  // 1. Читаем старые данные
  const [costumeSnap, propSnap, projectSnap] = await Promise.all([
    getDocs(collection(db, 'costumes')),
    getDocs(collection(db, 'workshop_props')),
    getDocs(collection(db, 'workshop_projects')),
  ])

  const costumes = costumeSnap.docs.map((d) => ({ id: d.id, data: d.data() }))
  const props = propSnap.docs.map((d) => ({ id: d.id, data: d.data() }))
  const projects = projectSnap.docs.map((d) => ({ id: d.id, data: d.data() }))

  // 2. Строим карту: costumeId → projectIds, propId → projectIds
  const costumeProjects: Record<string, string[]> = {}
  const propProjects: Record<string, string[]> = {}

  projects.forEach(({ id: projectId, data }) => {
    const cids: string[] = data.costumeIds || []
    const pids: string[] = data.propIds || []

    cids.forEach((cid) => {
      if (!costumeProjects[cid]) costumeProjects[cid] = []
      if (!costumeProjects[cid].includes(projectId)) costumeProjects[cid].push(projectId)
    })

    pids.forEach((pid) => {
      if (!propProjects[pid]) propProjects[pid] = []
      if (!propProjects[pid].includes(projectId)) propProjects[pid].push(projectId)
    })
  })

  // 3. Собираем shopping items из образов
  const allItems: { item: Record<string, unknown>; srcType: string; srcId: string; userId: string; projectIds: string[] }[] = []

  costumes.forEach(({ id, data }) => {
    const list: Record<string, unknown>[] = data.shoppingList || []
    const userId = data.userId || ''
    const pIds = costumeProjects[id] || []
    list.forEach((it) => {
      allItems.push({
        item: {
          item: it.item || '',
          forWhat: it.forWhat || '',
          link: it.link || '',
          price: it.price || 0,
          quantity: it.quantity || 1,
          status: it.status || 'to_buy',
          statusNote: it.statusNote || '',
        },
        srcType: 'costume',
        srcId: id,
        userId,
        projectIds: pIds,
      })
    })
  })

  // 4. Собираем shopping items из реквизита
  props.forEach(({ id, data }) => {
    const list: Record<string, unknown>[] = data.shoppingList || []
    const userId = data.userId || ''
    const pIds = propProjects[id] || []
    list.forEach((it) => {
      allItems.push({
        item: {
          item: it.item || '',
          forWhat: it.forWhat || '',
          link: it.link || '',
          price: it.price || 0,
          quantity: it.quantity || 1,
          status: it.status || 'to_buy',
          statusNote: it.statusNote || '',
        },
        srcType: 'prop',
        srcId: id,
        userId,
        projectIds: pIds,
      })
    })
  })

  // 5. Собираем shopping items из проектов
  projects.forEach(({ id, data }) => {
    const list: Record<string, unknown>[] = data.shoppingList || []
    const userId = data.ownerId || ''
    list.forEach((it) => {
      allItems.push({
        item: {
          item: it.item || '',
          forWhat: it.forWhat || '',
          link: it.link || '',
          price: it.price || 0,
          quantity: it.quantity || 1,
          status: it.status || 'to_buy',
          statusNote: it.statusNote || '',
        },
        srcType: 'project',
        srcId: id,
        userId,
        projectIds: [id],
      })
    })
  })

  console.log(`📊 Всего покупок: ${allItems.length}`)

  // 6. Пишем батчами по 500
  const BATCH_LIMIT = 500
  for (let i = 0; i < allItems.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    const chunk = allItems.slice(i, i + BATCH_LIMIT)
    const now = Date.now()

    chunk.forEach((entry, j) => {
      const ref = doc(collection(db, 'shoppingItems'))
      batch.set(ref, {
        ...entry.item,
        id: ref.id,
        userId: entry.userId,
        sourceType: entry.srcType,
        sourceId: entry.srcId,
        linkedTo: entry.projectIds,
        createdAt: now + j,
      })
    })

    await batch.commit()
    console.log(`✅ Батч ${i / BATCH_LIMIT + 1}/${Math.ceil(allItems.length / BATCH_LIMIT)}`)
  }

  // 7. Создаём связки projectCostumes
  let linkCount = 0
  for (const project of projects) {
    const cids: string[] = project.data.costumeIds || []
    for (let i = 0; i < cids.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db)
      const chunk = cids.slice(i, i + BATCH_LIMIT)
      chunk.forEach((cid) => {
        const ref = doc(collection(db, 'projectCostumes'))
        batch.set(ref, { projectId: project.id, costumeId: cid, addedAt: Date.now() })
      })
      await batch.commit()
      linkCount += chunk.length
    }
  }
  console.log(`🔗 Связок costume→project: ${linkCount}`)

  // 8. Создаём связки projectProps
  linkCount = 0
  for (const project of projects) {
    const pids: string[] = project.data.propIds || []
    for (let i = 0; i < pids.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db)
      const chunk = pids.slice(i, i + BATCH_LIMIT)
      chunk.forEach((pid) => {
        const ref = doc(collection(db, 'projectProps'))
        batch.set(ref, { projectId: project.id, propId: pid, addedAt: Date.now() })
      })
      await batch.commit()
      linkCount += chunk.length
    }
  }
  console.log(`🔗 Связок prop→project: ${linkCount}`)

  // 9. Очищаем старые поля (опционально)
  console.log('💡 Старые поля (shoppingList, costumeIds, propIds) остались в документах. Можно удалить вручную через консоль Firestore.')

  console.log('✅ Миграция завершена!')
}
