# 药理航线 · Pharmacology Atlas

一个基于课程资料整理的交互式药理学学习网站。包含 8 个学习板块、23 章、109 个知识点和 64 道真题/补充题。

## 功能

- 按教学进度组织章节与递进知识点
- 每个知识点均可查看原课件页、文件名和页码
- 重点标记、下划线与文字批注
- 板块练习、真题出处、补充题标识和错题复习
- 本地学习进度、每周目标与复习路线
- 桌面端和移动端自适应布局

## 技术

React 19、TypeScript、Vite、Tailwind CSS。学习记录仅保存在访问者当前浏览器的 localStorage 中，不需要账户或后端服务。

## 本地开发

```bash
npm ci
npm run dev
```

## 构建

```bash
npm run build
```

构建产物位于 `dist/`。Vite 使用相对资源路径，因此可部署在 GitHub Pages 的项目子路径下。课件图片以文本形式内嵌在 `public/embedded/`，避免二进制上传损坏以及大量零散图片请求。

## GitHub Pages

仓库通过 `.github/workflows/pages.yml` 自动构建和部署。Pages 的发布源需设置为 **GitHub Actions**。

## 内容边界

本仓库不包含原始课件目录、桌面文件、测试截图、本机绝对路径或访问者的学习记录。课程内容仅用于学习交流；公开传播前请确认你拥有相应资料的使用权限。
