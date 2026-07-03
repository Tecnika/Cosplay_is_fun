import type { ColorTheme, StyleVariant } from '@/types'
import styles from './DesignSettings.module.css'

interface DesignSettingsProps {
  colorTheme: ColorTheme
  styleVariant: StyleVariant
  onColorChange: (t: ColorTheme) => void
  onStyleChange: (s: StyleVariant) => void
}

const COLOR_THEMES: { key: ColorTheme; label: string; colors: string[] }[] = [
  { key: 'cosplay', label: 'Cosplay', colors: ['#6c5ce7', '#a29bfe', '#fd79a8'] },
  { key: 'ocean', label: 'Ocean', colors: ['#0984e3', '#74b9ff', '#00cec9'] },
  { key: 'sunset', label: 'Sunset', colors: ['#e17055', '#fab1a0', '#fdcb6e'] },
  { key: 'forest', label: 'Forest', colors: ['#00b894', '#55efc4', '#a29bfe'] },
]

const STYLE_VARIANTS: { key: StyleVariant; label: string; desc: string }[] = [
  { key: 'rounded', label: 'Rounded', desc: 'Мягкие скругления' },
  { key: 'sharp', label: 'Sharp', desc: 'Острые углы' },
  { key: 'glass', label: 'Glass', desc: 'Стеклянный' },
  { key: 'bold', label: 'Bold', desc: 'Контрастный' },
]

export function DesignSettings({ colorTheme, styleVariant, onColorChange, onStyleChange }: DesignSettingsProps) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Цветовая схема</h3>
        <div className={styles.grid}>
          {COLOR_THEMES.map((t) => (
            <button
              key={t.key}
              className={`${styles.card} ${colorTheme === t.key ? styles.active : ''}`}
              onClick={() => onColorChange(t.key)}
            >
              <div className={styles.swatches}>
                {t.colors.map((c, i) => (
                  <span key={i} className={styles.swatch} style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className={styles.label}>{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Стиль</h3>
        <div className={styles.grid}>
          {STYLE_VARIANTS.map((s) => (
            <button
              key={s.key}
              className={`${styles.card} ${styleVariant === s.key ? styles.active : ''}`}
              onClick={() => onStyleChange(s.key)}
            >
              <div className={`${styles.preview} ${styles[s.key]}`}>
                <div className={styles.previewBox} />
                <div className={styles.previewBox} />
              </div>
              <span className={styles.label}>{s.label}</span>
              <span className={styles.desc}>{s.desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
