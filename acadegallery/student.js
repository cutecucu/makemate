// 1. Firebase 설정 (선생님 키 복사 필수!)
const firebaseConfig = {
  apiKey: "AIzaSy...여기에-선생님-키-넣으세요",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 요소 가져오기
const loginBox = document.getElementById('login-box');
const editBox = document.getElementById('edit-box');
const nameInput = document.getElementById('student-name-input');
const pwInput = document.getElementById('student-pw-input');
const loginBtn = document.getElementById('student-login-btn');
const loginMsg = document.getElementById('login-msg');

let myDocId = null; // 로그인 성공 시 내 문서 ID 저장

// ID 추출 함수
function extractGameId(input) {
    if (!input) return "";
    if (input.includes("id=")) {
        const match = input.match(/id=([a-zA-Z0-9-]+)/);
        return match ? match[1] : input;
    }
    return input.trim();
}

// 1. 로그인 버튼 클릭
loginBtn.onclick = function() {
    const name = nameInput.value.trim();
    const pw = pwInput.value.trim();

    if (!name || !pw) {
        loginMsg.textContent = "이름과 비밀번호를 모두 입력하세요.";
        return;
    }

    loginMsg.textContent = "확인 중...";

    // DB에서 이름이 같은 학생 찾기
    db.collection("students").where("name", "==", name).get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            loginMsg.textContent = "그런 이름의 학생이 없어요. 선생님께 문의하세요.";
            return;
        }

        // 동명이인이 있을 수 있으므로 반복문으로 체크
        let found = false;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // 비밀번호 확인 (비밀번호가 없으면 1234로 간주)
            const storedPw = data.password || "1234";
            
            if (String(storedPw) === String(pw)) {
                // 로그인 성공!
                found = true;
                myDocId = doc.id; // 내 문서 ID 저장
                showEditor(data);
            }
        });

        if (!found) {
            loginMsg.textContent = "비밀번호가 틀렸습니다.";
        }
    }).catch((error) => {
        console.error(error);
        loginMsg.textContent = "오류가 발생했습니다.";
    });
};

// 2. 에디터 화면 보여주기
function showEditor(data) {
    loginBox.style.display = 'none';
    editBox.style.display = 'block';

    document.getElementById('welcome-msg').textContent = `안녕, ${data.name}! 👋`;
    document.getElementById('my-title').value = data.gameTitle || "";
    document.getElementById('my-story').value = data.gameStory || "";
    
    // ID 호환성 처리
    let currentId = data.gameId || "";
    if (!currentId && data.gameLink) currentId = extractGameId(data.gameLink);
    document.getElementById('my-id').value = currentId;
    
    document.getElementById('my-status').value = data.status || "working";
}

// 3. 저장하기 버튼
document.getElementById('save-my-game-btn').onclick = function() {
    if (!myDocId) return;

    const newTitle = document.getElementById('my-title').value;
    const newStory = document.getElementById('my-story').value;
    const rawId = document.getElementById('my-id').value;
    const newStatus = document.getElementById('my-status').value;

    const cleanId = extractGameId(rawId);

    db.collection("students").doc(myDocId).update({
        gameTitle: newTitle,
        gameStory: newStory,
        gameId: cleanId,
        status: newStatus,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // 수정 시 맨 위로 올라감
    }).then(() => {
        alert("저장되었습니다! 전시장에서 확인해보세요.");
    }).catch((error) => {
        alert("저장 실패: " + error.message);
    });
};

// 4. 나가기(새로고침)
document.getElementById('logout-btn').onclick = function() {
    location.reload();
};
