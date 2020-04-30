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
    sidebar: [
      // { 
      //   title: 'element应用',
      //   path: '/note/element.md'
      // },
      {
        title: '算法学习',
        path: '/leetCode/',
        children: [
          ['/leetCode/', '最长子串'],
          ['/leetCode/countAndSay.md', '外观数列']
        ]
      },
      {
        title: 'vueRouter',
        path: '/router/',
        children: [
          
        ]
      },
      {
        title: '小提示',
        path: '/note/tip.md'
      }
    ]
  }
}