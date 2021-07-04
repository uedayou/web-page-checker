# Web Page Checker

GitHub Action を利用して、登録した Webページ の簡易的な死活監視を行い、GitHub Pages にその状態を表示できるプログラムです。

## Webページ登録

監視したい Webページは `urllist.yaml` に登録します。
YAML形式で以下のように登録してください。
GETパラメータを指定したい場合は `params` に追加してください。

```yaml
- name: Web site
  url: https://uedayou.net/
- name: API server
  url: https://api-jrslod.uedayou.net/sparql
  params: 
    output: json
    query: "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> select * where{ ?s rdfs:label ?label. } limit 10"
```

## 実行

```bash
$ npm i
$ npm run start
```

`docs` ディレクトリに `urllist.yaml` に登録された Webサイトがアクセスできたかを `[name に指定した文字列]/check.svg` で確認できます(アクセス可:`〇`、不可:`×`)。

## GitHub Actions 設定

`.github/workflows/check.yml`
```yaml
name: check

on:
  push:
    branches:
      - 'master'
  #schedule:
  #  - cron: '0 0 * * *'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 1
      - uses: actions/setup-node@v1
        with:
          node-version: 14.x
      - name: check
        run: |
          npm install
          npm run start
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

`master`ブランチに push すると、上記のスクリプトが実行されます。
GitHub Pagesのデプロイも併せて実行されますが、シークレットキー等の設定が必要です。
詳しくは、以下を参照ください。

<https://qiita.com/uedayou/items/903f44a8dd251463ce59#サイト公開>

以下のコメントアウトを外すと、毎日スクリプトが実行されます。

```
  #schedule:
  #  - cron: '0 0 * * *'
```

## GitHub Pages で確認

GitHub Actions により、 `gh-pages`ブランチが作成されます。
GitHub Pages にアクセスすると、`urllist.yaml` に登録されたWebページの状況が以下のように一覧として表示されます。

<https://uedayou.github.io/web-page-checker/>
