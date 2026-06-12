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

// 首次初始化：迁移现有 6 条案例
if (!db.prepare('SELECT COUNT(*) as cnt FROM cases').get().cnt) {
  const seed = [
    ['某汽车零部件厂 KUKA 焊接线体年度维保','汽车制造','/images/cases/case01.jpg','为某大型汽车零部件供应商的 12 台 KUKA 焊接机器人提供全年预防性维护，建立数字化维保档案，故障率降低 67%，线体 OEE 提升至 92%。'],
    ['食品包装线 ABB 高速分拣机器人调试','食品饮料','/images/cases/case02.jpg','完成 6 台 ABB IRB 460 高速分拣机器人的编程调试与节拍优化，单线产能提升 35%，实现全自动码垛与缠绕包装联动。'],
    ['3C 电子厂 FANUC 搬运工作站系统集成','3C电子','/images/cases/case03.jpg','为手机玻璃盖板产线设计 FANUC M-10iA 搬运工作站，集成视觉定位与 PLC 联动，替代 8 名人工上下料，投资回收期仅 11 个月。'],
    ['工程机械喷涂机器人深度翻新再制造','工程机械','/images/cases/case04.jpg','对 4 台退役安川 Motoman 喷涂机器人进行深度翻新，更换减速机与管线包，恢复出厂精度并通过 72 小时老化测试，附带 1 年质保。'],
    ['新能源电池模组搬运与检测系统','新能源','/images/cases/case05.jpg','为锂电池模组产线设计 Epson 四轴机器人搬运系统，集成 MES 数据追溯与安全光幕，实现无人化转运，日均处理 12000 枚电芯。'],
    ['精密铸造厂备品备件年度框架供应','金属加工','/images/cases/case06.jpg','为某精密铸造企业建立关键备件安全库存体系，覆盖减速机、伺服电机、IO 模块等 200+ SKU，紧急交付周期由 7 天缩短至 48 小时。'],
  ]
  const st = db.prepare('INSERT INTO cases (title,industry,image,description) VALUES (?,?,?,?)')
  for (const s of seed) st.run(...s)
  console.log('[DB] 初始化 6 条案例')
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
