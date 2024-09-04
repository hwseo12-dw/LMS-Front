import React, { useState, useEffect, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import styled from "styled-components";

import Modal from "react-modal";

import { Notices } from "../LMS/Community/Notices.js";
import { QA } from "../LMS/Community/QA.js";
import { Events } from "../LMS/Community/Events.js";

import { LectureList } from "../LMS/Lecture/LectureList.js";

import { UserManagement } from "../LMS/Admin/UserManagement.js";

import axios from "axios";

// 게임을 로드할 화면을 만듬
const Container = styled.div`
  width: 1344px;
  height: 756px;
  margin: auto;
  border: 1px solid gray;
`;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "1400px", // 모달의 너비를 설정합니다. (기존 width)
    height: "865px", // 모달의 높이를 설정합니다. (기존 height)
    padding: "20px",
    borderRadius: "10px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 오버레이의 배경색을 설정합니다.
  },
};

export function UnityProject() {
  const [playingGame, setPlayingGame] = useState(false);

  const [isGameOver, setIsGameOver] = useState(false);
  const [userName, setUserName] = useState();
  const [score, setScore] = useState();

  const [modalOpen, setModalOpen] = useState(false);
  const modalBackground = useRef();

  const [modalReturn, setModalReturn] = useState(null);

  // React 에서 Unity 로 sendMessage 를 통해 전달하기
  const { unityProvider, sendMessage, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: "build/Build.loader.js",
      dataUrl: "build/Build.data",
      frameworkUrl: "build/Build.framework.js",
      codeUrl: "build/Build.wasm",
    });

  // Unity 에서 React 로 전달
  function handleGameOver(userName, score) {
    setIsGameOver(true);
    setUserName(userName);
    setScore(score);
  }

  // // Unity에서 호출될 JavaScript 함수
  // function handleOpenReactWindow(romeName) {
  //     // 예를 들어, 새로운 브라우저 창을 열도록 구현할 수 있습니다.
  //     // React 애플리케이션의 URL로 새로운 탭을 열기
  //     window.open("http://localhost:3000/community/notices", "_blank");
  // }

  useEffect(() => {
    addEventListener("OpenReactWindow", handleOpenReactWindow);
    return () => {
      removeEventListener("OpenReactWindow", handleOpenReactWindow);
    };
  }, []);

  // Unity에서 호출될 JavaScript 함수
  function handleOpenReactWindow(romeName) {
    // 예를 들어, 새로운 브라우저 창을 열도록 구현할 수 있습니다.
    // React 애플리케이션의 URL로 새로운 탭을 열기

    if (romeName == "공지사항") {
      // window.alert("Modal Open 공지사항!!! 전달됨");
      setModalOpen(true);
      setModalReturn(() => Notices); // React component function
      // setModalReturn(() => UserManagement); // React component function
      // setModalReturn(() => LectureList); // React component function
    } else if (romeName == "이벤트") {
      setModalOpen(true);
      setModalReturn(() => Events); // React component function
    } else if (romeName == "QA") {
      setModalOpen(true);
      setModalReturn(() => QA); // React component function
    }
  }

  useEffect(() => {
    addEventListener("GameOver", handleGameOver);
    return () => {
      removeEventListener("GameOver", handleGameOver);
    };
  }, []);

  function ReactToUnityJSON() {
    // const urlLectureContentQA = `http://localhost:8080/learning/contents/qa/${lectureId}/${data.learningContentsSeq}`; // /{lectureId}/{learningContentsSeq}
    const urlLectureContentQA = `http://localhost:8080/learning/contents/qa/L00000000052/3`; // /{lectureId}/{learningContentsSeq}

    window.alert("urlLectureContentQA: " + urlLectureContentQA);

    axios
      .get(urlLectureContentQA, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("데이터:", response.data);
        window.alert(
          "response.data: " +
            response.data[0].question +
            "@" +
            response.data[1].question +
            "@" +
            response.data[2].question
        );

        const jsonData = JSON.stringify(response.data);

        window.alert("React jsonData: " + jsonData);

        // Unity로 데이터 전송
        // sendMessage("DataReceiverObject", "ReceiveJsonData", jsonData);
        // sendMessage("DataReceiver", "ReceiveJsonData", jsonData);

        window.alert("SendMessage Start!!!");

        sendMessage("Player", "ReceiveJsonData", jsonData);
      })
      .catch((error) => {
        console.log("에러 발생: ", error);
      });
  }

  function RequestFocus() {
    // Focus 문제로 버그가 있어서, 이 부분을 제외할 경우 상단키를 입력하지 않으면, 플레이어 컨트롤이 안됨.
    window.alert("계속 게임을 진행합니다.");
  }

  return (
    <>
      <h1>UnityProject Game</h1>
      <button onClick={() => setPlayingGame(true)}>Start Game</button>
      <button onClick={() => sendMessage("PortalManager", "PauseGame")}>
        Pause Game
      </button>
      <button onClick={() => sendMessage("PortalManager", "ContinueGame")}>
        Continue Game
      </button>
      <button onClick={() => sendMessage("Player", "Attack")}>Attack</button>
      <button onClick={() => ReactToUnityJSON()}>ReactToUnityJSON</button>
      <Container>
        {/* <div className={"btn-wrapper"}>
                    <button
                        className={"modal-open-btn"}
                        onClick={() => setModalOpen(true)}
                    >
                        모달 열기
                    </button>
                </div> */}
        {modalOpen && (
          <div
            className={"modal-container"}
            ref={modalBackground}
            onClick={(e) => {
              /* 모달 밖의 부분 클릭시 Close */
              if (e.target === modalBackground.current) {
                setModalOpen(false);
                sendMessage("PortalManager", "ContinueGame");
                RequestFocus();
              }
            }}
          >
            {/* <div className={"modal-content"}> */}
            <Modal
              isOpen={modalOpen}
              onRequestClose={() => {
                setModalOpen(false);
              }}
              style={customStyles} // 스타일을 적용합니다.
              contentLabel="Modal Test"
            >
              <span
                className="close"
                /* 오른쪽 상단 x 클릭시 Close */
                onClick={() => {
                  setModalOpen(false);
                  sendMessage("PortalManager", "ContinueGame");
                  RequestFocus();
                }}
              >
                &times;
              </span>
              <h1>리액트로 모달</h1>
              {modalReturn && React.createElement(modalReturn)}
              <br></br>
              <button
                /* [모달 닫기] 버튼 클릭시 Close */
                onClick={() => {
                  setModalOpen(false);
                  sendMessage("PortalManager", "ContinueGame");
                  RequestFocus();
                }}
              >
                모달 닫기
              </button>
            </Modal>
            {/* </div> */}
          </div>
        )}
        {playingGame ? (
          <Unity
            unityProvider={unityProvider}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : null}
      </Container>

      {/* // Unity 에서 게임오버 메시지를 받으면 출력후 종료 */}
      {isGameOver === true && (
        <p>{`Game Over ${userName}! You've scored ${score} points.`}</p>
      )}
    </>
  );
}
