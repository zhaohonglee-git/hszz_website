/**
 * 在线智能诊断表单 — 多步骤交互逻辑
 * ============================================================
 * 提交端点：修改下方 WEBHOOK_URL 为你自己的 API 地址
 */

// 生产环境自动指向同域 API，本地开发可改为完整 URL
const WEBHOOK_URL = '/api/diagnostic'

// ---------- 状态 ----------
let currentStep = 1
let selectedBrand = null
let selectedFault = null
let uploadedFiles = []

// ---------- DOM 引用 ----------
const $  = (sel) => document.querySelector(sel)
const $$ = (sel) => document.querySelectorAll(sel)

const stepPanels  = [null, $('#step-1'), $('#step-2'), $('#step-3')]
const stepDots    = [null, $('#dot-1'), $('#dot-2'), $('#dot-3')]
const stepLabels  = [null, $('#label-1'), $('#label-2'), $('#label-3')]
const progressBar = $('#progress-bar')

const nextBtn1     = $('#next-btn-1')
const nextBtn2     = $('#next-btn-2')
const prevBtn2     = $('#prev-btn-2')
const prevBtn3     = $('#prev-btn-3')
const submitBtn    = $('#submit-btn')
const submitText   = $('#submit-text')
const submitSpinner = $('#submit-spinner')

const brandBtns = $$('.brand-btn')
const faultBtns = $$('.fault-btn')

const dropZone    = $('#drop-zone')
const fileInput   = $('#file-input')
const fileList    = $('#file-list')
const uploadHint  = $('#upload-hint')

const nameInput   = $('#diagnostic-name')
const phoneInput  = $('#diagnostic-phone')
const descInput   = $('#diagnostic-desc')

const successModal = $('#success-modal')
const closeModal   = $('#close-modal')

// ---------- 步骤导航 ----------
function goToStep(step) {
  stepPanels.forEach(p => p?.classList.add('hidden'))

  const panel = stepPanels[step]
  if (panel) {
    panel.classList.remove('hidden')
    panel.classList.add('animate-slide-up', 'opacity-0')
    panel.addEventListener('animationend', function h() {
      panel.classList.remove('opacity-0')
      panel.removeEventListener('animationend', h)
    }, { once: true })
  }

  // 更新步骤圆点
  for (let i = 1; i <= 3; i++) {
    const dot = stepDots[i]
    const label = stepLabels[i]
    dot.className = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300'
    label.classList.remove('text-white', 'text-brand-muted')

    if (i < step) {
      dot.classList.add('bg-green-500', 'text-white')
      dot.innerHTML = '✓'
      label.classList.add('text-white')
    } else if (i === step) {
      dot.classList.add('bg-brand-blue', 'text-white')
      label.classList.add('text-white')
    } else {
      dot.classList.add('bg-brand-blue/20', 'text-brand-blue', 'border', 'border-brand-blue/30')
      dot.innerHTML = i
      label.classList.add('text-brand-muted')
    }
  }

  progressBar.style.width = `${((step - 1) / 2) * 100}%`
  currentStep = step
}

// ---------- 步骤 1：品牌选择 ----------
brandBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    brandBtns.forEach(b => {
      b.classList.remove('border-brand-blue', 'bg-brand-blue/10', 'ring-2', 'ring-brand-blue/50')
      b.classList.add('border-white/10')
    })
    btn.classList.add('border-brand-blue', 'bg-brand-blue/10', 'ring-2', 'ring-brand-blue/50')
    btn.classList.remove('border-white/10')
    selectedBrand = btn.dataset.brand
    nextBtn1.disabled = false
    nextBtn1.classList.remove('opacity-40', 'cursor-not-allowed')
    nextBtn1.classList.add('btn-primary')
  })
})

nextBtn1.addEventListener('click', () => {
  if (!selectedBrand) return
  goToStep(2)
})

// ---------- 步骤 2：故障类型 ----------
faultBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    faultBtns.forEach(b => {
      b.classList.remove('border-brand-blue', 'bg-brand-blue/10', 'ring-2', 'ring-brand-blue/50')
      b.classList.add('border-white/10')
    })
    btn.classList.add('border-brand-blue', 'bg-brand-blue/10', 'ring-2', 'ring-brand-blue/50')
    btn.classList.remove('border-white/10')
    selectedFault = btn.dataset.fault
    nextBtn2.disabled = false
    nextBtn2.classList.remove('opacity-40', 'cursor-not-allowed')
    nextBtn2.classList.add('btn-primary')
  })
})

