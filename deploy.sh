# $ git init
# $ git add .
# $ git commit -m "first-commit"
# $ git branch -M main
# $ git remote add origin http://github.com/username/repo-name.git
# $ git push -u origin main

# module.exports = {
#   base: "/rapid-wraith/",
#   build: {
#     outDir: "../dist",
#   },
# };


git add dist -f
git commit -m 'updating-dist'
git subtree push --prefix dist origin gh-pages
sleep 5