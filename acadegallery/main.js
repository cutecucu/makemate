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

// 2. 초기화
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const gamePostList = document.getElementById('game-post-list');

// ★ 보조 함수: 예전 데이터(전체링크)와 새 데이터(ID) 호환 처리
function getFullUrl(student) {
    // 1. 새 방식: gameId가 있으면 주소를 조립
    if (student.gameId && student.gameId.trim() !== "") {
        return `https://arcade.makecode.com/---run?id=${student.gameId.trim()}`;
    }
    // 2. 예전 방식: gameId는 없고 gameLink(전체주소)만 있다면 그거 사용
    if (student.gameLink) {
        return student.gameLink;
    }
    return null;
}

// 3. 데이터 가져오기
// ★ 수정됨: 'name' 대신 'timestamp' 기준, 'desc'(내림차순=최신순) 정렬
db.collection("students").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    
    gamePostList.innerHTML = ''; 
    
    snapshot.forEach((doc) => {
        const student = doc.data();
        const iframeSrc = getFullUrl(student);

        const post = document.createElement('div');
        post.className = "game-post"; 
        
        let iframeHtml = '';
        if (iframeSrc) {
            iframeHtml = `
                <div class="iframe-container">
                    <iframe 
                        src="${iframeSrc}" 
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
                <p class="story">${student.gameStory || "내용 없음"}</p>
            </div>
        `;
        
        gamePostList.appendChild(post);
    });
});
