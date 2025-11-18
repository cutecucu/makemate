// 1. Firebase 설정 붙여넣기
// ----------------------------------------------------
// (!!중요!!)
// 'main.js'에 붙여넣었던 것과 '동일한'
// 'firebaseConfig' 코드를 여기에 붙여넣으세요!
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
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 요소 가져오기
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const newStudentNameInput = document.getElementById('new-student-name');
const addStudentBtn = document.getElementById('add-student-btn');
const studentListDiv = document.getElementById('student-list');

// 로그인/로그아웃
loginBtn.onclick = () => auth.signInWithPopup(googleProvider);
logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged((user) => {
    if (user) {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        userName.textContent = user.displayName;
        loadStudents(); 
    } else {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
        userName.textContent = '';
    }
});

// ID 추출 함수
function extractGameId(input) {
    if (!input) return "";
    if (input.includes("id=")) {
        const match = input.match(/id=([a-zA-Z0-9-]+)/);
        return match ? match[1] : input;
    }
    return input.trim();
}

// 7. 새 프로젝트(학생) 추가 - ★비밀번호 자동 생성 (예: 1234)
addStudentBtn.onclick = function() {
    const name = newStudentNameInput.value.trim();
    if (name === "") {
        alert("학생 이름을 입력하세요!");
        return;
    }

    db.collection("students").add({
        name: name,
        password: "1234", // ★ 기본 비밀번호 '1234'로 생성
        gameTitle: "",
        gameStory: "",
        gameId: "",
        status: "working", 
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("추가 성공!");
        newStudentNameInput.value = "";
    })
    .catch((error) => {
        console.error("추가 실패:", error);
        alert("추가 실패.");
    });
};

// 8. 목록 불러오기
function loadStudents() {
    db.collection("students").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        studentListDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const student = doc.data();
            const docId = doc.id;
            
            let currentId = student.gameId || "";
            if (!currentId && student.gameLink) currentId = extractGameId(student.gameLink);
            const currentStatus = student.status || "working";
            const currentPw = student.password || "1234"; // 비밀번호 없으면 1234

            const card = document.createElement('div');
            card.className = 'student-card';
            
            // ★ 비밀번호 입력 칸 추가됨
            card.innerHTML = `
                <div class="card-header">
                    <h3>${student.name}</h3>
                    <select id="status-${docId}" class="status-select">
                        <option value="working" ${currentStatus === 'working' ? 'selected' : ''}>🚧 작업중</option>
                        <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>✅ 완료됨</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label>🔑 접속 비밀번호 (학생용)</label>
                    <input type="text" id="pw-${docId}" value="${currentPw}" style="background-color:#fff3cd;">
                </div>

                <div class="input-group">
                    <label>게임 제목</label>
                    <input type="text" id="title-${docId}" value="${student.gameTitle || ''}">
                </div>
                
                <div class="input-group">
                    <label>게임 스토리</label>
                    <textarea id="story-${docId}" rows="3">${student.gameStory || ''}</textarea>
                </div>

                <div class="input-group">
                    <label>게임 ID</label>
                    <input type="text" id="id-${docId}" value="${currentId}">
                </div>

                <div class="button-group">
                    <button class="btn-save" data-id="${docId}">저장</button>
                    <button class="btn-delete" data-id="${docId}">삭제</button>
                </div>
            `;
            studentListDiv.appendChild(card);
        });

        // 저장 버튼
        document.querySelectorAll('.btn-save').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                const newTitle = document.getElementById(`title-${id}`).value;
                const newStory = document.getElementById(`story-${id}`).value;
                const rawIdInput = document.getElementById(`id-${id}`).value;
                const newStatus = document.getElementById(`status-${id}`).value;
                const newPw = document.getElementById(`pw-${id}`).value; // ★ 비밀번호 읽기
                
                const cleanId = extractGameId(rawIdInput);
                
                db.collection("students").doc(id).update({
                    gameTitle: newTitle,
                    gameStory: newStory,
                    gameId: cleanId,
                    status: newStatus,
                    password: newPw, // ★ 비밀번호 저장
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => alert(`저장 완료!`))
                .catch((error) => alert("저장 실패: " + error.message));
            };
        });

        // 삭제 버튼 (생략 - 이전과 동일)
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                if (confirm("정말 삭제하시겠습니까?")) {
                    db.collection("students").doc(id).delete();
                }
            };
        });
    });
}
