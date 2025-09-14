# 이 파일은 Flask를 사용하여 Python 기반의 프록시 서버를 구축합니다.
# Flask와 requests 라이브러리를 설치해야 합니다:
# pip install Flask requests

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64

app = Flask(__name__)
CORS(app)  # CORS를 활성화하여 모든 출처의 요청을 허용합니다.

# 보안을 위해 API 키를 환경 변수에 설정하세요.
# 예: export API_KEY="YOUR_API_KEY_HERE"
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    print("경고: API 키가 환경 변수 'API_KEY'에 설정되지 않았습니다.")
    print("git push를 하기 전에 반드시 API 키를 제거해야 합니다.")

GEMINI_TTS_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent"

@app.route('/tts', methods=['POST'])
def tts_proxy():
    try:
        data = request.get_json()
        text_to_speak = data.get('textToSpeak')

        if not text_to_speak:
            return jsonify({"error": "텍스트 데이터가 없습니다."}), 400

        payload = {
            "contents": [{
                "parts": [{ "text": text_to_speak }]
            }],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": { "voiceName": "Zephyr" }
                    }
                }
            },
            "model": "gemini-2.5-flash-preview-tts"
        }

        # API 요청에 API 키를 포함시킵니다.
        response = requests.post(
            f"{GEMINI_TTS_API_URL}?key={API_KEY}",
            json=payload
        )
        response.raise_for_status()  # HTTP 오류가 발생하면 예외를 발생시킵니다.
        
        gemini_response = response.json()
        part = gemini_response.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0]
        
        audio_data_base64 = part.get('inlineData', {}).get('data')
        mime_type = part.get('inlineData', {}).get('mimeType')
        
        if not audio_data_base64:
            return jsonify({"error": "음성 데이터를 찾을 수 없습니다."}), 500

        # MIME 타입에서 sampleRate를 추출합니다.
        sample_rate = 16000 # 기본값
        if mime_type:
            rate_match = [int(s) for s in mime_type.split('rate=') if s.isdigit()]
            if rate_match:
                sample_rate = rate_match[0]

        # 클라이언트에게 base64로 인코딩된 오디오 데이터와 sampleRate를 보냅니다.
        return jsonify({
            "audioData": audio_data_base64,
            "sampleRate": sample_rate
        })

    except requests.exceptions.RequestException as e:
        print(f"API 요청 오류: {e}")
        return jsonify({"error": f"API 요청에 실패했습니다: {str(e)}"}), 500
    except Exception as e:
        print(f"서버 오류: {e}")
        return jsonify({"error": "알 수 없는 서버 오류가 발생했습니다."}), 500

if __name__ == '__main__':
    # 개발 목적으로만 사용하세요.
    # 깃허브 페이지에서 사용하려면 별도의 서버 호스팅이 필요합니다.
    app.run(debug=True, port=3000)
