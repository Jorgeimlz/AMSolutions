document.addEventListener('DOMContentLoaded', function() {
    const risks = document.querySelectorAll('.risk');

    risks.forEach(risk => {
        risk.addEventListener('click', function() {
            const dominio = this.dataset.dominio;
            window.location.href = `/riesgo/${this.dataset.risk}/${dominio}`;
        });
    });
});
