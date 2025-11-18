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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 3. 요소 가져오기
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const newStudentNameInput = document.getElementById('new-student-name');
const addStudentBtn = document.getElementById('add-student-btn');
const studentListDiv = document.getElementById('student-list');

// 4. 로그인/로그아웃
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

// 7. 새 프로젝트(학생) 추가
addStudentBtn.onclick = () => {
    const name = newStudentNameInput.value.trim();
    if (name === "") {
        alert("학생 이름을 입력하세요!");
        return;
    }

    // ★ 중요: 같은 이름이 있어도 상관없이 '새 문서'를 만듭니다. (숫자 안 붙여도 됨)
    db.collection("students").add({
        name: name,
        gameTitle: "",
        gameStory: "",
        gameId: "",
        status: "working", // ★ 기본값은 '작업중'
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("추가 성공!");
        newStudentNameInput.value = "";
    })
    .catch((error) => {
        console.error("실패:", error);
        alert("추가 실패.");
    });
};

// 8. 목록 불러오기
function loadStudents() {
    // 최신순(timestamp desc)으로 정렬하여 관리하기 편하게 함
    db.collection("students").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        studentListDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const student = doc.data();
            const docId = doc.id;
            
            // ID 호환성 처리
            let currentId = student.gameId || "";
            if (!currentId && student.gameLink) {
                currentId = extractGameId(student.gameLink);
            }

            // 상태값 (없으면 'working'으로 취급)
            const currentStatus = student.status || "working";

            const card = document.createElement('div');
            card.className = 'student-card';
            
            // ★ 수정: 상태 선택(Select) 박스 추가
            card.innerHTML = `
                <div class="card-header">
                    <h3>${student.name}</h3>
                    <select id="status-${docId}" class="status-select">
                        <option value="working" ${currentStatus === 'working' ? 'selected' : ''}>🚧 작업중</option>
                        <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>✅ 완료됨</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label>게임 제목</label>
                    <input type="text" id="title-${docId}" value="${student.gameTitle || ''}" placeholder="게임 제목 입력">
                </div>
                
                <div class="input-group">
                    <label>게임 스토리</label>
                    <textarea id="story-${docId}" rows="3">${student.gameStory || ''}</textarea>
                </div>

                <div class="input-group">
                    <label>게임 ID (S...)</label>
                    <input type="text" id="id-${docId}" value="${currentId}" placeholder="S00000-00000...">
                </div>

                <div class="button-group">
                    <button class="btn-save" data-id="${docId}">저장</button>
                    <button class="btn-delete" data-id="${docId}">삭제</button>
                </div>
            `;
            studentListDiv.appendChild(card);
        });

        // 9. 저장 버튼
        document.querySelectorAll('.btn-save').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                const newTitle = document.getElementById(`title-${id}`).value;
                const newStory = document.getElementById(`story-${id}`).value;
                const rawIdInput = document.getElementById(`id-${id}`).value;
                const newStatus = document.getElementById(`status-${id}`).value; // ★ 상태값 읽기
                
                const cleanId = extractGameId(rawIdInput);
                
                // 저장 시 시간 업데이트 (맨 위로 올라옴)
                db.collection("students").doc(id).update({
                    gameTitle: newTitle,
                    gameStory: newStory,
                    gameId: cleanId,
                    status: newStatus, // ★ 상태 저장
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => alert(`저장 완료!`))
                .catch((error) => alert("저장 실패: " + error.message));
            };
        });

        // 10. 삭제 버튼
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                if (confirm("정말 삭제하시겠습니까?")) {
                    db.collection("students").doc(id).delete()
                    .then(() => alert("삭제 완료!"))
                    .catch((error) => alert("삭제 실패"));
                }
            };
        });
    });
}
