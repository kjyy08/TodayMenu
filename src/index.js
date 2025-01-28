import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import * as cheerio from "cheerio";

const location = "서울"; // 지역은 서울로 고정
const url = `https://www.weather.go.kr/w/theme/world-weather.do?continentCode=C01&countryCode=127&cityCode=231`; // 기상청 날씨 웹 URL

/**
 * 날씨 정보를 가져오는 함수
 * @returns {Promise<Object>} 날씨 상태와 온도를 포함한 객체
 */
async function getWeather() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // 현재 온도
    const temperature = $(
      "body > div.container > section > div > div.cont-wrap > div > div > div > div.box-b.clearfix > div.box-left > div.weather-box01.clearfix > ul > li:nth-child(2) > span"
    )
      .text()
      .trim();
    // 날씨 상태
    const weatherCondition = $(
      "body > div.container > section > div > div.cont-wrap > div > div > div > div.box-b.clearfix > div.box-left > div.weather-box01.clearfix > ul > li.first > p"
    )
      .text()
      .trim();

    // console.log(`현재 온도: ${temperature}`);
    // console.log(`날씨 상태: ${weatherCondition}`);

    // 값 반환
    return { weatherCondition, temperature };
  } catch (error) {
    console.error("날씨 정보를 가져오는 중 에러가 발생했습니다:", error);
  }
}

/**
 * 오늘 날짜와 시간 정보를 가져오는 함수
 * @returns {Promise<Object>} 오늘 날짜와 시간에 대한 정보 (년도, 월, 일, 요일, 시간, 분)
 */
async function getDate() {
  const today = new Date();

  const year = today.getFullYear(); // 년도
  const month = today.getMonth() + 1; // 월
  const date = today.getDate(); // 날짜
  const day = today.getDay(); // 요일
  const hour = today.getHours(); // 시간
  const min = today.getMinutes(); // 분

  // console.log(year, month, date, day);
  return { year, month, date, day, hour, min };
}

/**
 * 사용자에게 추천할 메뉴를 생성하는 함수
 * @param {string} location - 추천할 메뉴의 위치 (위치는 서울 고정)
 * @param {Object} date - 오늘의 날짜와 시간 정보
 * @param {Object} weather - 날씨 상태와 온도 정보
 * @returns {Promise<string>} 생성된 메뉴 추천 내용
 */
async function getRecommendedMenu(location, date, weather) {
  // Access your API key as an environment variable (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

  const generationConfig = {
    temperature: 0.8,
    top_p: 0.9,
    maxOutputTokens: 800,
  };

  // The Gemini 1.5 models are versatile and work with most use cases
  const model = genAI.getGenerativeModel({
    model: "gemini-exp-1206",
    generationConfig,
  });

  const promptContent = `오늘 ${date.year}.년${date.month}월.${date.date}일 ${date.hour}시 ${date.min}분 ${location}의 날씨는 ${weather.weatherCondition}이고 온도는 ${weather.temperature}도야. 날씨와 계절 그리고 시간을 고려해서 배달시켜 먹기 좋은 식사 메뉴 3가지를 다양하게 추천하고 메뉴명과 함께 간단한 추천 이유를 작성해.`;
  const promptForm = `출력 형식은 다음과 같이 출력해. 1. 시간에 어울리는 음식 추천 문구를 {suggestedFoodText}에 점심이면 "오늘의 점메추는" 저녁이면 "오늘의 저메추는"으로 시작해서 이어서 작성해. 2. {weatherCondition}에는 현재 날씨를 문구로 나타내. 3. 위의 내용을 참고해서 다음 마크다운 문법으로 출력해. # 오늘 뭐 먹지?</br>yyyy년 d월 d일 {hour}시 {minutes}분 {location}의 날씨는 {temperature}℃이고, {weatherCondition}. {suggestedFoodText}</br>1. **메뉴명1**: 이유1</br>2. **메뉴명2**: 이유2</br>3. **메뉴명3**: 이유3</br>`;
  const promptList = [promptContent, promptForm];
  const result = await model.generateContent(promptList);
  const response = await result.response.text().trim();

  console.log(response);
  return response;
}

/**
 * GitHub Issue를 생성하는 함수
 * @param {string} menu - 생성된 메뉴 추천 내용
 * @throws {Error} GitHub Issue 생성 실패 시 예외를 던짐
 */
async function createGithubIssue(menu) {
  const token = process.env.GITHUB_TOKEN;
  const OWNER = process.env.OWNER;
  const REPO = process.env.REPOSITORY;

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "오늘의 메뉴 추천",
        body: `${menu}`,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub Issue 생성 실패: ${errorData.message}`);
  }

  console.log("GitHub Issue 생성 성공");
}

// 코드 실행
(async () => {
  try {
    const weather = await getWeather(); // 날씨 가져오기
    const date = await getDate(); //  오늘 날짜 및 현재 시간 가져오기
    const recommendedMenu = await getRecommendedMenu(location, date, weather); // 메뉴 추천
    await createGithubIssue(recommendedMenu); // GitHub Issue 생성
  } catch (error) {
    console.error("오류 발생:", error.message);
  }
})();
