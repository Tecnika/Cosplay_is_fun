import { useState, useEffect, useCallback } from 'react'
import type { Friendship, FriendRelation } from '../types'
import { getUserFriendships, getFriendId } from '../services/friendsService'

interface FriendWithRelation {
  friendship: Friendship
  friendId: string
  relation: FriendRelation
}

interface UseFriendsResult {
  friends: FriendWithRelation[]
  incoming: FriendWithRelation[]
  outgoing: FriendWithRelation[]
  loading: boolean
  refresh: () => Promise<void>
}

export function useFriends(uid: string | undefined): UseFriendsResult {
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFriendships = useCallback(async () => {
    if (!uid) { setFriendships([]); setLoading(false); return }
    setLoading(true)
    const data = await getUserFriendships(uid)
    setFriendships(data)
    setLoading(false)
  }, [uid])

  useEffect(() => {
    fetchFriendships()
  }, [fetchFriendships])

  const friends = friendships
    .filter((f) => f.status === 'accepted')
    .map((f) => ({ friendship: f, friendId: getFriendId(f, uid!), relation: 'friend' as FriendRelation }))

  const incoming = friendships
    .filter((f) => f.status === 'pending' && f.actionUser !== uid)
    .map((f) => ({ friendship: f, friendId: getFriendId(f, uid!), relation: 'subscriber' as FriendRelation }))

  const outgoing = friendships
    .filter((f) => f.status === 'pending' && f.actionUser === uid)
    .map((f) => ({ friendship: f, friendId: getFriendId(f, uid!), relation: 'subscribed' as FriendRelation }))

  return { friends, incoming, outgoing, loading, refresh: fetchFriendships }
}
