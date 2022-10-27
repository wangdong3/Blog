::NODE_OPTIONS=--openssl-legacy-provider
::export NODE_OPTIONS=--openssl-legacy-provider
::yarn application -list  打印任务信息
::yarn application -status application_1436784252938_0022 查看任务状态
::yarn applicaton -kill  applicationId  kill 任务


::npm run build
export NODE_OPTIONS=--openssl-legacy-provider
yarn build

cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:wangdong3/blog.git master:gh-pages
