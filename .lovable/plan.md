

# 部署音乐到 Play Music

## 概述

将上传的 MP3 文件（The Walters - I Love You So Instrumental）部署到音乐存储中，MusicButton 组件会自动加载并播放。现有代码已支持单曲循环和暂停功能。

## 步骤

1. **复制文件到项目目录**：将用户上传的 MP3 文件复制到 `public/` 目录作为中转
2. **上传到存储**：通过代码将 MP3 文件上传到 Lovable Cloud 的 music 存储桶中
3. **无需修改播放逻辑**：当前 `MusicButton.tsx` 已实现：
   - 单曲时自动循环播放（`audio.currentTime = 0; audio.play()`）
   - 播放/暂停切换按钮
   - 自动从存储桶加载曲目列表

## 技术细节

- 将 MP3 文件复制到 `public/music/` 目录
- 在页面加载时，通过一段初始化逻辑检查存储桶中是否已有该歌曲，若没有则自动上传
- 或者更简单的方式：直接在组件中添加一个默认曲目的 fallback，当存储桶为空时播放本地文件
- 推荐方案：将文件上传到 Supabase storage music 桶，组件无需任何改动即可自动加载播放

