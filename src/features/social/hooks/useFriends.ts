import { useState, useEffect } from 'react'
import type { Friendship, FriendRelation } from '../types'
import { getUserFriendships, getFriendId, getFriendRelation } from '../services/friendsService'

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
}

export function useFriends(uid: string | undefined): UseFriendsResult {
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }

    let cancelled = false
    getUserFriendships(uid).then((data) => {
      if (!cancelled) { setFriendships(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [uid])

  const friends = friendships
    .filter((f) => f.status === 'accepted')
    .map((f) => ({ friendship: f, friendId: getFriendId(f, uid!), relation: 'friend' as FriendRelation }))

  const incoming = friendships
    .filter((f) => f.status === 'pending' && f.actionUser !== uid)
    .map((f) => ({ friendship: f, friendId: getFriendId(f, uid!), relation: 'subscriber' as FriendRelation }))

  const outgoing = friendships
    .filter((f) => f.status === 'pending' && f.actionUser === uid)
    .map((f) => ({ friendship: f, friendId: getFriendId(f, uid!), relation: 'subscribed' as FriendRelation }))

  return { friends, incoming, outgoing, loading }
}
