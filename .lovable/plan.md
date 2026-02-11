

# 修复登录弹窗居中问题

## 问题原因

`AuthDialog` 组件渲染在 `Header` 内部，而 `Header` 使用了 `fixed` 定位 + `backdrop-blur-sm`。这会创建一个新的 CSS 包含块（containing block），导致 `AuthDialog` 中的 `fixed inset-0` 的遮罩层不再相对于视口定位，而是相对于 Header 定位，所以弹窗出现在页面顶部而非居中。

## 解决方案

使用 React Portal 将弹窗渲染到 `document.body` 上，脱离 Header 的 CSS 上下文。

## 改动

**文件**: `src/components/AuthDialog.tsx`

- 引入 `ReactDOM.createPortal`
- 将 `isOpen` 时渲染的遮罩层 + 弹窗内容包裹在 `createPortal(..., document.body)` 中
- 其余代码（按钮、表单逻辑）不变

这样无论 AuthDialog 在组件树中嵌套多深，弹窗始终挂载到 body 层级，`fixed inset-0 flex items-center justify-center` 就能正确相对视口居中。

