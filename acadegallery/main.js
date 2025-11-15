// 1. Firebase 설정 붙여넣기
// ----------------------------------------------------
// (!!중요!!)
// 아까 Firebase에서 복사한 'firebaseConfig' 코드를
// 이 아래에 그대로 붙여넣으세요!
// ----------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDBgFkiyBCGcyPC-JZmn8r6wDFvQRqxJHw",
  authDomain: "acadeworld.firebaseapp.com",
  projectId: "acadeworld",
  storageBucket: "acadeworld.firebasestorage.app",
  messagingSenderId: "1049646858688",
  appId: "1:1049646858688:web:4156a74d9883c6a4a3c825",
  measurementId: "G-L3PFK28H6E"
};

// 2. Firebase 앱 초기화하기
firebase.initializeApp(firebaseConfig);

// 3. Firestore 데이터베이스 서비스 사용하기
const db = firebase.firestore();

// 4. 필요한 HTML 요소(태그) 가져오기
const gameGallery = document.getElementById('game-gallery');

// 5. Firestore에서 게임 데이터 가져와서 화면에 그리기
// 'students' 컬렉션에 연결하고, 'name' 필드 기준으로 오름차순(가나다순) 정렬
db.collection("students").orderBy("name").onSnapshot((snapshot) => {
    
    console.log("데이터를 성공적으로 가져왔습니다!");
    gameGallery.innerHTML = ''; // 갤러리를 일단 비웁니다. (새로 그리려고)
    
    snapshot.forEach((doc) => {
        // doc.data()는 학생 1명의 정보 객체입니다.
        // 예: { name: "김철수", gameLink: "...", gameTitle: "탈출 게임" }
        const student = doc.data();

        // 썸네일 URL을 만듭니다.
        let thumbnailUrl = "https://i.imgur.com/PcaXf5R.png"; // 게임 링크가 없을 때 보여줄 기본 이미지
        
        // student.gameLink가 존재하고, "arcade.makecode.com"을 포함하는지 확인
        if (student.gameLink && student.gameLink.includes("arcade.makecode.com")) {
            
            // "https://arcade.makecode.com/_AbcDeFg" 에서
            // "_AbcDeFg" 부분(공유 ID)만 추출합니다.
            const shareId = student.gameLink.split('/').pop();
            
            // MakeCode 썸네일 주소 형식으로 만듭니다.
            thumbnailUrl = `https://arcade.makecode.com/${shareId}/thumb.png`;
        }

        // <a> 태그(클릭 가능한 링크 카드)를 만듭니다.
        const card = document.createElement('a');
        
        // 게임 링크가 있을 때만 링크를 연결하고, 없으면 클릭 안 되게 처리
        if (student.gameLink) {
             card.href = student.gameLink;
             card.target = "_blank"; // 새 탭에서 열기
        }
       
        card.className = "game-card"; // css 스타일 적용

        // 카드 안의 내용을 HTML로 채웁니다.
        card.innerHTML = `
            <img src="${thumbnailUrl}" alt="${student.gameTitle || '게임'}">
            <div class="card-content">
                <h3>${student.gameTitle || "아직 게임 없음"}</h3>
                <p>${student.name}</p>
            </div>
        `;
        
        // 완성된 카드를 갤러리에 추가합니다.
        gameGallery.appendChild(card);
    });
});
