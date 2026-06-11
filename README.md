This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



1. 安装基础依赖
由于项目中存在 wagmi 和 rainbowkit 的版本对等冲突，必须使用强制兼容模式安装：

```Bash
npm install --legacy-peer-deps
```
2. 安装三方功能库 (图标与图表)
我们需要 lucide-react 提供精美的系统图标，以及 recharts 来绘制多维交易能力雷达图：

```Bash
npm install lucide-react recharts --legacy-peer-deps
```
3. 初始化并安装 Shadcn UI 组件
本项目使用了 shadcn 作为无头 UI 库。你需要一次性将所有用到的基础“积木”注入到 src/components/ui 目录中：

```Bash
npx shadcn@latest add accordion tabs card badge progress separator table avatar button --legacy
```
