SHADRIZZ_PATH="$HOME/code/shadrizz/index.ts"

shadrizz() {
    tsx "$SHADRIZZ_PATH" "$@"
}

rm -rf ~/code/shadrizz-demo
cd ~/code
shadrizz new shadrizz-demo -p pnpm --latest
cd ~/code/shadrizz-demo
shadrizz init -p pnpm --latest \
    --db-dialect sqlite \
    -pk cuid2 \
    --auth-solution authjs \
    --auth-providers credentials \
    --admin \
    --pluralize
pnpm add @faker-js/faker
cp ~/code/shadrizz-env/.env.local.sqlite .env.local
cp ~/code/shadrizz/templates/test-sqlite-demo/scripts/load-fake-data.ts.hbs scripts/load-fake-data.ts
shadrizz add tiptap
shadrizz scaffold -a admin category -c name:text
shadrizz scaffold -a admin post -c category_id:references_select title:text published_at:timestamp content:text_tiptap
shadrizz scaffold -a private todo -c title:text completed:boolean
shadrizz scaffold -a private note -c title:text content:text_tiptap
# shadrizz add stripe
npm run generate
npm run migrate
npx tsx scripts/create-user.ts test@example.com pw
npx tsx scripts/grant-admin.ts test@example.com
# npx tsx scripts/create-price.ts
npx tsx scripts/load-fake-data.ts
npm run build
npm run start