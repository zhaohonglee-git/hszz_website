/**
 * SQLite 数据库 —— 表单提交数据存储
 */
import Database from 'better-sqlite3'
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

export function insertSubmission(data) { return stmts.insert.run(data) }
export function getSubmission(id)     { return stmts.getById.get(id) }
export function updateSubmission(id, data) { return stmts.update.run({ id, ...data }) }

export function listSubmissions(f = {}) {
  const p = { type: f.type||null, brand: f.brand||null, fault: f.fault||null,
    status: f.status||null, search: f.search?`%${f.search}%`:null,
    limit: f.limit||50, offset: f.offset||0 }
  return { rows: stmts.list.all(p), total: stmts.count.get(p).total }
}

export function getStats() { return stmts.stats.get() }
export default db
