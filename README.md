# ①課題名
つくおき！検索アプリ

## ②課題内容（どんな作品か）
- APIを使って何か、ということで楽天レシピのカテゴリランキングAPIを使ってみました。
- 特に「作り置き」に特化したページが欲しいという私の願望が反映されています。
- もともとの仕様で上位4つのレシピしか表示が出来ず使い勝手は悪いです。
- APIキーを削除しての提出のため、レシピも隠しリンクも正常には動きません。

## ③アプリのデプロイURL
https://einekleine.sakura.ne.jp/kadai07_api_deploy/

## ④アプリのログイン用IDまたはPassword（ある場合）
- ID: none
- PW: none

## ⑤工夫した点・こだわった点
- 復習もかねてFirebaseも連携してみた点
- 上位4つのレシピしか表示されない仕様のため、カテゴリを分けて2種類（8つのレシピ）が表示されるようにした点

## ⑥難しかった点・次回トライしたいこと（又は機能）
- そもそも何のAPIを使って何をするか決めることが難しく、またアイデアとして浮かぶものは難しすぎて実現できませんでした。
- firebase連携も、以前のチャットアプリそのままで流用は出来なかったので検索とAIに頼りまくりました。
- 次回は「APIを使う」を主目的にするのではなく「〇〇アプリを作る」→「このAPIを使ってみよう」の流れを経験したいです。

## ⑦フリー項目（感想、シェアしたいこと等なんでも）
- [感想]公式ドキュメント読みにくすぎませんか…？頑張って読む練習からします。
- [参考記事]
  - 1. [https://webservice.rakuten.co.jp/documentation]
  - 2. [https://console.cloud.google.com/apis/library?hl=ja]