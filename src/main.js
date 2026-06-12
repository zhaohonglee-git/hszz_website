/**
 * 北京华晟智造科技有限公司 — 官网主脚本
 */

import { createIcons, Wrench, Terminal, Puzzle, Package, RefreshCw, Store } from 'lucide'
import { images, img } from './data/images.js'
import { initDiagnostic } from './diagnostic.js'

// ================================================================
//  0. Lucide 图标初始化（HTML 中 <i data-lucide="..."> 自动替换）
// ================================================================
createIcons({
  icons: { Wrench, Terminal, Puzzle, Package, RefreshCw, Store },
})

// ================================================================
//  0.1 中心化图片加载（data-img 属性 → 真实 URL）
// ================================================================
function applyImages() {
  document.querySelectorAll('[data-img]').forEach(el => {
    const key = el.dataset.img
    const url = img(key)

    if (!url) {
      console.warn(`[图片] 未找到 key="${key}" 的图片配置`)
      return
    }

    if (el.tagName === 'IMG') {
      el.src = url
    } else {
      el.style.backgroundImage = `url('${url}')`
    }
  })
  console.log(`[图片] 已加载 ${document.querySelectorAll('[data-img]').length} 处图片`)
}

// ================================================================
//  1. 移动端汉堡菜单
// ================================================================
const menuBtn   = document.getElementById('menu-btn')
const mobileNav = document.getElementById('mobile-nav')
const menuIcon  = document.getElementById('menu-icon')
const closeIcon = document.getElementById('close-icon')

let menuOpen = false

function openMenu() {
  menuOpen = true
  mobileNav.classList.remove('hidden')
  menuIcon.classList.add('hidden')
  closeIcon.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closeMenu() {
  menuOpen = false
  mobileNav.classList.add('hidden')
  menuIcon.classList.remove('hidden')
  closeIcon.classList.add('hidden')
  document.body.style.overflow = ''
}

menuBtn.addEventListener('click', () => {
  menuOpen ? closeMenu() : openMenu()
})

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu)
})

// ================================================================
//  2. Header 滚动阴影
// ================================================================
const header = document.getElementById('header')

function updateHeaderShadow() {
  header.classList.toggle('shadow-lg', window.scrollY > 10)
  header.classList.toggle('shadow-black/20', window.scrollY > 10)
}

window.addEventListener('scroll', updateHeaderShadow, { passive: true })

// ================================================================
//  3. 滚动时高亮当前区域的导航链接
// ================================================================
const navLinks = document.querySelectorAll('#header .nav-link')
const sections = []

navLinks.forEach(link => {
  const id = link.getAttribute('href')?.replace('#', '')
  if (id) {
    const el = document.getElementById(id)
    if (el) sections.push({ id, el, link })
  }
})

function updateActiveLink() {
  const scrollY = window.scrollY + 120 // 偏移补偿 sticky header

  let current = sections[0]
  for (const s of sections) {
    if (s.el.offsetTop <= scrollY) {
      current = s
    }
  }

  navLinks.forEach(l => l.classList.remove('nav-link-active'))
  if (current) current.link.classList.add('nav-link-active')
}

window.addEventListener('scroll', updateActiveLink, { passive: true })

// ================================================================
//  4. 典型案例 — 动态加载 + 筛选 + 分页
// ================================================================
let casesState = { industry: '', offset: 0, total: 0, loading: false }

function caseCard(c, i) {
  const delay = `${(i % 9) * 80}ms`
  return `
    <article class="group relative bg-brand-dark rounded-2xl overflow-hidden
           border border-white/5 hover:border-brand-blue/30
           transition-all duration-500 opacity-0 animate-slide-up"
      style="animation-delay: ${delay}; animation-fill-mode: forwards;">
      <div class="relative aspect-[8/5] overflow-hidden">
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
             style="background-image: url('${c.image}');"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-brand-dark to-brand-black/60 -z-10"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-blue/90 text-white text-xs font-medium backdrop-blur-sm">${c.industry}</span>
      </div>
      <div class="p-5 sm:p-6">
        <h3 class="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-brand-blue transition-colors duration-200">${c.title}</h3>
        <p class="mt-3 text-sm text-brand-muted leading-relaxed line-clamp-3">${c.description}</p>
      </div>
    </article>`
}

