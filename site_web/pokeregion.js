// Inclure Chart.js
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Fonction pour récupérer tous les Pokémon
async function fetchAllPokemon() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await response.json();
    return data.results;
}

// Fonction pour compter les Pokémon par type
async function countPokemonByType(pokemonList) {
    const typeCounts = {};

    for (const pokemon of pokemonList) {
        const response = await fetch(pokemon.url);
        const pokemonData = await response.json();

        for (const typeInfo of pokemonData.types) {
            const typeName = typeInfo.type.name;
            typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
        }
    }

    return typeCounts;
}

// Fonction pour calculer la courbe de régression linéaire
function calculateLinearRegression(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return x.map(xi => slope * xi + intercept);
}
// Fonction pour créer le graphique en barres avec la courbe de régression
async function createChart() {
    const pokemonList = await fetchAllPokemon();
    const typeCounts = await countPokemonByType(pokemonList);
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    const xValues = data.map((_, i) => i + 1); // x-values as 1, 2, 3, ...
    const regressionData = calculateLinearRegression(xValues, data);

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre de Pokémon par type',
                data: data,
                backgroundColor: 'rgba(0, 123, 255, 0.5)'
            }, {
                label: 'Régression linéaire',
                data: regressionData,
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            maintainAspectRatio: false,
            aspectRatio: 0.7,
            scales: {
                y: {
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

    // Ajout du texte dans le conteneur chart-container
    const chartContainer = document.getElementById('chart-container');
    const textElement = document.createElement('p');
    textElement.textContent = "La courbe de régression linéaire nous permet d'observer la tendance entre le nombre de Pokémon et leurs types respectifs, indiquant si certains types de Pokémon sont plus fréquemment rencontrés que d'autres. Par exemple, cette ligne droite peut nous aider à prévoir le nombre de Pokémon de type Feu que nous pourrions rencontrer en fonction de la tendance générale observée dans notre base de données, donnant ainsi une perspective sur la répartition et la fréquence des différents types de Pokémon dans notre univers d'étude.";

    chartContainer.appendChild(textElement);
}

// Appel de la fonction pour créer le graphique
document.addEventListener('DOMContentLoaded', createChart);
