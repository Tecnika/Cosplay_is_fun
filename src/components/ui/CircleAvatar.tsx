import styles from './CircleAvatar.module.css'

interface CircleAvatarProps {
  name: string
  url?: string
  size?: 'card' | 'detail' | 'mini'
}

const SIZE_MAP = {
  card: styles.cardSize,
  detail: styles.detailSize,
  mini: styles.miniSize,
}

export function CircleAvatar({ name, url, size = 'card' }: CircleAvatarProps) {
  return (
    <div
      className={`${styles.avatar} ${SIZE_MAP[size]}`}
      style={url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover' } : undefined}
    >
      {!url && name.charAt(0).toUpperCase()}
    </div>
  )
}
