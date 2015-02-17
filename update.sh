set -e
git merge master --no-commit
./node_modules/.bin/webpack
git add build/bundle.js
git commit -m"build"
git push origin gh-pages
