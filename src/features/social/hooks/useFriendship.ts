import { useState, useEffect, useCallback } from 'react'
import type { FriendRelation } from '../types'
import { getFriendship, getFriendRelation, sendFriendRequest, acceptFriendRequest, removeFriendship } from '../services/friendsService'

interface UseFriendshipResult {
  relation: FriendRelation
  loading: boolean
  sendRequest: () => Promise<void>
  acceptRequest: () => Promise<void>
  removeFriend: () => Promise<void>
}

/** Статус дружбы между текущим пользователем и другим */
export function useFriendship(myUid: string | undefined, otherUid: string | undefined): UseFriendshipResult {
  const [relation, setRelation] = useState<FriendRelation>('none')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!myUid || !otherUid || myUid === otherUid) {
      setRelation('none')
      setLoading(false)
      return
    }
    const f = await getFriendship(myUid, otherUid)
    setRelation(getFriendRelation(f, myUid))
    setLoading(false)
  }, [myUid, otherUid])

  useEffect(() => { refresh() }, [refresh])

  const sendRequest = useCallback(async () => {
    if (!myUid || !otherUid) return
    await sendFriendRequest(myUid, otherUid)
    setRelation('subscribed')
  }, [myUid, otherUid])

  const acceptRequest = useCallback(async () => {
    if (!myUid || !otherUid) return
    await acceptFriendRequest(myUid, otherUid)
    setRelation('friend')
  }, [myUid, otherUid])

  const removeFriend = useCallback(async () => {
    if (!myUid || !otherUid) return
    await removeFriendship(myUid, otherUid)
    setRelation('none')
  }, [myUid, otherUid])

  return { relation, loading, sendRequest, acceptRequest, removeFriend }
}
