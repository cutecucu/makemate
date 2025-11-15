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

// 2. Firebase 앱 초기화 및 서비스 가져오기
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 3. HTML 요소(태그) 가져오기
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const newStudentNameInput = document.getElementById('new-student-name');
const addStudentBtn = document.getElementById('add-student-btn');
const studentListDiv = document.getElementById('student-list');

// 4. 로그인 기능
loginBtn.onclick = () => {
    auth.signInWithPopup(googleProvider); // Google 로그인 팝업 띄우기
};

// 5. 로그아웃 기능
logoutBtn.onclick = () => {
    auth.signOut(); // Firebase 로그아웃
};

// 6. 인증 상태 감지 (로그인/로그아웃 실시간 확인)
auth.onAuthStateChanged((user) => {
    if (user) {
        // --- 6-1. 로그인 된 상태 ---
        loginSection.style.display = 'none'; // 로그인 영역 숨기기
        adminPanel.style.display = 'block'; // 관리자 패널 보이기
        userName.textContent = user.displayName; // 사용자 이름 표시
        
        // 학생 목록 불러오기 함수 실행
        loadStudents(); 
    } else {
        // --- 6-2. 로그아웃 된 상태 ---
        loginSection.style.display = 'block'; // 로그인 영역 보이기
        adminPanel.style.display = 'none'; // 관리자 패널 숨기기
        userName.textContent = '';
    }
});

// 7. 새 학생 추가 기능
addStudentBtn.onclick = () => {
    const name = newStudentNameInput.value.trim(); // 입력값의 앞뒤 공백 제거
    if (name === "") {
        alert("학생 이름을 입력하세요!");
        return;
    }

    // Firestore 'students' 컬렉션에 데이터 추가
    db.collection("students").add({
        name: name,
        gameTitle: "", // 처음엔 비워둠
        gameLink: ""  // 처음엔 비워둠
    })
    .then(() => {
        console.log("학생 추가 성공!");
        newStudentNameInput.value = ""; // 입력창 비우기
    })
    .catch((error) => {
        console.error("학생 추가 실패: ", error);
        alert("학생 추가에 실패했습니다. (콘솔 로그 확인)");
    });
};

// 8. 학생 목록 불러오고 관리 카드 만드는 기능
function loadStudents() {
    db.collection("students").orderBy("name").onSnapshot((snapshot) => {
        studentListDiv.innerHTML = ''; // 목록 비우기
        snapshot.forEach((doc) => {
            const student = doc.data(); // {name: "...", gameTitle: "...", gameLink: "..."}
            const docId = doc.id; // Firestore 문서의 고유 ID (중요!)

            // 학생 1명당 카드 1개 생성
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <h3>${student.name}</h3>
                
                <div class="input-group">
                    <label>게임 제목</label>
                    <input type="text" id="title-${docId}" value="${student.gameTitle || ''}">
                </div>
                
                <div class="input-group">
                    <label>게임 링크 (MakeCode 공유 주소)</label>
                    <input type="text" id="link-${docId}" value="${student.gameLink || ''}">
                </div>

                <div class="button-group">
                    <button class="btn-save" data-id="${docId}">저장</button>
                    <button class="btn-delete" data-id="${docId}">삭제</button>
                </div>
            `;
            studentListDiv.appendChild(card);
        });

        // 9. '저장' 버튼 기능 연결
        document.querySelectorAll('.btn-save').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                const newTitle = document.getElementById(`title-${id}`).value;
                const newLink = document.getElementById(`link-${id}`).value;

                // Firestore 'students' 컬렉션에서 'id'에 해당하는 문서 업데이트
                db.collection("students").doc(id).update({
                    gameTitle: newTitle,
                    gameLink: newLink
                })
                .then(() => alert(`${studentListDiv.querySelector(`h3`).textContent} 학생 정보 저장 완료!`))
                .catch((error) => alert("저장 실패: " + error.message));
            };
        });

        // 10. '삭제' 버튼 기능 연결
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                const studentName = studentListDiv.querySelector(`#title-${id}`).parentNode.parentNode.querySelector(`h3`).textContent;

                if (confirm(`정말로 '${studentName}' 학생을 삭제하시겠습니까?`)) {
                    // Firestore 'students' 컬렉션에서 'id'에 해당하는 문서 삭제
                    db.collection("students").doc(id).delete()
                    .then(() => alert("삭제 완료!"))
                    .catch((error) => alert("삭제 실패: " + error.message));
                }
            };
        });
    });
}
