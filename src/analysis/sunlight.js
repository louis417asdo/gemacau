import * as Cesium from 'cesium'

let shadowEnabled = false
let currentDate = new Date()

export function setupSunlight(viewer) {
  currentDate.setHours(12, 0, 0, 0)

  const timeline = document.getElementById('sunlight-timeline')
  const dateLabel = document.getElementById('sunlight-date')
  const timeLabel = document.getElementById('sunlight-time')
  const toggleBtn = document.getElementById('sunlight-toggle')
  const presetBtns = document.querySelectorAll('.sunlight-preset')

  function updateSun(date) {
    viewer.scene.globe.enableLighting = true
    viewer.scene.sun = new Cesium.Sun()
    viewer.scene.sun.glowFactor = 1

    const julianDate = Cesium.JulianDate.fromDate(date)
    viewer.scene.globe.lightingFadeInDistance = 0

    const dateStr = date.toLocaleDateString('zh-Hant', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    const timeStr = date.toLocaleTimeString('zh-Hant', {
      hour: '2-digit', minute: '2-digit'
    })
    if (dateLabel) dateLabel.textContent = dateStr
    if (timeLabel) timeLabel.textContent = timeStr

    const sim = viewer.clock
    sim.currentTime = julianDate
    sim.shouldAnimate = false
  }

  function setPreset(preset) {
    const now = new Date()
    if (preset === 'summer') {
      now.setMonth(5, 21)
    } else if (preset === 'winter') {
      now.setMonth(11, 21)
    } else if (preset === 'equinox') {
      now.setMonth(2, 20)
    }
    now.setHours(12, 0, 0, 0)
    currentDate = now
    updateSun(now)
  }

  toggleBtn.addEventListener('click', () => {
    shadowEnabled = !shadowEnabled
    viewer.scene.globe.enableLighting = shadowEnabled
    toggleBtn.classList.toggle('active')
    toggleBtn.textContent = shadowEnabled ? '陰影：開' : '陰影：關'
    if (shadowEnabled) {
      setPreset('summer')
    }
  })

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!shadowEnabled) {
        shadowEnabled = true
        viewer.scene.globe.enableLighting = true
        toggleBtn.classList.add('active')
        toggleBtn.textContent = '陰影：開'
      }
      presetBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      setPreset(btn.dataset.preset)
    })
  })

  timeline.addEventListener('input', () => {
    const val = parseFloat(timeline.value)
    const hours = Math.floor(val)
    const minutes = Math.round((val - hours) * 60)
    currentDate.setHours(hours, minutes, 0, 0)
    updateSun(currentDate)
  })
}

export function refreshSunlight(viewer) {
  if (!shadowEnabled) return
  viewer.scene.globe.enableLighting = true
  const julianDate = Cesium.JulianDate.fromDate(currentDate)
  viewer.clock.currentTime = julianDate
  viewer.clock.shouldAnimate = false
}

export function isShadowEnabled() {
  return shadowEnabled
}
