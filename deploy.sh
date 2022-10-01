# $ git init
# $ git add .
# $ git commit -m "first-commit"
# $ git branch -M main
# $ git remote add origin http://github.com/username/repo-name.git
# $ git push -u origin main

# module.exports = {
#   base: "/calculator/",
#   build: {
#     outDir: "../dist",
#   },
# };

npm run build
git add dist -f
git commit -m 'updating-dist'
git subtree push --prefix dist origin gh-pages
sleep 5