import express from 'express'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 2000
const HOST = process.env.HOST || '0.0.0.0'
const USERS_PATH = path.join(__dirname, 'users.json')
const ADMIN_SESSION = 'admin'
const OPENCLAW_BASE = process.env.OPENCLAW_BASE || 'https://pl.tangzh.top'
const appSessions = new Map()

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'))
}

function writeUsers(data) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2))
}

function sanitizeUser(user) {
  return {
    id: user.id,
    role: user.role,
    username: user.username,
    displayName: user.displayName,
    session: user.session,
    enabled: user.enabled,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  }
}

function getAuth(req) {
  const token = req.cookies.clawchat_session
  if (!token) return null
  const data = appSessions.get(token)
  if (!data) return null
  return data
}

function requireAuth(req, res, next) {
  const auth = getAuth(req)
  if (!auth) return res.status(401).json({ ok: false, error: '未登录' })
  req.auth = auth
  next()
}

function requireAdmin(req, res, next) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'admin') return res.status(403).json({ ok: false, error: '无权限' })
  req.auth = auth
  next()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'clawchat' })
})

app.get('/api/auth/me', (req, res) => {
  const auth = getAuth(req)
  if (!auth) return res.json({ ok: true, user: null })
  res.json({ ok: true, user: auth })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {}
  const db = readUsers()
  const user = db.users.find(u => u.username === username)
  if (!user || !user.enabled) return res.status(400).json({ ok: false, error: '账号不存在或已禁用' })
  const passOk = await bcrypt.compare(String(password || ''), user.passwordHash)
  if (!passOk) return res.status(400).json({ ok: false, error: '密码错误' })

  user.lastLoginAt = new Date().toISOString()
  writeUsers(db)

  const authUser = sanitizeUser(user)
  const token = crypto.randomBytes(24).toString('hex')
  appSessions.set(token, authUser)
  res.cookie('clawchat_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 3600 * 1000,
  })
  res.json({ ok: true, user: authUser })
})

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.clawchat_session
  if (token) appSessions.delete(token)
  res.clearCookie('clawchat_session')
  res.json({ ok: true })
})

app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const db = readUsers()
  res.json({ ok: true, users: db.users.map(sanitizeUser) })
})

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  const { username, displayName, password, session } = req.body || {}
  const u = String(username || '').trim()
  const d = String(displayName || u).trim()
  const p = String(password || '').trim()
  const s = String(session || `friend-${u}`).trim()

  if (!u || !p) return res.status(400).json({ ok: false, error: '用户名和密码必填' })

  const db = readUsers()
  if (db.users.some(x => x.username === u)) return res.status(400).json({ ok: false, error: '用户名已存在' })

  const passwordHash = await bcrypt.hash(p, 10)
  const user = {
    id: `user_${u}`,
    role: 'user',
    username: u,
    displayName: d,
    passwordHash,
    session: s,
    enabled: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  }
  db.users.push(user)
  writeUsers(db)
  res.json({ ok: true, user: sanitizeUser(user) })
})

app.patch('/api/admin/users/:id/password', requireAdmin, async (req, res) => {
  const { password } = req.body || {}
  const p = String(password || '').trim()
  if (!p) return res.status(400).json({ ok: false, error: '新密码不能为空' })
  const db = readUsers()
  const user = db.users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ ok: false, error: '用户不存在' })
  user.passwordHash = await bcrypt.hash(p, 10)
  writeUsers(db)
  res.json({ ok: true })
})

app.patch('/api/admin/users/:id/enabled', requireAdmin, (req, res) => {
  const db = readUsers()
  const user = db.users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ ok: false, error: '用户不存在' })
  user.enabled = !!req.body?.enabled
  writeUsers(db)
  res.json({ ok: true, user: sanitizeUser(user) })
})

app.get('/api/chat/bootstrap', requireAuth, (req, res) => {
  const auth = req.auth
  const targetSession = auth.role === 'admin' ? ADMIN_SESSION : auth.session
  res.json({
    ok: true,
    user: auth,
    session: targetSession,
    openclawBase: OPENCLAW_BASE,
    targetUrl: auth.role === 'admin'
      ? `${OPENCLAW_BASE}/#/chat`
      : `${OPENCLAW_BASE}/#/chat?session=${encodeURIComponent(targetSession)}`,
  })
})

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, HOST, () => {
  console.log(`clawchat listening on http://${HOST}:${PORT}`)
})
