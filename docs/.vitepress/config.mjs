import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ipc-express',
  description: 'Express-like IPC communication for Electron',
  lang: 'zh-CN',
  lastUpdated: true,

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/client' },
      { text: '示例', link: '/examples/basic' },
      { text: '分析', link: '/analysis' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '架构', link: '/guide/architecture' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: 'IpcClient', link: '/api/client' },
            { text: 'IpcServer', link: '/api/server' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: '高级用法', link: '/examples/advanced' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/mizuka-wu/ipc-express' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present mizuka.wu',
    },
  },
});
