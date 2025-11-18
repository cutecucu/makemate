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

좋은 생각입니다! 💡

학생이 프로젝트를 선택하는 화면에서, 수정을 하러 들어가기 전에 "내 게임이 잘 나오나?" 하고 바로 눌러볼 수 있는 버튼(링크)을 오른쪽에 만들어 드릴게요.

student.js 파일 하나만 수정하면 됩니다.

기존 student.js 파일의 내용을 모두 지우고, 아래 코드로 전체 덮어쓰기 해주세요.

⚙️ student.js (접속 버튼 추가 버전 / 전체 덮어쓰기)
변경된 점:

showProjectSelector 함수가 완전히 바뀌었습니다.

이제 프로젝트 목록이 한 줄에 [ 수정하기 버튼 (왼쪽) ] + [ ▶ 게임 접속 (오른쪽) ] 이렇게 두 개로 나뉘어 보입니다.

'게임 접속' 버튼을 누르면 https://arcade.makecode.com/---run?id=아이디 주소로 새 창이 열립니다.

JavaScript

// 1. Firebase 설정 (선생님 키 복사 필수!)
// (!!중요!!) 선생님의 firebaseConfig 코드를 아래에 정확히 붙여넣으세요.
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
const selectBox = document.getElementById('select-box');
const editBox = document.getElementById('edit-box');
const projectListDiv = document.getElementById('project-list');

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

// 2. (NEW) 프로젝트 선택 화면 보여주기 (★수정된 함수★)
function showProjectSelector(projects) {
    loginBox.style.display = 'none';
    selectBox.style.display = 'block';
    editBox.style.display = 'none';

    projectListDiv.innerHTML = ''; // 목록 초기화

    projects.forEach((p) => {
        // 1. 한 줄(Row)을 만드는 컨테이너 (Flexbox 사용)
        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.gap = "10px"; // 버튼 사이 간격
        row.style.marginBottom = "10px";

        // 2. 왼쪽: 수정하기 버튼 (크게)
        const editBtn = document.createElement('button');
        const title = p.data.gameTitle || "(제목 없는 프로젝트)";
        const status = p.data.status === "completed" ? "✅ 완료" : "🚧 작업중";
        
        editBtn.innerHTML = `<strong>${title}</strong> <span style="font-size:0.8em; color:#666;">- ${status}</span>`;
        
        // 스타일 꾸미기
        editBtn.style.flexGrow = "1"; // 남은 공간을 다 차지함
        editBtn.style.padding = "15px";
        editBtn.style.border = "1px solid #ccc";
        editBtn.style.borderRadius = "8px";
        editBtn.style.backgroundColor = "white";
        editBtn.style.cursor = "pointer";
        editBtn.style.textAlign = "left";
        editBtn.style.fontSize = "1.1em";

        // 수정 버튼 클릭 시
        editBtn.onclick = () => {
            myDocId = p.id;
            showEditor(p.data);
        };

        // 3. 오른쪽: 게임 접속 버튼 (작게)
        const playLink = document.createElement('a');
        
        // ID 추출
        let currentId = p.data.gameId || "";
        if (!currentId && p.data.gameLink) currentId = extractGameId(p.data.gameLink);

        // ID가 있을 때만 링크 연결
        if (currentId) {
            // ★ 요청하신 기능: ID 앞에 주소를 붙여서 링크 생성
            playLink.href = `https://arcade.makecode.com/---run?id=${currentId}`;
            playLink.target = "_blank"; // 새 탭에서 열기
            playLink.innerHTML = "▶ 접속";
            
            // 접속 버튼 스타일 (파란색)
            playLink.style.display = "flex";
            playLink.style.alignItems = "center";
            playLink.style.justifyContent = "center";
            playLink.style.textDecoration = "none";
            playLink.style.backgroundColor = "#0056b3";
            playLink.style.color = "white";
            playLink.style.padding = "0 15px";
            playLink.style.borderRadius = "8px";
            playLink.style.fontWeight = "bold";
            playLink.style.minWidth = "80px"; // 최소 너비
        } else {
            // ID가 없으면 버튼 숨김 (또는 비활성화)
            playLink.style.display = "none";
        }

        // 4. 줄(row)에 버튼 2개 추가하고, 목록에 줄 추가
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
    location.reload();
};

// 5. 뒤로가기 / 나가기 버튼
document.getElementById('back-btn').onclick = function() {
    location.reload(); // 새로고침해서 로그인 화면으로 돌아감
};