async function loadCases(reset = false) {
  const grid = document.getElementById('cases-grid')
  const more = document.getElementById('cases-more')
  const count = document.getElementById('cases-count')
  const btn = document.getElementById('load-more-btn')
  if (!grid || casesState.loading) return

  if (reset) { casesState.offset = 0; grid.innerHTML = '' }
  casesState.loading = true
  if (btn) btn.textContent = '加载中...'

  try {
    const params = new URLSearchParams({ limit: '9', offset: String(casesState.offset) })
    if (casesState.industry) params.set('industry', casesState.industry)
    const data = await fetch(`/api/cases?${params}`).then(r => r.json())

    grid.insertAdjacentHTML('beforeend', data.rows.map((c, i) => caseCard(c, casesState.offset + i)).join(''))
    casesState.offset += data.rows.length
    casesState.total = data.total

    if (casesState.offset < data.total) {
      more.classList.remove('hidden')
      count.textContent = `已显示 ${casesState.offset} / 共 ${data.total} 个案例`
    } else {
      more.classList.add('hidden')
    }
  } catch (err) {
    console.error('[案例] 加载失败:', err)
  } finally {
    casesState.loading = false
    if (btn) btn.textContent = '加载更多案例'
  }
}

async function initCases() {
  // 加载行业列表
  try {
    const data = await fetch('/api/cases?limit=1').then(r => r.json())
    const filters = document.getElementById('cases-filters')
    if (filters && data.industries.length) {
      const btns = data.industries.map(ind =>
        `<button class="case-filter px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-white/10 text-brand-muted hover:bg-white/20 hover:text-white transition-all" data-industry="${ind}">${ind}</button>`
      ).join('')
      filters.insertAdjacentHTML('beforeend', btns)

      // 筛选点击
      filters.querySelectorAll('.case-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          filters.querySelectorAll('.case-filter').forEach(b => { b.classList.remove('active','bg-brand-blue','text-white'); b.classList.add('bg-white/10','text-brand-muted') })
          btn.classList.add('active','bg-brand-blue','text-white')
          btn.classList.remove('bg-white/10','text-brand-muted')
          casesState.industry = btn.dataset.industry
          loadCases(true)
        })
      })
    }
  } catch (_) {}

  // 加载更多
  document.getElementById('load-more-btn')?.addEventListener('click', () => loadCases(false))

  // 初始加载
  loadCases(true)
}

// DOM 就绪后渲染
function onReady() {
  applyImages()
  initCases()
  initDiagnostic()
  initContactForm()
  initHeroCarousel()
  initKnowledgeAccordion()
  updateFooterYear()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady)
} else {
  onReady()
}

// ================================================================
//  5. 联系表单 — 提交逻辑
// ================================================================
const CONTACT_WEBHOOK = '/api/contact'

function initContactForm() {
  const form       = document.getElementById('contact-form')
  const submitBtn  = document.getElementById('contact-submit-btn')
  const submitText = document.getElementById('contact-submit-text')
  const spinner    = document.getElementById('contact-submit-spinner')
  const nameInput  = document.getElementById('contact-name')
  const phoneInput = document.getElementById('contact-phone')

  if (!form) return

  // 实时清除错误
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('border-red-500', 'focus:ring-red-500')
      el.classList.add('border-white/10', 'focus:ring-brand-blue')
      const err = el.parentElement.querySelector('.contact-field-error')
      if (err) err.classList.add('hidden')
    })
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const name  = nameInput.value.trim()
    const phone = phoneInput.value.trim()
    let valid = true

    // 校验
    if (!name || name.length < 2) {
      showContactError(nameInput, '请填写您的称呼（至少 2 个字符）')
      valid = false
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showContactError(phoneInput, '请填写正确的 11 位手机号码')
      valid = false
    }
    if (!valid) return

    // Loading
    submitBtn.disabled = true
    submitBtn.classList.add('opacity-70', 'cursor-not-allowed')
    submitText.textContent = '正在提交...'
    spinner.classList.remove('hidden')

    const fd = new FormData(form)

    try {
      const resp = await fetch(CONTACT_WEBHOOK, { method: 'POST', body: fd })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      showContactSuccess()
    } catch (err) {
      if (CONTACT_WEBHOOK === 'YOUR_CONTACT_API_ENDPOINT_HERE') {
        console.warn('[联系表单] 占位 URL，模拟成功', err)
        showContactSuccess()
      } else {
        alert('提交失败，请稍后重试或直接拨打服务热线 400-000-0000')
        console.error('[联系表单] 提交失败:', err)
      }
    } finally {
      submitBtn.disabled = false
      submitBtn.classList.remove('opacity-70', 'cursor-not-allowed')
      submitText.textContent = '提交留言'
      spinner.classList.add('hidden')
    }
  })
}

