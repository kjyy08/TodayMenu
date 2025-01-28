# 오늘 뭐 먹지?

<p align="center">
    <img src="https://github.com/user-attachments/assets/1c872de6-66e4-4788-b514-a91bfc2ba837" alt="오늘 뭐 먹지?" width="150" height="150">
</p>

## 🏠프로젝트 개요

기상청에서 크롤링한 날씨 상태와 온도를 기반으로 현재 시간, 날씨, 계절에 어울리는 음식 메뉴를 `Google Gemini API`를 이용해 추천받고 이를 매일 정해진 시간에 `GitHub Issues`를 생성합니다.

- `cheerio` 를 통해 기상청에서 날씨 상태와 온도 데이터를 크롤링합니다.
- `Google Gemini API` 활용해 현재 시간, 날씨 고려해서 음식 메뉴를 추천합니다.
- `GitHub Actions`를 이용해 매일 12시, 18시에 스크립트를 자동 실행합니다.

## 💻기술 스택

- `Node.js`: 자바스크립트 실행
- `cheerio`: 기상청 날씨 데이터 크롤링
- `Google Gemini API(gemini-exp-1206)`: 날씨, 시간, 계절 기반 음식 메뉴 추천
- `GitHub Actions`: 매일 정해진 시간에 스크립트 실행 및 이슈 생성

## 🚀시작하기

1. 리포지토리 클론

```bash
git clone https://github.com/kjyy08/TodayMenu.git
cd TodayMenu
```

2. 패키지 설치

```bash
npm install
```

3. `Google Gemini API` 키 발급

프로젝트 시작 전 `Google Gemini API` 키 발급이 필요합니다.

[Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key?hl=ko) 사이트 접속 후 `Google AI Studio에서 Gemini API 키 받기` 버튼을 클릭해 API 키를 발급받습니다.

![Image](https://github.com/user-attachments/assets/a8a0fef0-9a34-45e2-86f3-794480ebc8c2)

4. 환경변수 설정

`./github/workflows/schedule.yml`에 작성된 아래의 환경변수를 수정합니다.

```yml
env:
  OWNER: your_github_name # 깃허브 사용자 이름
  REPOSITORY: your_github_repository # 깃허브 리포지토리 이름
```

다음으로 리포지토리에서 `Setting - Security - Secrets and variables - Actions` 탭에 들어가 발급받은 `Google Gemini API` 키를 추가합니다.

![Image](https://github.com/user-attachments/assets/a97492d0-a029-47bb-a3da-5fb0fd036626)

`New repository secret` 버튼 클릭

![Image](https://github.com/user-attachments/assets/b346fe9d-b65f-4b90-824e-945a859cbba0)

`Name`에 `"GOOGLE_GEMINI_API_KEY"` 입력 -> `Secret`에 발급받은 키 값 추가

5. 스크립트 실행

```bash
node ./src/index.js
```