nextBtn2.addEventListener('click', () => {
  if (!selectedFault) return
  goToStep(3)
})

prevBtn2.addEventListener('click', () => goToStep(1))
prevBtn3.addEventListener('click', () => goToStep(2))

// ---------- 步骤 3：文件上传 ----------
dropZone.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') return
  fileInput.click()
})

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files)
  fileInput.value = ''
})

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('border-brand-blue', 'bg-brand-blue/5')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-brand-blue', 'bg-brand-blue/5')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('border-brand-blue', 'bg-brand-blue/5')
  handleFiles(e.dataTransfer.files)
})

function handleFiles(files) {
  const MAX_IMAGE = 10 * 1024 * 1024
  const MAX_VIDEO = 50 * 1024 * 1024
  const errors = []

  for (const f of files) {
    const isImage = f.type.startsWith('image/')
    const isVideo = f.type.startsWith('video/')

    if (!isImage && !isVideo) {
      errors.push(`"${f.name}" 不是支持的图片或视频格式`)
      continue
    }

    if (isImage && f.size > MAX_IMAGE) {
      errors.push(`图片 "${f.name}" 超过 10MB（${(f.size / 1024 / 1024).toFixed(1)}MB）`)
      continue
    }

    if (isVideo && f.size > MAX_VIDEO) {
      errors.push(`视频 "${f.name}" 超过 50MB（${(f.size / 1024 / 1024).toFixed(1)}MB）`)
      continue
    }

    if (uploadedFiles.some(uf => uf.file.name === f.name && uf.file.size === f.size)) continue

    uploadedFiles.push({ file: f, type: isImage ? 'image' : 'video' })
  }

  if (errors.length) showToast(errors.join('<br>'), 'error')
  renderFileList()
}

function removeFile(index) {
  uploadedFiles.splice(index, 1)
  renderFileList()
}

function renderFileList() {
  if (uploadedFiles.length === 0) {
    fileList.innerHTML = ''
    fileList.classList.add('hidden')
    uploadHint.classList.remove('hidden')
    return
  }

  uploadHint.classList.add('hidden')
  fileList.classList.remove('hidden')

  fileList.innerHTML = uploadedFiles.map((uf, i) => {
    const iconSvg = uf.type === 'image'
      ? `<svg class="w-4 h-4 text-brand-blue shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`
      : `<svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`
    const sizeMB = (uf.file.size / 1024 / 1024).toFixed(1)

    return `
      <div class="flex items-center gap-3 py-2.5 px-3 bg-brand-dark/80 rounded-lg group">
        ${iconSvg}
        <div class="flex-1 min-w-0">
          <p class="text-sm text-white truncate">${uf.file.name}</p>
          <p class="text-xs text-brand-muted">${uf.type === 'image' ? '图片' : '视频'} · ${sizeMB} MB</p>
        </div>
        <button class="shrink-0 w-8 h-8 flex items-center justify-center rounded text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors" onclick="window.__removeFile(${i})" type="button" aria-label="删除">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>`
  }).join('')
}

window.__removeFile = removeFile

// ---------- 表单验证 ----------
function validateForm() {
  const name  = nameInput.value.trim()
  const phone = phoneInput.value.trim()
  let valid = true

  if (!name || name.length < 2) {
    markError(nameInput, '请填写您的称呼（至少 2 个字符）')
    valid = false
  } else {
    clearError(nameInput)
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    markError(phoneInput, '请填写正确的 11 位手机号码')
    valid = false
  } else {
    clearError(phoneInput)
  }

  return valid
}

;[nameInput, phoneInput].forEach(el => {
  el.addEventListener('input', () => clearError(el))
})

function markError(el, msg) {
  el.classList.add('border-red-500', 'focus:ring-red-500')
  el.classList.remove('border-white/10', 'focus:ring-brand-blue')
  let err = el.parentElement.querySelector('.field-error')
  if (!err) {
    err = document.createElement('p')
    err.className = 'field-error text-xs text-red-400 mt-1.5'
    el.parentElement.appendChild(err)
  }
  err.textContent = msg
}

