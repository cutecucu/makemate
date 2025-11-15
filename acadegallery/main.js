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
const gamePostList = document.getElementById('game-post-list');

// 5. Firestore에서 게임 데이터 가져와서 화면에 그리기 (★수정됨★)
db.collection("students").orderBy("name").onSnapshot((snapshot) => {
    
    console.log("iFrame 버전 데이터를 성공적으로 가져왔습니다!");
    gamePostList.innerHTML = ''; // 목록을 비웁니다.
    
    snapshot.forEach((doc) => {
        // doc.data() 예: 
        // { name: "김철수", gameTitle: "탈출게임", gameStory: "...", gameLink: "..." }
        const student = doc.data();

        // <div> 태그로 '게시물'을 만듭니다.
        const post = document.createElement('div');
        post.className = "game-post"; // css 스타일 적용
        
        // ★수정★: 게시물 안의 내용을 HTML로 채웁니다.
        // gameLink가 비어있으면 iFrame 영역을 만들지 않습니다.
        let iframeHtml = '';
        if (student.gameLink) {
            iframeHtml = `
                <div class="iframe-container">
                    <iframe 
                        src="${student.gameLink}" 
                        allowfullscreen="allowfullscreen" 
                        sandbox="allow-popups allow-forms allow-scripts allow-same-origin" 
                        frameborder="0">
                    </iframe>
                </div>
            `;
        }

        post.innerHTML = `
            ${iframeHtml}
            <div class="post-content">
                <h2>${student.gameTitle || "제목 없음"}</h2>
                <p class="author">만든 사람: ${student.name}</p>
                <p class="story">${student.gameStory || "게임 스토리가 아직 없습니다."}</p>
            </div>
        `;
        
        // 완성된 게시물을 목록에 추가합니다.
        gamePostList.appendChild(post);
    });
});
