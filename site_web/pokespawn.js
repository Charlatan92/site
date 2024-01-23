// Inclusion de Chart.js si elle n'est pas déjà incluse dans votre HTML
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Données codées en dur pour les méthodes d'encounter basées sur l'image fournie
const encounterData = {
    'walk': 12,
    'old-rod': 13,  // Vous pouvez définir le nombre de symboles ✔ pour 'old-rod' à 0
    'surf': 10, // Vous pouvez définir le nombre de symboles ✔ pour 'surf' à 0
    'rock-smash': 8, // Vous pouvez définir le nombre de symboles ✔ pour 'rock-smash' à 0
    'headbutt': 2, 
    'cave-spots': 12,
    'gift': 7,
    'only-one': 9
};
async function fetchEncounterMethods() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/encounter-method/');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Erreur lors de la récupération des méthodes d'encounter:", error);
        return [];
    }
}

async function createEncounterMethodsPieChart() {
    const encounterMethods = await fetchEncounterMethods();
    const filteredMethods = encounterMethods.filter(method => encounterData.hasOwnProperty(method.name));

    const labels = filteredMethods.map(method => method.name);
    const data = filteredMethods.map(method => encounterData[method.name]);

    const colors = {
        'walk': 'green', // Vert
        'old-rod': 'lightblue', // Bleu clair
        'surf': 'darkblue', // Bleu foncé
        'rock-smash': 'brown', // Marron
        'headbutt': 'beige', // Beige
        'cave-spots': 'gray', // Gris
        'gift': 'pink', // Rose
        'only-one': 'yellow' // Jaune
    };

    const backgroundColors = labels.map(method => colors[method]);

    const ctx = document.getElementById('myPieChart').getContext('2d');
    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Maintenir le ratio d'aspect
            aspectRatio: 0.7, // Définir le ratio d'aspect pour réduire la taille du graphique (2 signifie largeur:hauteur = 2:1)
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Encounter Methods Distribution'
                }
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';
                        if (label) {
                            label += ': ';
                        }
                        label += data.datasets[0].data[tooltipItem.index];
                        return label;
                    }
                }
            }
        },
    });
}


document.addEventListener('DOMContentLoaded', createEncounterMethodsPieChart);
