

# 浪漫艺术风格字体排版优化

## 设计理念

当前页面已使用三种字体（Dancing Script、Playfair Display、Cormorant Garamond），但使用不够系统化。优化方案将建立清晰的字体层次体系，让每种字体承担明确的角色：

- **Dancing Script（草书）**：仅用于核心情感标题（名字、网站标题）
- **Playfair Display（衬线展示）**：用于日期数字、里程碑标题等需要庄重感的元素
- **Cormorant Garamond（优雅正文）**：用于所有描述性文字、标签、副标题

## 文字元素逐一调整清单

### Header（`Header.tsx`）
| 元素 | 当前 | 调整 |
|------|------|------|
| "Our Love Journey" | `font-script text-2xl sm:text-3xl` | 加 `italic tracking-wide`，增加字间距和斜体，更优雅 |

### HeroSection（`HeroSection.tsx`）
| 元素 | 当前 | 调整 |
|------|------|------|
| "Jamie & Alicia" | `font-script text-4xl...text-8xl` | 加 `italic`，保持现有大小 |
| DateBadge 日期文字 | `font-display` | 加 `tracking-widest` 和 `font-light`，数字加宽字距更精致 |
| DateBadge 标签（His/Her Birthday, Anniversary） | 无字体类 | 加 `font-body italic tracking-wide`，使用 Cormorant Garamond 斜体 |
| "We have been together for" | 无字体类 | 加 `font-body italic tracking-wide`，Cormorant Garamond 斜体 |
| 天数数字 | `font-display font-bold` | 加 `tracking-tight`，数字紧凑更有冲击力 |
| "days" | 无字体类 | 加 `font-body italic`，配合正文字体 |
| "Every day is the best day" | 无字体类 | 改用 `font-script text-xl sm:text-2xl text-gold/80`，用草书体突出浪漫感 |
| MilestoneBadge 标题 | `font-display` | 保持，加 `tracking-wide` |
| MilestoneBadge 副标题 | 无字体类 | 加 `font-body italic` |

### PhotoWall（`PhotoWall.tsx`）
| 元素 | 当前 | 调整 |
|------|------|------|
| "Our Photo Wall" | `font-display` | 加 `italic tracking-wide` |
| "Capturing every beautiful moment together" | 无字体类 | 加 `font-body italic tracking-wide` |
| "Upload Photos" | 无字体类 | 加 `font-body` |

### AuthDialog（`AuthDialog.tsx`）
| 元素 | 当前 | 调整 |
|------|------|------|
| "Sign In" / "Create Account" | `font-display` | 加 `italic` |
| 按钮 "Sign In" 文字 | 无字体类 | 加 `font-body` |
| 切换提示文字 | 无字体类 | 加 `font-body italic` |

### PhotoLightbox（`PhotoLightbox.tsx`）
| 元素 | 当前 | 调整 |
|------|------|------|
| 照片计数器 "01 / 36" | 无字体类 | 加 `font-display tracking-widest` |
| "Close" / "Delete" 按钮 | 无字体类 | 加 `font-body` |

## 技术细节

所有改动都是 className 的增加/修改，不涉及任何结构变更。主要添加的 Tailwind 类：

- `italic` — CSS font-style: italic
- `tracking-wide` — letter-spacing: 0.025em
- `tracking-widest` — letter-spacing: 0.1em
- `tracking-tight` — letter-spacing: -0.025em
- `font-light` — font-weight: 300
- `font-body` — Cormorant Garamond（已在 index.css 定义）
- `font-script` — Dancing Script（已在 index.css 定义）

| 文件 | 改动 |
|------|------|
| `src/components/Header.tsx` | Header 标题加 italic + tracking |
| `src/components/HeroSection.tsx` | 所有文字元素的字体层次优化 |
| `src/components/PhotoWall.tsx` | 标题和描述文字字体优化 |
| `src/components/AuthDialog.tsx` | 对话框文字字体优化 |
| `src/components/PhotoLightbox.tsx` | 计数器和按钮字体优化 |

