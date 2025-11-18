// 1. Firebase 설정 (선생님 키 복사 필수!)
const firebaseConfig = {
  apiKey: "AIzaSyDBgFkiyBCGcyPC-JZmn8r6wDFvQRqxJHw",
  authDomain: "acadeworld.firebaseapp.com",
  projectId: "acadeworld",
  storageBucket: "acadeworld.firebasestorage.app",
  messagingSenderId: "1049646858688",
  appId: "1:1049646858688:web:4156a74d9883c6a4a3c825",
  measurementId: "G-L3PFK28H6E"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 요소 가져오기
const loginBox = document.getElementById('login-box');
const selectBox = document.getElementById('select-box'); // 새로 추가됨
const editBox = document.getElementById('edit-box');
const projectListDiv = document.getElementById('project-list'); // 새로 추가됨

const nameInput = document.getElementById('student-name-input');
const pwInput = document.getElementById('student-pw-input');
const loginBtn = document.getElementById('student-login-btn');
const loginMsg = document.getElementById('login-msg');

let myDocId = null; // 현재 수정 중인 문서 ID

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

    // 이름으로 검색
    db.collection("students").where("name", "==", name).get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            loginMsg.textContent = "그런 이름의 학생이 없어요.";
            return;
        }

        // 비밀번호가 일치하는 프로젝트들을 모두 찾아서 배열에 담기
        const matchedProjects = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const storedPw = data.password || "1234";
            
            if (String(storedPw) === String(pw)) {
                matchedProjects.push({ id: doc.id, data: data });
            }
        });

        // 결과에 따른 화면 이동
        if (matchedProjects.length === 0) {
            loginMsg.textContent = "비밀번호가 틀렸습니다.";
        } else if (matchedProjects.length === 1) {
            // 1개면 바로 수정 화면으로
            myDocId = matchedProjects[0].id;
            showEditor(matchedProjects[0].data);
        } else {
            // 2개 이상이면 선택 화면으로
            showProjectSelector(matchedProjects);
        }

    }).catch((error) => {
        console.error(error);
        loginMsg.textContent = "오류가 발생했습니다.";
    });
};

// 2. (NEW) 프로젝트 선택 화면 보여주기
function showProjectSelector(projects) {
    loginBox.style.display = 'none';
    selectBox.style.display = 'block';
    editBox.style.display = 'none';

    projectListDiv.innerHTML = ''; // 목록 초기화

    projects.forEach((p) => {
        const btn = document.createElement('button');
        // 버튼 스타일링
        btn.style.padding = "15px";
        btn.style.border = "1px solid #ccc";
        btn.style.borderRadius = "8px";
        btn.style.backgroundColor = "white";
        btn.style.cursor = "pointer";
        btn.style.textAlign = "left";
        btn.style.fontSize = "1.1em";

        // 제목이 없으면 '제목 없는 프로젝트'라고 표시
        const title = p.data.gameTitle || "(제목 없는 프로젝트)";
        const status = p.data.status === "completed" ? "✅ 완료" : "🚧 작업중";
        
        btn.innerHTML = `<strong>${title}</strong> <span style="font-size:0.8em; color:#666;">- ${status}</span>`;

        // 버튼 클릭 시 에디터로 이동
        btn.onclick = () => {
            myDocId = p.id;
            showEditor(p.data);
        };

        projectListDiv.appendChild(btn);
    });
}

// 3. 에디터 화면 보여주기
function showEditor(data) {
    loginBox.style.display = 'none';
    selectBox.style.display = 'none';
    editBox.style.display = 'block';

    document.getElementById('welcome-msg').textContent = `안녕, ${data.name}! 👋`;
    document.getElementById('my-title').value = data.gameTitle || "";
    document.getElementById('my-story').value = data.gameStory || "";
    
    let currentId = data.gameId || "";
    if (!currentId && data.gameLink) currentId = extractGameId(data.gameLink);
    document.getElementById('my-id').value = currentId;
    
    document.getElementById('my-status').value = data.status || "working";
}

// 4. 저장하기 버튼
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
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("저장되었습니다!");
    }).catch((error) => {
        alert("저장 실패: " + error.message);
    });
};

// 5. 뒤로가기 / 나가기 버튼
document.getElementById('back-btn').onclick = function() {
    location.reload(); // 새로고침해서 로그인 화면으로 돌아감
};
