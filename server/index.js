/**
 * 华晟智造 — 后端 API 服务器
 * 接收表单 / 管理后台 / 生产环境托管前端静态文件
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { insertSubmission, listSubmissions, getSubmission, updateSubmission, getStats, insertCase, updateCase, deleteCase, listCases } from './db.js'
import { authMiddleware, loginHandler } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (_req, file, cb) => {
    const ts = Date.now()
    const safe = file.originalname.replace(/[^a-zA-Z0-9._\-一-鿿]/g, '_')
    cb(null, `${ts}_${safe}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

// 案例图片存储到 public/images/cases/
const caseStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'images', 'cases'),
  filename: (_req, file, cb) => {
    const ts = Date.now()
    const safe = file.originalname.replace(/[^a-zA-Z0-9._\-一-鿿]/g, '_')
    cb(null, `case_${ts}_${safe}`)
  },
})
const caseUpload = multer({ storage: caseStorage, limits: { fileSize: 10 * 1024 * 1024 } })

// ---- 公共 API ----

app.post('/api/diagnostic', upload.any(), (req, res) => {
  try {
    const { brand, fault, name, phone, description } = req.body
    if (!name || !phone) return res.status(400).json({ error: '姓名和手机号为必填项' })
    const files = (req.files || []).map(f => ({
      name: f.originalname, path: f.filename, size: f.size, mimetype: f.mimetype,
    }))
    insertSubmission({ type: 'diagnostic', brand: brand || '', fault: fault || '',
      name, phone, description: description || '', files: JSON.stringify(files) })
    console.log(`[诊断] ${name} ${phone} ${brand || ''} ${files.length}个文件`)
    res.json({ success: true, message: '诊断请求已提交，工程师将尽快联系您' })
  } catch (err) {
    console.error('[诊断]', err)
    res.status(500).json({ error: '提交失败，请稍后重试' })
  }
})

app.post('/api/contact', upload.none(), (req, res) => {
  try {
    const { name, phone, company, message } = req.body
    if (!name || !phone) return res.status(400).json({ error: '姓名和手机号为必填项' })
    insertSubmission({ type: 'contact', brand: '', fault: '', description: '',
      name, phone, company: company || '', message: message || '', files: '[]' })
    console.log(`[联系] ${name} ${phone} ${company || ''}`)
    res.json({ success: true, message: '留言已提交，我们将尽快与您联系' })
  } catch (err) {
    console.error('[联系]', err)
    res.status(500).json({ error: '提交失败，请稍后重试' })
  }
})

// ---- 案例 API（公开）----
app.get('/api/cases', (req, res) => {
  const { industry, limit, offset } = req.query
  res.json(listCases({ industry, limit: parseInt(limit)||9, offset: parseInt(offset)||0 }))
})

// ---- 管理 API（需鉴权）----

// 案例管理
app.post('/api/admin/cases', authMiddleware, caseUpload.single('image'), (req, res) => {
  try {
    const { title, industry, description } = req.body
    if (!title || !industry) return res.status(400).json({ error: '标题和行业为必填' })
    const image = req.file ? '/images/cases/' + req.file.filename : (req.body.image || '')
    insertCase({ title, industry, image, description: description || '' })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.put('/api/admin/cases/:id', authMiddleware, caseUpload.single('image'), (req, res) => {
  try {
    const { title, industry, description } = req.body
    const data = { title, industry, description: description || '' }
    if (req.file) data.image = '/images/cases/' + req.file.filename
    else if (req.body.image) data.image = req.body.image
    updateCase(parseInt(req.params.id), data)
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/api/admin/cases/:id', authMiddleware, (req, res) => {
  deleteCase(parseInt(req.params.id))
  res.json({ success: true })
})

// 表单管理

app.post('/api/admin/login', loginHandler)
app.get('/api/admin/submissions', authMiddleware, (req, res) => {
  const { type, brand, fault, status, search, limit, offset } = req.query
  res.json(listSubmissions({ type, brand, fault, status, search,
    limit: parseInt(limit) || 50, offset: parseInt(offset) || 0 }))
})
app.get('/api/admin/submissions/:id', authMiddleware, (req, res) => {
  const row = getSubmission(parseInt(req.params.id))
  row ? res.json(row) : res.status(404).json({ error: '未找到' })
})
app.patch('/api/admin/submissions/:id', authMiddleware, (req, res) => {
  updateSubmission(parseInt(req.params.id), req.body)
  res.json({ success: true })
})
app.get('/api/admin/stats', authMiddleware, (_req, res) => res.json(getStats()))
app.use('/uploads', authMiddleware, express.static(path.join(__dirname, 'uploads')))

// ---- 管理后台 ----
app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'admin.html')))

// ---- 生产：托管前端静态文件 ----
const distPath = path.join(__dirname, '..', 'dist')
const pubPath = path.join(__dirname, '..', 'public')
app.use(express.static(pubPath))   // 上传的案例图片等运行时资源
app.use(express.static(distPath))  // 前端构建产物
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))

// ---- 启动 ----
app.listen(PORT, () => {
  const pw = process.env.ADMIN_PASSWORD
  console.log(`\n🚀 华晟智造后端已启动`)
  console.log(`   API:       http://0.0.0.0:${PORT}/api`)
  console.log(`   管理后台:  http://0.0.0.0:${PORT}/admin`)
  console.log(`   管理密码:  ${pw ? '已设置' : 'hszz2024admin（默认，请修改！'}\n`)
})
