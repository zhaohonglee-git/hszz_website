/**
 * 简易鉴权 —— 生产环境请通过环境变量 ADMIN_PASSWORD 设置强密码
 */
const PASSWORD = process.env.ADMIN_PASSWORD || 'hszz2024admin'

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: '未授权' })
  try {
    if (Buffer.from(h.slice(7), 'base64').toString() === PASSWORD) return next()
  } catch (_) {}
  res.status(401).json({ error: '密码错误' })
}

export function loginHandler(req, res) {
  if (req.body?.password === PASSWORD) {
    return res.json({ token: Buffer.from(PASSWORD).toString('base64') })
  }
  res.status(401).json({ error: '密码错误' })
}
