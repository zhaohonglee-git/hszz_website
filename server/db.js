/**
 * SQLite 数据库 —— 表单提交数据存储
 */
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'data.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL,
    brand       TEXT,
    fault       TEXT,
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    company     TEXT,
    description TEXT,
    message     TEXT,
    files       TEXT    DEFAULT '[]',
    status      TEXT    DEFAULT 'new',
    notes       TEXT    DEFAULT '',
    created_at  TEXT    DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT    DEFAULT (datetime('now', 'localtime'))
  )
`)

const stmts = {
  insert: db.prepare(`
    INSERT INTO submissions (type, brand, fault, name, phone, company, description, message, files)
    VALUES (@type, @brand, @fault, @name, @phone, @company, @description, @message, @files)
  `),
  list: db.prepare(`
    SELECT * FROM submissions
    WHERE (@type   IS NULL OR type   = @type)
      AND (@brand  IS NULL OR brand  = @brand)
      AND (@fault  IS NULL OR fault  = @fault)
      AND (@status IS NULL OR status = @status)
      AND (@search IS NULL OR name LIKE @search OR phone LIKE @search
           OR company LIKE @search OR description LIKE @search)
    ORDER BY created_at DESC LIMIT @limit OFFSET @offset
  `),
  count: db.prepare(`
    SELECT COUNT(*) as total FROM submissions
    WHERE (@type   IS NULL OR type   = @type)
      AND (@brand  IS NULL OR brand  = @brand)
      AND (@fault  IS NULL OR fault  = @fault)
      AND (@status IS NULL OR status = @status)
      AND (@search IS NULL OR name LIKE @search OR phone LIKE @search
           OR company LIKE @search OR description LIKE @search)
  `),
  getById: db.prepare('SELECT * FROM submissions WHERE id = ?'),
  update: db.prepare(`
    UPDATE submissions SET status = @status, notes = @notes,
      updated_at = datetime('now', 'localtime') WHERE id = @id
  `),
  stats: db.prepare(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN type='diagnostic' THEN 1 ELSE 0 END) as diagnostic_count,
      SUM(CASE WHEN type='contact' THEN 1 ELSE 0 END) as contact_count,
      SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count,
      SUM(CASE WHEN date(created_at)=date('now','localtime') THEN 1 ELSE 0 END) as today_count
    FROM submissions
  `),
}

export function insertSubmission(data) {
  return stmts.insert.run({
    type: '', brand: '', fault: '', name: '', phone: '',
    company: '', description: '', message: '', files: '[]',
    ...data,
  })
}
export function getSubmission(id)     { return stmts.getById.get(id) }
export function updateSubmission(id, data) { return stmts.update.run({ id, ...data }) }

export function listSubmissions(f = {}) {
  const p = { type: f.type||null, brand: f.brand||null, fault: f.fault||null,
    status: f.status||null, search: f.search?`%${f.search}%`:null,
    limit: f.limit||50, offset: f.offset||0 }
  return { rows: stmts.list.all(p), total: stmts.count.get(p).total }
}

export function getStats() { return stmts.stats.get() }

// ---- 案例管理 ----
db.exec(`
  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, industry TEXT NOT NULL,
    image TEXT NOT NULL, description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )
`)

const cs = {
  insert: db.prepare(`INSERT INTO cases (title,industry,image,description) VALUES (@title,@industry,@image,@description)`),
  update: db.prepare(`UPDATE cases SET title=@title,industry=@industry,image=@image,description=@description WHERE id=@id`),
  remove: db.prepare('DELETE FROM cases WHERE id=?'),
  list: db.prepare(`SELECT * FROM cases WHERE (@industry IS NULL OR industry=@industry) ORDER BY sort_order DESC, created_at DESC LIMIT @limit OFFSET @offset`),
  count: db.prepare(`SELECT COUNT(*) as total FROM cases WHERE (@industry IS NULL OR industry=@industry)`),
  inds: db.prepare('SELECT DISTINCT industry FROM cases ORDER BY industry'),
  byId: db.prepare('SELECT * FROM cases WHERE id=?'),
}

// 首次初始化：从种子文件加载典型案例数据
if (!db.prepare('SELECT COUNT(*) as cnt FROM cases').get().cnt) {
  const seedPath = path.join(__dirname, 'cases-seed.json')
  if (fs.existsSync(seedPath)) {
    try {
      const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'))
      const st = db.prepare('INSERT INTO cases (title,industry,image,description) VALUES (@title,@industry,@image,@description)')
      const insertMany = db.transaction((cases) => {
        for (const c of cases) st.run(c)
      })
      insertMany(seed)
      console.log(`[DB] 从种子文件初始化 ${seed.length} 条案例`)
    } catch (err) {
      console.error('[DB] 种子数据加载失败:', err.message)
    }
  } else {
    console.warn('[DB] 种子文件不存在，跳过案例初始化')
  }
}

export function insertCase(d) { return cs.insert.run(d) }
export function updateCase(id, d) { return cs.update.run({...d, id}) }
export function deleteCase(id) { return cs.remove.run(id) }
export function listCases(f={}) {
  const p = {industry: f.industry||null, limit: f.limit||9, offset: f.offset||0}
  return { rows: cs.list.all(p), total: cs.count.get(p).total, industries: cs.inds.all().map(r=>r.industry) }
}
export function getCase(id) { return cs.byId.get(id) }

export default db
