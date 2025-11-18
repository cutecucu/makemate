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

// 데이터 가져오기
db.collection("students").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    
    gamePostList.innerHTML = ''; 
    
    snapshot.forEach((doc) => {
        const student = doc.data();
        const iframeSrc = getFullUrl(student);
        const status = student.status || "working"; // 기본값 '작업중'

        const post = document.createElement('div');
        post.className = "game-post"; 
        
        // ★ 상태 뱃지 만들기 (제목 옆에 표시될 작은 태그)
        let statusBadge = "";
        if (status === "working") {
            statusBadge = `<span class="badge badge-wip">🚧 작업중</span>`;
        } else {
            statusBadge = `<span class="badge badge-done">✅ 완료</span>`;
        }

        // ★ 화면 내용 결정
        let displayHtml = '';

        if (status === "working") {
            // 1) 작업중일 때: 게임 대신 안내 문구 표시
            displayHtml = `
                <div class="wip-container">
                    <div class="wip-message">
                        <h3>🔨 게임 제작 중...</h3>
                        <p>멋진 게임을 만들기 위해 노력하고 있어요!</p>
                    </div>
                </div>
            `;
        } else {
            // 2) 완료되었을 때: iFrame 게임 표시
            if (iframeSrc) {
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
                displayHtml = `<div class="wip-container"><p>게임 링크가 없습니다.</p></div>`;
            }
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
