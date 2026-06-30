import * as Cesium from 'cesium'
import { getComparisonReport } from './simulator.js'

let currentScenario = 'current'

export function setupScenario(viewer) {
  const buttons = document.querySelectorAll('.scenario-btn')

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      switchScenario(viewer, btn.dataset.scenario)
    })
  })
}

function switchScenario(viewer, scenario) {
  currentScenario = scenario

  const slider = document.getElementById('sim-slider')
  const presetBtns = document.querySelectorAll('.sim-preset')
  const infoContent = document.getElementById('info-content')
  const infoPanel = document.getElementById('info-panel')

  if (scenario === 'current') {
    if (slider) slider.value = 7
    presetBtns.forEach(b => b.classList.remove('active'))
    const currentBtn = document.querySelector('.sim-preset[data-floors="7"]')
    if (currentBtn) currentBtn.classList.add('active')
    slider?.dispatchEvent(new Event('input'))
    if (infoPanel) infoPanel.classList.add('hidden')
  } else if (scenario === 'plan-a') {
    if (slider) slider.value = 15
    presetBtns.forEach(b => b.classList.remove('active'))
    const planABtn = document.querySelector('.sim-preset[data-floors="15"]')
    if (planABtn) planABtn.classList.add('active')
    slider?.dispatchEvent(new Event('input'))
    showComparisonReport(infoContent, infoPanel)
  } else if (scenario === 'plan-b') {
    if (slider) slider.value = 25
    presetBtns.forEach(b => b.classList.remove('active'))
    const planBBtn = document.querySelector('.sim-preset[data-floors="25"]')
    if (planBBtn) planBBtn.classList.add('active')
    slider?.dispatchEvent(new Event('input'))
    showComparisonReport(infoContent, infoPanel)
  }
}

function showComparisonReport(infoContent, infoPanel) {
  if (!infoContent || !infoPanel) return
  const report = getComparisonReport()
  infoContent.innerHTML = `
    <strong>方案對比報告</strong><br>
    <table style="width:100%;font-size:12px;margin-top:6px">
      <tr><td>容積率</td><td>${report.current.far.toFixed(1)}</td><td>→</td><td style="color:#00d4aa">${report.proposed.far.toFixed(1)}</td><td style="color:#ff8800">(${report.deltaFar >= 0 ? '+' : ''}${report.deltaFar.toFixed(1)})</td></tr>
      <tr><td>人口</td><td>${report.current.population.toLocaleString()}</td><td>→</td><td style="color:#00d4aa">${report.proposed.population.toLocaleString()}</td><td style="color:#ff8800">(${report.deltaPop >= 0 ? '+' : ''}${report.deltaPop.toLocaleString()})</td></tr>
      <tr><td>單位</td><td>${report.current.units.toLocaleString()}</td><td>→</td><td style="color:#00d4aa">${report.proposed.units.toLocaleString()}</td><td style="color:#ff8800">(${report.deltaUnits >= 0 ? '+' : ''}${report.deltaUnits.toLocaleString()})</td></tr>
    </table>
    <div style="font-size:11px;color:#667788;margin-top:6px">* 模擬數據，非官方規劃</div>
  `
  infoPanel.classList.remove('hidden')
}
