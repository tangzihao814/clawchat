# ClawChat MVP

一个最小可用的网页聊天项目，分为 **管理员** 和 **普通用户** 两种角色。

## 功能

### 普通用户
- 用户名/密码登录
- 登录后直接进入绑定的聊天会话
- 查看当前绑定的 session
- 退出登录

### 管理员
- 管理员登录
- 查看所有账号
- 创建普通用户账号
- 启用 / 禁用用户
- 重置用户密码
- 以管理员身份进入聊天页

## 技术栈
- Node.js
- Express
- Cookie Session（内存态）
- JSON 文件存储用户
- 纯 HTML / CSS / JS 前端

## 目录

- `server.js`：后端服务
- `public/index.html`：前端页面
- `users.json`：用户数据

## 启动

```bash
cd clawchat
npm install
npm start
```

默认监听：
- `HOST=0.0.0.0`
- `PORT=2000`

可自定义：

```bash
HOST=0.0.0.0 PORT=2000 npm start
```

## 登录说明

初始管理员账号写在 `users.json` 里。

当前默认：
- 用户名：`admin`
- 密码：请按你现有配置使用，或直接替换 `users.json` 中的 hash

## 接口

### 认证
- `GET /api/health`
- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### 管理员
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id/enabled`
- `PATCH /api/admin/users/:id/password`

### 聊天跳转
- `GET /api/chat/bootstrap`

## 后续建议

如果你准备把它做成正式项目，下一步建议按这个顺序升级：

1. 换成 PostgreSQL
2. 会话改成 Redis / DB 持久化
3. 接入真正的消息存储
4. 增加注册、邀请码、套餐额度
5. 增加管理员审计日志
6. 用 Next.js 或 Vue 重写前端