function clearError(el) {
  el.classList.remove('border-red-500', 'focus:ring-red-500')
  el.classList.add('border-white/10', 'focus:ring-brand-blue')
  const err = el.parentElement.querySelector('.field-error')
  if (err) err.remove()
}

// ---------- Toast ----------
function showToast(msg, type = 'info') {
  const old = document.querySelector('.diagnostic-toast')
  if (old) old.remove()

  const bg = type === 'error' ? 'bg-red-500/90' : 'bg-brand-blue/90'
  const toast = document.createElement('div')
  toast.className = `diagnostic-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] ${bg} text-white text-sm px-5 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-slide-up max-w-sm text-center`
  toast.innerHTML = msg
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => toast.remove(), 300)
  }, 3500)
}

// ---------- 提交 ----------
submitBtn.addEventListener('click', async () => {
  if (!validateForm()) return
  if (!selectedBrand || !selectedFault) {
    showToast('请返回完成前两步的选择', 'error')
    return
  }

  submitBtn.disabled = true
  submitBtn.classList.add('opacity-70', 'cursor-not-allowed')
  submitText.textContent = '正在上传并提交，请勿关闭页面...'
  submitSpinner.classList.remove('hidden')

  const fd = new FormData()
  fd.append('brand', selectedBrand)
  fd.append('fault', selectedFault)
  fd.append('name', nameInput.value.trim())
  fd.append('phone', phoneInput.value.trim())
  fd.append('description', descInput.value.trim())
  uploadedFiles.forEach((uf, i) => fd.append(`file_${i}`, uf.file))

  try {
    const resp = await fetch(WEBHOOK_URL, { method: 'POST', body: fd })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    showSuccess()
  } catch (err) {
    if (WEBHOOK_URL === 'YOUR_API_ENDPOINT_HERE') {
      console.warn('[诊断] 占位 WEBHOOK_URL，模拟成功', err)
      showSuccess()
    } else {
      showToast('提交失败，请稍后重试或致电我们', 'error')
      console.error('[诊断] 提交失败:', err)
    }
  } finally {
    if (!successModal.classList.contains('flex')) resetSubmitBtn()
  }
})

function resetSubmitBtn() {
  submitBtn.disabled = false
  submitBtn.classList.remove('opacity-70', 'cursor-not-allowed')
  submitText.textContent = '提交诊断请求'
  submitSpinner.classList.add('hidden')
}

function showSuccess() {
  successModal.classList.remove('hidden')
  successModal.classList.add('flex')
  document.body.style.overflow = 'hidden'
}

function hideModal() {
  successModal.classList.add('hidden')
  successModal.classList.remove('flex')
  document.body.style.overflow = ''
  resetForm()
}

closeModal.addEventListener('click', hideModal)
successModal.addEventListener('click', (e) => {
  if (e.target === successModal) hideModal()
})

function resetForm() {
  currentStep = 1
  selectedBrand = null
  selectedFault = null
  uploadedFiles = []

  brandBtns.forEach(b => { b.classList.remove('border-brand-blue','bg-brand-blue/10','ring-2','ring-brand-blue/50'); b.classList.add('border-white/10') })
  faultBtns.forEach(b => { b.classList.remove('border-brand-blue','bg-brand-blue/10','ring-2','ring-brand-blue/50'); b.classList.add('border-white/10') })
  nextBtn1.disabled = true; nextBtn1.classList.add('opacity-40','cursor-not-allowed'); nextBtn1.classList.remove('btn-primary')
  nextBtn2.disabled = true; nextBtn2.classList.add('opacity-40','cursor-not-allowed'); nextBtn2.classList.remove('btn-primary')
  uploadedFiles = []; renderFileList()
  nameInput.value = ''; phoneInput.value = ''; descInput.value = ''
  clearError(nameInput); clearError(phoneInput)
  resetSubmitBtn()
  goToStep(1)
}

// ---------- 初始化 ----------
export function initDiagnostic() {
  goToStep(1)
  nextBtn1.disabled = true; nextBtn1.classList.add('opacity-40','cursor-not-allowed')
  nextBtn2.disabled = true; nextBtn2.classList.add('opacity-40','cursor-not-allowed')
  console.log('[诊断] 就绪 · WEBHOOK:', WEBHOOK_URL === 'YOUR_API_ENDPOINT_HERE' ? '占位模式（模拟成功）' : WEBHOOK_URL)
}
