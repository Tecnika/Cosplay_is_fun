import { useTheme } from '@/hooks/useTheme'
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth'
import { DesignSettings } from '../components/DesignSettings'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const { profile } = useRequireAuth()
  const { design, setDesign } = useTheme()

  if (!profile) return null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>
      <div className={styles.sections}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Дизайн</h2>
          <DesignSettings
            colorTheme={design.colorTheme}
            styleVariant={design.styleVariant}
            avatarVariant={design.avatarVariant}
            userName={profile.displayName || 'User'}
            onColorChange={(t) => setDesign({ colorTheme: t })}
            onStyleChange={(s) => setDesign({ styleVariant: s })}
            onAvatarChange={(v) => setDesign({ avatarVariant: v })}
          />
        </section>
      </div>
    </div>
  )
}
