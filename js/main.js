
// applicationIDを必ず削除して提出すること！！！！
const url1 = 'https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=*******************&categoryId=26-262-1084';
const url2 = 'https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=*******************&categoryId=20-199-2185';
//デプロイ前に絶対確認！！！！！削除する！！！！！！！！！！！！！！！！
//20-262-1084は「前日に作り置き」カテゴリ
//20-199-2185は「作り置きの野菜」カテゴリ

$("#saved").on("click", function () {
    console.log("お気に入りボタン押下は確認");
    $(".title").hide();
    $(".search").hide();
    $(".tired").hide();
    $("#recipe_list").hide();
    $("#saved_recipes_container").show();
    loadFromFirebase();
});

$("#back").on("click", function () {
    $("#saved_recipes_container").hide();
    $(".title").show();
    $(".search").show();
    $("#recipe_list").show();
});

//Firebase関連
function saveToFirebase(recipeData) {
    console.log('保存前のデータ:', recipeData); // デバッグ用

    // idがundefinedの場合の対策
    const recipeId = recipeData.id || `recipe-${Date.now()}`;
    const newRecipeRef = ref(db, `recipes/${recipeId}`);
    
    set(newRecipeRef, recipeData);
}

function loadFromFirebase() {
    console.log("読み込み中");
    const recipesRef = ref(db, "recipes");
    onValue(recipesRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Firebaseのデータ:", data);
        if (data) {
            // undefinedキーを除外して処理
            const validRecipes = Object.values(data).filter(recipe => recipe.id !== 'undefined');
            displaySavedRecipes(validRecipes);
        } else {
            console.log("Firebaseにデータがない");
        }
    });
}

function createRecipeHTML(recipe, isSaved = false) {
    console.log('受け取ったレシピデータ:', recipe); // デバッグ用

    const recipeId = recipe.id|| `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; //recipeIDがうまく取得できない場合のため

    // 各フィールドの値を確認
    console.log('データの中身:', {
        url: recipe.recipeUrl || recipe.url,
        image: recipe.foodImageUrl || recipe.imageUrl,
        title: recipe.recipeTitle || recipe.title,
        description: recipe.recipeDescription || recipe.description,
        note: recipe.note
    });

    // FirebaseとAPIの両方のデータ構造に対応させるため、（||）たくさん
    const html = `
        <li data-recipe-id="${recipeId}">
            <a href="${recipe.recipeUrl || recipe.url || '#'}" target="_blank">
                <img src="${recipe.imageUrl || recipe.foodImageUrl}" alt="料理画像">
                <h2>${recipe.title || recipe.recipeTitle || ''}</h2>
            </a>
            <p>${recipe.description || recipe.recipeDescription || ''}</p>
            <div class="favourite-btn ${isSaved ? 'saved' : ''}">${isSaved ? '★' : '☆'}</div>
            <textarea placeholder="一言メモ" class="note-textarea">${recipe.note || ''}</textarea>
        </li>
    `;
    
    // 生成されるHTMLも確認
    console.log('生成されるHTML:', html);
    
    return html;
}

$("#search_btn").on("click", function () {
    $(".tired").hide();
    $("#recipe_list").empty();
    $.ajax({ //送信情報
        url: url1,
        type: "get", //get=urlにデータを付けて送る。メソッドのこと。postというものもある。通常はそれぞれのAPIリファレンスに記載あり。
        cache: false, //cacheを見に行くわけじゃないのでfalse
        dataType: "json"  //この形で送ってね！
    }).done(function (data1) {  //dataはdata.resultの中にある
        console.log('API反応有無:', data1);
        const recipes1 = data1.result;
        // 書き出し
        let html1 = "";
        recipes1.forEach(recipe => {
            html1 += createRecipeHTML(recipe);
        });
        $("#recipe_list").append(html1);

        setTimeout(function () { //連続で見に行くとエラーになるため1秒後に読み込みする
            $.ajax({
                url: url2,
                type: "get",
                cache: false,
                dataType: "json"
            }).done(function (data2) {
                const recipes2 = data2.result;
                // 書き出し
                let html2 = "";
                recipes2.forEach(recipe => {
                    html2 += createRecipeHTML(recipe);
                });
                $("#recipe_list").append(html2);
            });
        }, 1000);
    });
});

$(document).on("click", ".favourite-btn", function () {
    const $li = $(this).closest("li");
    const recipeId = $li.data("recipe-id");
    const recipeTitle = $li.find("h2").text();
    const recipeUrl = $li.find("a").attr("href");
    const imageUrl = $li.find("img").attr("src");
    const description = $li.find("p").text();
    const note = $li.find(".note-textarea").val();

    const recipeData = {
        id: recipeId,
        title: recipeTitle,
        url: recipeUrl,
        imageUrl: imageUrl,
        description: description,
        note: note,
        timestamp: Date.now()
    };

    saveToFirebase(recipeData);
    $(this).text("★").addClass("saved");
    alert(`${recipeTitle}をお気に入りに追加しました！`);
});

$(document).on("blur", ".note-textarea", function () {
    const $li = $(this).closest("li");
    const recipeId = $li.data("recipe-id");
    const note = $(this).val();

    const recipeRef = ref(db, `recipes/${recipeId}`);
    update(recipeRef, { note: note });
    alert("メモ追加！");
});

function displaySavedRecipes(recipes) {
    const $savedList = $("#saved_recipes");
    $savedList.empty();

    Object.values(recipes).forEach(recipe => {
        const html = createRecipeHTML(recipe, true);
        $savedList.append(html);
    });
}

loadFromFirebase();