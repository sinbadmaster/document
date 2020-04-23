module.exports = {
  base: '/document/',
  title: '学习笔记',
  description: '学习笔记记录位置',
  themeConfig: {
    repo: 'https://github.com/sinbadmaster/document',
    repoLabel: 'Github',
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记内容', link: '/note/' }
    ],
    sidebar: 'auto'
  }
}