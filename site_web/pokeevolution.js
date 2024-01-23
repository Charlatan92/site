// Configuration des URL et des informations de type pour la réutilisation
const regionUrls = {
    'kanto': 'https://pokeapi.co/api/v2/generation/1',
    'johto': 'https://pokeapi.co/api/v2/generation/2',
    'hoenn': 'https://pokeapi.co/api/v2/generation/3',
    'sinnoh': 'https://pokeapi.co/api/v2/generation/4',
    'unova': 'https://pokeapi.co/api/v2/generation/5',
    'kalos': 'https://pokeapi.co/api/v2/generation/6',
    'alola': 'https://pokeapi.co/api/v2/generation/7',
    'galar': 'https://pokeapi.co/api/v2/generation/8',
    'paldea': 'https://pokeapi.co/api/v2/generation/9'
};

const typeInfo = {
    'fire': { color: '#FF4422' },
    'combat': { color: '#A67C52' },
    'normal': { color: '#C7C7C7' },
    'ghost': { color: '#705898' },
    'bug': { color: '#60A84F' },
    'dark': { color: '#705848' },
    'psy': { color: '#FF55A3' },
    'fairy': { color: '#FFA0F0' },
    'steel': { color: '#A8A8A8' },
    'rock': { color: '#B8A038' },
    'ice': { color: '#47A7FF' },
    'electric': { color: '#FFCC22' },
    'flying': { color: '#88CCFF' },
    'dragon': { color: '#7038F8' },
    'grass': { color: '#7ACC56' },
    'ground': { color: '#C2B280' },
    'water': { color: '#4488FF' },
    'poison': { color: '#A33EA1' }
};

const evolutionMethodValues = {
    'level-up': 20,
    'trade': 12,
    'use-item': 15,
    'shed': 5,
    'spin': 5,
    'tower-of-darkness': 3,
    'tower-of-waters': 3,
    'three-critical-hits': 2,
    'take-damage': 2,
    'agile-style-move': 1,
    'strong-style-move': 1,
    'recoil-damage': 1,
    'friendship': 20,
    'time-of-day': 15,
    'weather': 12,
    'other': 8  // Vous pouvez utiliser cette clé pour regrouper les méthodes moins communes
};

// Sélecteurs DOM
const canvasContainer = document.getElementById('canvas-container');
let myPolarChart = null;

// Fonction pour générer une couleur aléatoire
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Affichage de la variance et de l'écart type
function displayStats(variance, stdDeviation) {
    const statsContainer = document.createElement('div');
    statsContainer.id = 'stats-container';

    const varianceElement = document.createElement('p');
    varianceElement.textContent = `Variance de la série statistique : ${variance.toFixed(2)}`;

    const stdDeviationElement = document.createElement('p');
    stdDeviationElement.textContent = `Ecart type de la série statistique : ${stdDeviation.toFixed(2)}`;

    statsContainer.appendChild(varianceElement);
    statsContainer.appendChild(stdDeviationElement);

    canvasContainer.appendChild(statsContainer);
}

// Récupération et traitement des données d'évolution
async function fetchEvolutionData(selectedRegionUrl) {
    const response = await fetch('https://pokeapi.co/api/v2/evolution-trigger/');
    const data = await response.json();
    const evolutionTriggers = data.results;

    const triggersData = [];

    for (const trigger of evolutionTriggers) {
        const value = evolutionMethodValues[trigger.name] || evolutionMethodValues['other'];
        triggersData.push({
            label: trigger.name,
            data: value,
            backgroundColor: getRandomColor()
        });
    }

    // Calcul de l'écart type et de la variance
    const n = triggersData.length;
    const mean = triggersData.reduce((sum, value) => sum + value.data, 0) / n;
    const variance = triggersData.reduce((sum, value) => sum + Math.pow(value.data - mean, 2), 0) / n;
    const stdDeviation = Math.sqrt(variance);

    // Affichage de la variance et de l'écart type
    displayStats(variance, stdDeviation);

    return triggersData;
}

// Création du graphique Polar Area
function createPolarAreaChart(data) {
    if (myPolarChart !== null) {
        myPolarChart.destroy();
    }

    // Créer un nouveau canvas avec des dimensions doublées pour le graphique
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'myPolarChart';
    newCanvas.width = 500; // Dimension doublée en largeur
    newCanvas.height = 500; // Dimension doublée en hauteur

    // Effacer tous les enfants de canvasContainer et ajouter le nouveau canvas
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(newCanvas);

    // Créer le graphique sur le nouveau canvas
    const ctx = newCanvas.getContext('2d');
    myPolarChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.data),
                backgroundColor: data.map(d => d.backgroundColor)
            }]
        },
        options: {
            aspectRatio: 0.7,
            responsive: true, // Le graphique sera responsive
            maintainAspectRatio: false, // Désactive le maintien de l'aspect ratio pour permettre un redimensionnement complet
            scales: {
                r: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Récupérer les données et créer le graphique au chargement de la page
(async () => {
    const selectedRegion = regionUrls['kanto']; // Vous pouvez changer la région ici si nécessaire
    const evolutionData = await fetchEvolutionData(selectedRegion);
    createPolarAreaChart(evolutionData);
})();
