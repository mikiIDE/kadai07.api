//※GoogleはjQueryではなく生JSを使う！

let randomLocation; //ストリートビューの位置を保存する変数
let map, streetViewPanorama; //地図とストリートビューの制御
let marker; //地図上のピン

function getRandomLatLng() {
    const minLat = 20;  // 南端の緯度（沖縄より少し南）
    const maxLat = 46;   // 北端の緯度（北海道の最北端より少し北）
    const minLng = 128;  // 西端の経度（九州の西端より少し西）
    const maxLng = 146;  // 東端の経度（北海道の東端より少し東）
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;
    return { lat, lng }; //ここでreturnを使って保管しておく
}

//以下はChatGPTに計算方法を教えてもらいましたごめんなさい！
//曰く「ハーバーサイン公式を使用して、地球上の2点間の距離を計算」
//「緯度経度を度からラジアンに変換（Math.PI / 180）して計算」とのことです！
//完全理解(^^)
function calculateDistance(loc1, loc2) {
    const R = 6371; //地球の半径
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180); //こいつがラジアン（多分）
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

//ストリートビューが真っ暗になってしまうのを回避
async function findValidStreetViewLocation() {
    const streetViewService = new google.maps.StreetViewService();
    let location;
    let found = false;
    
    while (!found) {
        location = getRandomLatLng();
        try {
            const result = await new Promise((resolve, reject) => {
                streetViewService.getPanorama({
                    location: location,
                    radius: 50000, //半径50㎞以内で有効なストリートビューを探す
                    source: google.maps.StreetViewSource.OUTDOOR //屋外のストリートビューのみに限定
                }, (data, status) => {
                    if (status === google.maps.StreetViewStatus.OK) {
                        resolve(data);
                    } else {
                        reject(status);
                    }
                });
            });
            // 有効なストリートビューの位置が見つかった場合
            location = result.location.latLng;
            found = true;
        } catch (error) {
            console.log('ストリートビューが見つかりませんでした。再試行します...');
        }
    }
    return location; //returnで外に出す！
}

async function initMap() {
    // 左側のマップの設定
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 35.6895, lng: 139.7514 }, //初期値は東京
        zoom: 6 //もう少し下げてもいいかも？5とか
    });

    // クリックした位置にピンを立てる
    map.addListener("click", function(event) {
        if (!marker) {
            marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                animation: google.maps.Animation.DROP // マーカーが落ちてくるアニメーション
            });
        } else {
            marker.setPosition(event.latLng);  //すでにピンを立ててる場合は位置を更新する
        }
        map.setCenter(event.latLng);
    });

    try {
        // 有効なストリートビューの位置を探す
        const validLocation = await findValidStreetViewLocation();
        randomLocation = { 
            lat: validLocation.lat(), 
            lng: validLocation.lng() 
        };

        // 右側のストリートビューの設定
        streetViewPanorama = new google.maps.StreetViewPanorama(
            document.getElementById("streetView"), {
                position: validLocation,
                pov: { heading: 165, pitch: 0 }, //カメラの向き（南向き、水平）
                zoom: 1,
                addressControl: false, //住所非表示
                showRoadLabels: false //道路名非表示
            }
        );

        // ストリートビューのコントロールを地図に連動させない
        map.setStreetView(null);
    } catch (error) {
        console.error('ストリートビューの初期化に失敗しました:', error);
        alert('ストリートビューの読み込みに失敗しました。ページを更新してください。');
    }

    // 推測ボタンのクリックイベント
    document.getElementById("guessBtn").addEventListener("click", function() {
        if (!marker) {
            alert('地図上でクリックして推測位置を指定してください！');
            return;
        }
        const guessedLocation = marker.getPosition();
        checkGuess(guessedLocation, randomLocation);
    });
}

//     document.getElementById("guessBtn").addEventListener("click", function () {
//         const guessedLocation = map.getCenter();
//         checkGuess(guessedLocation, randomLocation);
//     });
// }

function checkGuess(guessedLocation, randomLocation) {
    const distance = calculateDistance(
        { lat: guessedLocation.lat(), lng: guessedLocation.lng() },
        randomLocation
    );
    alert(`あなたの推測は正解地点から約 ${Math.round(distance)} km 離れています！`);
}

window.onload = initMap;




// function initMap() {//GoogleMapの指定→initMap
//     randomLocation = getRandomLatLng();

//     // 左側のマップの設定
//     map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 35.6895, lng: 139.7514 }, // 初期位置は東京
//         zoom: 6
//     });

//     // 右側のストリートビューの設定
//     streetViewPanorama = new google.maps.StreetViewPanorama(
//         document.getElementById("streetView"), {
//             position: randomLocation,
//             pov: { heading: 165, pitch: 0 },
//             zoom: 1
//         }
//     );

//     document.getElementById("guessBtn").addEventListener("click", function () {
//         const guessedLocation = map.getCenter(); // 現在のマップの中心位置（ユーザーの推測地点）
//         checkGuess(guessedLocation, randomLocation);
//     });
// }

// function checkGuess(guessedLocation, randomLocation) {
//     const distance = calculateDistance(
//         { lat: guessedLocation.lat(), lng: guessedLocation.lng() },
//         randomLocation
//     );
//     alert(`あなたの推測は正解地点から約 ${Math.round(distance)} km 離れています！`);
// }

// window.onload = initMap;


//   // 日本の緯度経度の範囲
//   const minLat = 20;
//   const maxLat = 46;
//   const minLng = 128;
//   const maxLng = 146;

//   // ランダムな緯度経度
// function getRandomLatLng() {
//     const lat = Math.random() * (maxLat - minLat) + minLat;
//     const lng = Math.random() * (maxLng - minLng) + minLng;
//     return { lat, lng };
//   }

// function initMap() {//GoogleMapの指定→initMap
//     const mapOptions = {
//         center: { lat: 35.6895, lng: 139.7514 }, // 東京
//         zoom: 8
//   };

    
//     // 地図を作成
//     const map = new google.maps.Map(document.getElementById("map"),mapOptions);

//     // ズームとかが出来るように設定
//     map.setOptions({
//         mapTypeControl: true,
//         zoomControl: true,
//         scaleControl: true,
//         streetViewControl: true,
//         fullscreenControl: true
//     });
// }

// window.onload = initMap;