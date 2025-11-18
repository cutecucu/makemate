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

// URL 생성 함수
function getFullUrl(student) {
    if (student.gameId && student.gameId.trim() !== "") {
        return `https://arcade.makecode.com/---run?id=${student.gameId.trim()}`;
    }
    if (student.gameLink) {
        return student.gameLink;
    }
    return null;
}

// 3. 데이터 가져오기
db.collection("students").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    
    gamePostList.innerHTML = ''; 
    
    snapshot.forEach((doc) => {
        const student = doc.data();
        const iframeSrc = getFullUrl(student);
        const status = student.status || "working"; // 기본값 '작업중'

        const post = document.createElement('div');
        post.className = "game-post"; 
        
        // 상태 뱃지 (작업중이어도 표시는 해줍니다)
        let statusBadge = "";
        if (status === "working") {
            statusBadge = `<span class="badge badge-wip">🚧 작업중</span>`;
        } else {
            statusBadge = `<span class="badge badge-done">✅ 완료</span>`;
        }

        // ★ 수정된 부분: 상태(working)와 상관없이 링크가 있으면 게임을 보여줍니다!
        let displayHtml = '';

        if (iframeSrc) {
            // 링크가 있으면 -> 게임 화면(iFrame) 출력
            displayHtml = `
                <div class="iframe-container">
                    <iframe 
                        src="${iframeSrc}" 
                        allowfullscreen="allowfullscreen" 
                        sandbox="allow-popups allow-forms allow-scripts allow-same-origin" 
                        frameborder="0">
                    </iframe>
                </div>
            `;
        } else {
            // 링크가 없을 때만 -> 안내 문구 출력
            displayHtml = `
                <div class="wip-container">
                    <div class="wip-message">
                        <h3>🔗 링크 없음</h3>
                        <p>아직 게임이 연결되지 않았습니다.</p>
                    </div>
                </div>
            `;
        }

        post.innerHTML = `
            ${displayHtml}
            <div class="post-content">
                <div class="post-header">
                    <h2>${student.gameTitle || "제목 없음"}</h2>
                    ${statusBadge}
                </div>
                <p class="author">제작: ${student.name}</p>
                <p class="story">${student.gameStory || "내용 없음"}</p>
            </div>
        `;
        
        gamePostList.appendChild(post);
    });
});
