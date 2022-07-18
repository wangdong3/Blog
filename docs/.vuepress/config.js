module.exports = {
	title:'文档管理',
	description:'文档管理',
	base: '/blog/',
	host: 'localhost',
    port: 8086,
	themeConfig:{
		logo: '/img/logo.png',
		nav:[	
		  //{text: 'Home', link: '/'},
		  {text: 'Share', link: '/share/'},
		  {text: 'CSDN', link: 'http://blog.csdn.net'},
		  {text: 'Github', link: 'https://github.com/wangdong3'}
		],
		sidebar: {
		  '/share': [
		    /**{
			  title:'vuepress相关',
			  collapsable:true,
			  children:[
				'/share/vuepress搭建静态网站'
			  ]
		    },**/
			{
			  title:'Java',
			  collapsable: true,
			  children:[
				'/share/java/多线程',
				'/share/java/Java8',
				'/share/java/单元测试',
				'/share/java/jvm',
				'/share/java/JMM',
				'/share/java/设计模式',
			   
			  ]
			},
			{
			  title:'数据结构',
			  collapsable: true,
			  children:[
				'/share/数据结构/排序算法'
			  ]
			},
			{
			  title:'数据库',
			  collapsable: true,
			  children:[
				'/share/数据库/数据库设计',
				'/share/数据库/索引',
				'/share/数据库/执行计划',
			  ]
			},
			{
			  title:'中间件',
			  collapsable: true,
			  children:[
				'/share/中间件/es',
				'/share/中间件/kafka',
				'/share/中间件/Nginx',
				'/share/中间件/zookeeper',
				'/share/中间件/Redis',
				'/share/中间件/RocketMQ'
			  ]
			},
			{
			  title:'知识点',
			  collapsable: true,
			  children:[
				'/share/知识点',
			  ]
			},
			{
			  title:'分布式',
			  collapsable: true,
			  children:[
				'/share/分布式',
			  ]
			},
			{
			  title:'Spring',
			  collapsable: true,
			  children:[
				'/share/spring',
				'/share/springboot',
			  ]
			},
			{
			  title:'其他',
			  collapsable: true,
			  children:[
				'/share/maven',
				'/share/restful',
				'/share/openAPI接口',
			  ]
			}
		  ]
		},
		// 这是嵌套标题链接，自动显示当前激活（导航）页面标题的链接，即显示深度（h1-h6的深度）
        sidebarDepth: 0,
		lastUpdated: 'Last Updated', 
		serviceWorker: true
	},
	markdown: {
		lineNumbers: true,
		anchor: { permalink: false },
		toc: { includeLevel: [2, 3] }
	},
}