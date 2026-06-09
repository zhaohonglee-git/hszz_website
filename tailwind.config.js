/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:  '#0D1117',   // 钛金黑 — 主背景 / 深色区域
          dark:   '#161B22',   // 深灰   — 卡片 / 次级背景
          blue:   '#0066FF',   // 科技蓝 — 主色调 / 链接 / 高亮
          orange: '#F97316',   // 工业橙 — CTA 按钮 / 强调
          gray:   '#F3F4F6',   // 浅灰   — 辅助背景 / 留白区域
          muted:  '#9CA3AF',   // 中灰   — 弱化文字 / 边框
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'touch': '3rem',       // 48px — 触控友好最小高度
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
