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

// -------------------------------------------------------

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 요소 가져오기
const loginBox = document.getElementById('login-box');
const selectBox = document.getElementById('select-box');
const editBox = document.getElementById('edit-box');
const projectListDiv = document.getElementById('project-list');

const nameInput = document.getElementById('student-name-input');
const pwInput = document.getElementById('student-pw-input');
const loginBtn = document.getElementById('student-login-btn');
const loginMsg = document.getElementById('login-msg');

let myDocId = null; 

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
if (loginBtn) {
    loginBtn.onclick = function() {
        const name = nameInput.value.trim();
        const pw = pwInput.value.trim();

        if (!name || !pw) {
            if(loginMsg) loginMsg.textContent = "이름과 비밀번호를 모두 입력하세요.";
            return;
        }

        if(loginMsg) loginMsg.textContent = "확인 중...";

        db.collection("students").where("name", "==", name).get().then((querySnapshot) => {
            if (querySnapshot.empty) {
                if(loginMsg) loginMsg.textContent = "그런 이름의 학생이 없어요.";
                return;
            }

            const matchedProjects = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const storedPw = data.password || "1234";
                
                if (String(storedPw) === String(pw)) {
                    matchedProjects.push({ id: doc.id, data: data });
                }
            });

            if (matchedProjects.length === 0) {
                if(loginMsg) loginMsg.textContent = "비밀번호가 틀렸습니다.";
            } else {
                // 무조건 선택 화면으로 이동
                showProjectSelector(matchedProjects);
            }

        }).catch((error) => {
            console.error(error);
            if(loginMsg) loginMsg.textContent = "오류가 발생했습니다.";
        });
    };
}

// 2. 프로젝트 선택 화면 보여주기
function showProjectSelector(projects) {
    loginBox.style.display = 'none';
    selectBox.style.display = 'block';
    editBox.style.display = 'none';

    projectListDiv.innerHTML = ''; 

    projects.forEach((p) => {
        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.gap = "10px";
        row.style.marginBottom = "10px";

        // 왼쪽: 수정 버튼
        const editBtn = document.createElement('button');
        const title = p.data.gameTitle || "(제목 없는 프로젝트)";
        const status = p.data.status === "completed" ? "✅ 완료" : "🚧 작업중";
        
        editBtn.innerHTML = `<strong>${title}</strong> <span style="font-size:0.8em; color:#666;">- ${status}</span>`;
        editBtn.style.flexGrow = "1"; 
        editBtn.style.padding = "15px";
        editBtn.style.border = "1px solid #ccc";
        editBtn.style.borderRadius = "8px";
        editBtn.style.backgroundColor = "white";
        editBtn.style.cursor = "pointer";
        editBtn.style.textAlign = "left";
        editBtn.style.fontSize = "1.1em";

        editBtn.onclick = () => {
            myDocId = p.id;
            showEditor(p.data);
        };

        // 오른쪽: 접속 버튼 (작게)
        const playLink = document.createElement('a');
        let currentId = p.data.gameId || "";
        if (!currentId && p.data.gameLink) currentId = extractGameId(p.data.gameLink);

        if (currentId) {
            // ★ 수정된 부분: 요청하신 대로 주소 변경!
            playLink.href = `https://arcade.makecode.com/${currentId}`;
            
            playLink.target = "_blank";
            playLink.innerHTML = "▶ 접속";
            playLink.style.display = "flex";
            playLink.style.alignItems = "center";
            playLink.style.justifyContent = "center";
            playLink.style.textDecoration = "none";
            playLink.style.backgroundColor = "#0056b3";
            playLink.style.color = "white";
            playLink.style.padding = "0 15px";
            playLink.style.borderRadius = "8px";
            playLink.style.fontWeight = "bold";
            playLink.style.minWidth = "80px"; 
        } else {
            playLink.style.display = "none";
        }

        row.appendChild(editBtn);
        row.appendChild(playLink);
        projectListDiv.appendChild(row);
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
const saveBtn = document.getElementById('save-my-game-btn');
if (saveBtn) {
    saveBtn.onclick = function() {
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
}

// 5. 뒤로가기 / 나가기 버튼
const backBtn = document.getElementById('back-btn');
if (backBtn) {
    backBtn.onclick = function() { location.reload(); };
}
