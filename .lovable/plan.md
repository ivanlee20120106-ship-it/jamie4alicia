

## 方案概述

基于当前项目架构，利用 Lovable Cloud 数据库作为数据源，在前端实现带有智能缓存、过期清理、实时更新、筛选排序的数据管理仪表盘。

---

## 1. 数据库层

创建一条数据库迁移，新建 `cache_entries` 表用于演示数据存储：

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 主键 |
| key | text (UNIQUE) | 缓存键名 |
| value | jsonb | 存储的数据 |
| category | text | 分类（用于筛选） |
| ttl_seconds | integer | 过期时间（秒） |
| expires_at | timestamptz | 到期时间戳 |
| access_count | integer | 访问计数 |
| last_accessed_at | timestamptz | 最后访问时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

- 启用 Realtime 以支持实时推送
- 配置 RLS 策略：公开读取，认证用户可写
- 创建数据库函数自动清理过期条目

## 2. 前端缓存层（内存数据库优化）

新建 `src/hooks/useSmartCache.ts`：

- 在浏览器端实现一个 **带 TTL 的 LRU 内存缓存**（类似 Redis 的功能）
- 缓存策略：
  - 首次请求从数据库读取，存入内存缓存
  - 后续读取命中缓存则直接返回（避免重复请求）
  - 每个条目有独立的 TTL，到期自动清除
  - 内存上限控制（如 100 条），超出时淘汰最久未用的条目
- 提供 `get` / `set` / `invalidate` / `stats` 等方法
- 记录缓存命中率等统计信息

## 3. 实时更新模块

新建 `src/hooks/useCacheRealtime.ts`：

- 使用 Supabase Realtime 监听 `cache_entries` 表的 INSERT / UPDATE / DELETE 事件
- 收到变更后自动刷新本地缓存和 UI

## 4. 前端展示页面

新建 `src/pages/DataDashboard.tsx`：

- **统计卡片区**：显示总条目数、缓存命中率、内存使用量、过期条目数
- **数据表格**：展示所有缓存条目，包含 key、category、TTL、过期时间、访问次数等列
- **筛选功能**：按分类下拉筛选、按关键词搜索
- **排序功能**：点击表头按列排序（升/降序切换）
- **加载动画**：数据加载时显示 Skeleton 骨架屏
- **操作按钮**：新增条目、清理过期数据、手动刷新
- 界面风格与现有项目保持一致

## 5. 路由集成

在 `src/App.tsx` 中添加 `/dashboard` 路由指向 DataDashboard 页面。

---

## 技术要点

- **无需 Redis**：浏览器端 LRU 缓存 + 数据库持久化已满足需求，无需额外外部服务
- **实时同步**：通过 Realtime 订阅实现多端数据同步
- **自动清理**：数据库侧定时函数 + 前端侧 TTL 检查双重保障
- **响应式设计**：移动端适配

## 涉及文件

| 操作 | 文件 |
|------|------|
| 新建 | `src/hooks/useSmartCache.ts` |
| 新建 | `src/hooks/useCacheRealtime.ts` |
| 新建 | `src/pages/DataDashboard.tsx` |
| 新建 | `src/components/dashboard/CacheStatsCards.tsx` |
| 新建 | `src/components/dashboard/CacheDataTable.tsx` |
| 新建 | `src/components/dashboard/AddCacheEntryDialog.tsx` |
| 修改 | `src/App.tsx`（添加路由） |
| 数据库迁移 | 创建 `cache_entries` 表、RLS 策略、清理函数、启用 Realtime |

