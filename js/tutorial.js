document.addEventListener('DOMContentLoaded', () => {
    const tutorialBtn = document.getElementById('tutorial-btn');
    const tutorialLayer = document.getElementById('tutorial-layer');

    // 버튼을 클릭하면 튜토리얼 info를 보여줌
    tutorialBtn.addEventListener('click', () => {
        tutorialLayer.style.display = 'flex';
    });

    // 튜토리얼 info 화면의 어딘가를 클릭해도 종료되도록
    tutorialLayer.addEventListener('click', (event) => {
        if (event.target === tutorialLayer) {
            tutorialLayer.style.display = 'none';
        }
    });
});