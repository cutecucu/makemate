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

// ★보조 함수: 입력값에서 ID만 쏙 뽑아내는 함수
function extractGameId(input) {
    if (!input) return "";
    // 만약 'id=' 이 포함된 긴 주소라면?
    if (input.includes("id=")) {
        const match = input.match(/id=([a-zA-Z0-9-]+)/);
        return match ? match[1] : input; // 찾으면 ID반환, 못찾으면 입력값 그대로
    }
    // 그냥 ID만 넣었다면?
    return input.trim();
}

// 7. 새 학생 추가
addStudentBtn.onclick = () => {
    const name = newStudentNameInput.value.trim();
    if (name === "") {
        alert("학생 이름을 입력하세요!");
        return;
    }

    // 처음 생성할 때 현재 시간을 timestamp로 찍습니다.
    db.collection("students").add({
        name: name,
        gameTitle: "",
        gameStory: "",
        gameId: "",    // gameLink 대신 gameId만 저장
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // ★ 중요: 생성 시간 기록
    })
    .then(() => {
        console.log("학생 추가 성공!");
        newStudentNameInput.value = "";
    })
    .catch((error) => {
        console.error("실패:", error);
        alert("추가 실패.");
    });
};

// 8. 목록 불러오기 (관리자 화면은 이름순 정렬이 편합니다)
function loadStudents() {
    db.collection("students").orderBy("name").onSnapshot((snapshot) => {
        studentListDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const student = doc.data();
            const docId = doc.id;
            
            // 기존 데이터(gameLink)가 있다면 ID만 추출해서 보여주기 (호환성)
            let currentId = student.gameId || "";
            if (!currentId && student.gameLink) {
                currentId = extractGameId(student.gameLink);
            }

            const card = document.createElement('div');
            card.className = 'student-card';
            
            card.innerHTML = `
                <h3>${student.name}</h3>
                
                <div class="input-group">
                    <label>게임 제목</label>
                    <input type="text" id="title-${docId}" value="${student.gameTitle || ''}">
                </div>
                
                <div class="input-group">
                    <label>게임 스토리</label>
                    <textarea id="story-${docId}" rows="4">${student.gameStory || ''}</textarea>
                </div>

                <div class="input-group">
                    <label>게임 ID (예: S1234... 또는 링크 붙여넣기)</label>
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
                
                // ★ 스마트 처리: 링크를 넣어도 ID만 추출
                const cleanId = extractGameId(rawIdInput);

                const studentCard = e.target.closest('.student-card');
                const studentName = studentCard.querySelector('h3').textContent;

                db.collection("students").doc(id).update({
                    gameTitle: newTitle,
                    gameStory: newStory,
                    gameId: cleanId, // ID만 저장
                    // ★ 저장할 때마다 시간을 업데이트해서 맨 위로 올리기 (원치 않으면 이 줄 삭제)
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() 
                })
                .then(() => alert(`'${studentName}' 저장 완료!`))
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