function showContactError(el, msg) {
  el.classList.add('border-red-500', 'focus:ring-red-500')
  el.classList.remove('border-white/10', 'focus:ring-brand-blue')
  const err = el.parentElement.querySelector('.contact-field-error')
  if (err) { err.textContent = msg; err.classList.remove('hidden') }
}

function showContactSuccess() {
  const name = document.getElementById('contact-name')
  // 简易 toast
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-green-500/90 text-white text-sm px-5 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-slide-up text-center'
  toast.textContent = '留言已提交，我们将尽快与您联系！'
  document.body.appendChild(toast)
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300) }, 3000)
  document.getElementById('contact-form').reset()
}

// ================================================================
//  6. Footer 年份
// ================================================================
function updateFooterYear() {
  const el = document.getElementById('current-year')
  if (el) el.textContent = new Date().getFullYear()
}

// ================================================================
//  7. Hero 轮播图
// ================================================================
function initHeroCarousel() {
  const slides     = document.querySelectorAll('.hero-slide')
  const dots       = document.querySelectorAll('.hero-dot')
  const prevBtn    = document.getElementById('hero-prev')
  const nextBtn    = document.getElementById('hero-next')
  const slidesContainer = document.getElementById('hero-slides')

  if (!slides.length) return

  let current     = 0
  let total       = slides.length
  let interval    = null
  let isHovering  = false

  const DURATION = 6000 // 6 秒自动切换

  function goTo(index) {
    if (index === current) return
    slides[current].classList.remove('active')
    dots[current].classList.remove('active')
    dots[current].style.width = ''

    current = ((index % total) + total) % total

    slides[current].classList.add('active')
    dots[current].classList.add('active')
    dots[current].style.width = '1.75rem'
  }

  function goNext() { goTo(current + 1) }
  function goPrev() { goTo(current - 1) }

  // 按钮事件
  if (prevBtn) prevBtn.addEventListener('click', goPrev)
  if (nextBtn) nextBtn.addEventListener('click', goNext)

  // 圆点点击
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)))
  })

  // 自动播放
  function startAuto() {
    stopAuto()
    interval = setInterval(goNext, DURATION)
  }

  function stopAuto() {
    if (interval) { clearInterval(interval); interval = null }
  }

  // 鼠标悬停暂停
  if (slidesContainer) {
    slidesContainer.addEventListener('mouseenter', () => { isHovering = true; stopAuto() })
    slidesContainer.addEventListener('mouseleave', () => { isHovering = false; startAuto() })
  }

  // 触摸滑动支持
  let touchStartX = 0
  let touchStartY = 0

  if (slidesContainer) {
    slidesContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }, { passive: true })

    slidesContainer.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY

      // 水平滑动超过 50px 且大于垂直滑动
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext()
        else goPrev()
      }
    })
  }

  // 键盘导航
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goPrev()
    else if (e.key === 'ArrowRight') goNext()
  })

  // 启动
  startAuto()
}

// ================================================================
//  8. 行业知识库 Accordion
// ================================================================
function initKnowledgeAccordion() {
  document.querySelectorAll('.kb-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item  = btn.closest('.kb-item')
      const body  = item.querySelector('.kb-body')
      const arrow = btn.querySelector('.kb-arrow')
      const isOpen = !body.classList.contains('hidden')

      // 关闭所有
      document.querySelectorAll('.kb-body').forEach(b => b.classList.add('hidden'))
      document.querySelectorAll('.kb-arrow').forEach(a => a.style.transform = '')

      // 打开当前（如果之前未打开）
      if (!isOpen) {
        body.classList.remove('hidden')
        arrow.style.transform = 'rotate(180deg)'
      }
    })
  })
}

// ================================================================
//  9. 入场动画（Intersection Observer）
// ================================================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in', 'opacity-0')
      entry.target.addEventListener('animationend', () => {
        entry.target.classList.remove('opacity-0')
      }, { once: true })
      observer.unobserve(entry.target)
    }
  })
}, observerOptions)

setTimeout(() => {
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el)
  })
}, 500)
