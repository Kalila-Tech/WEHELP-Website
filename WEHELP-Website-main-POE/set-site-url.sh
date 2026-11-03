#!/bin/sh
# Replaces the placeholder site address with your real one, in every page, the README,
# sitemap.xml and robots.txt. Run it once, after you know where the site lives.
#
#   sh set-site-url.sh https://your-username.github.io/WEHELP-Website
#
# Use no trailing slash. For a Netlify site it looks like https://your-site.netlify.app
set -e
[ -n "$1" ] || { echo "Usage: sh set-site-url.sh https://your-username.github.io/WEHELP-Website"; exit 1; }
NEW=$(printf '%s' "$1" | sed 's:/*$::')
OLD="https://YOUR-USERNAME.github.io/WEHELP-Website"
FILES=$(grep -l "$OLD" *.html sitemap.xml robots.txt README.md 2>/dev/null || true)
[ -n "$FILES" ] || { echo "Nothing to replace: the placeholder address is not in any file."; exit 0; }
for f in $FILES; do sed "s|$OLD|$NEW|g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"; done
echo "Updated: $FILES"
