// Associer les noms des régions à leurs URL correspondantes
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

// Get the select and button elements from the DOM
const generationSelect = document.getElementById('generation-select');
const analysisButton = document.getElementById('analysis-button');
const canvasContainer = document.getElementById('canvas-container');
let myBubbleChart = null;

// Fill the select element with options
Object.entries(regionUrls).forEach(([region, url]) => {
    const option = document.createElement('option');
    option.value = url;
    option.textContent = region;
    generationSelect.appendChild(option);
});

// Function to fetch Pokémon data from a generation
async function fetchPokemonData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data.pokemon_species.map(species => species.name);
}

// Function to calculate averages and sizes based on the number of Pokémon
async function calculateAveragesAndSizes(pokemonNames) {
    const typeData = {};

    for (const name of pokemonNames) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

        if (response.status === 404) {
            console.log(`Le Pokémon "${name}" n'a pas été trouvé.`);
            continue; // Ignore les Pokémon non trouvés et passe au suivant
        }

        const pokemon = await response.json();
        const mainType = pokemon.types[0].type.name;

        if (!typeInfo[mainType.toLowerCase()]) {
            continue; // Ignore les types qui ne sont pas définis dans typeInfo
        }

        if (!typeData[mainType]) {
            typeData[mainType] = { totalAttack: 0, totalDefense: 0, count: 0 };
        }

        typeData[mainType].totalAttack += pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat;
        typeData[mainType].totalDefense += pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat;
        typeData[mainType].count++;
    }

    const maxCount = Math.max(...Object.values(typeData).map(data => data.count));
    
    return Object.entries(typeData).map(([type, data]) => ({
        x: data.totalDefense / data.count,
        y: data.totalAttack / data.count,
        r: Math.sqrt(data.count) * (40 / Math.sqrt(maxCount)), // Ajustez la taille ici selon vos préférences
        label: type,
        backgroundColor: typeInfo[type.toLowerCase()].color // Utilisez la couleur du type définie dans typeInfo
    }));
}

function fillGenerationSelect() {
    // Vider la liste déroulante avant de la remplir pour éviter les doublons
    generationSelect.innerHTML = '';
  
    // Ajouter une option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a generation';
    defaultOption.value = '';
    generationSelect.appendChild(defaultOption);

    // Ajouter les options de génération à la liste déroulante
    Object.entries(regionUrls).forEach(([region, url]) => {
        const option = document.createElement('option');
        option.value = url;
        option.textContent = region;
        generationSelect.appendChild(option);
    });
}

// Function to create the Bubble Chart
function createBubbleChart(data) {
    // Supprimer l'image Lucario
    const lucarioImage = document.querySelector('.lucario');
    if (lucarioImage) {
        lucarioImage.remove();
    }

    // Si un graphique existe déjà, le détruire avant d'en créer un nouveau
    if (myBubbleChart !== null) {
        myBubbleChart.destroy();
    }

    // Créer un nouveau canvas pour le graphique
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'myBubbleChart';
    newCanvas.width = 400; // Largeur souhaitée
    newCanvas.height = 400; // Hauteur souhaitée

    // Effacer tous les enfants de canvasContainer et ajouter le nouveau canvas
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(newCanvas);

    // Récupérer le type le plus représenté
    let mostRepresentedType = '';
    let maxCount = 0;
    for (const typeData of data) {
        if (typeData.r > maxCount) {
            mostRepresentedType = typeData.label;
            maxCount = typeData.r;
        }
    }

    // Récupérer le type avec la plus haute attaque et défense
    let bestType = '';
    let bestStats = 0;
    for (const typeData of data) {
        const totalStats = typeData.x + typeData.y;
        if (totalStats > bestStats) {
            bestType = typeData.label;
            bestStats = totalStats;
        }
    }

    // Créer le graphique sur le nouveau canvas
    const ctx = newCanvas.getContext('2d');
    myBubbleChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: data.map(typeData => ({
                label: typeData.label,
                data: [typeData],
                backgroundColor: typeInfo[typeData.label.toLowerCase()].color,
                borderColor: 'white',
            }))
        },
        options: {
            aspectRatio: 1, // Carré
            maintainAspectRatio:false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Average Defense'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Average Attack'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                                label += `(Defense: ${context.raw.x}, Attack: ${context.raw.y})`;
                            }

                            return label;
                        }
                    }
                }
            }
        }
    });

    // Affichage du mode de la série statistiques
    const statisticsModeText = document.createElement('div');
    statisticsModeText.textContent = `Le mode de la série statistiques est : ${mostRepresentedType}`;
    statisticsModeText.style.color = 'white';
    canvasContainer.appendChild(statisticsModeText);

    // Affichage du meilleur type à rechercher
    const bestTypeText = document.createElement('div');
    bestTypeText.textContent = `Le meilleur type à rechercher est le ${bestType}`;
    bestTypeText.style.color = 'white';
    canvasContainer.appendChild(bestTypeText);
}

// Event handler for the analysis button
analysisButton.addEventListener('click', async () => {
    console.log('Le bouton a été cliqué.'); // Ceci devrait s'afficher dans la console.

    const selectedRegionUrl = generationSelect.value;
    const selectedRegionName = generationSelect.options[generationSelect.selectedIndex].text; // Récupère le texte de l'option sélectionnée
    const pokemonNames = await fetchPokemonData(selectedRegionUrl);
    const dataWithSizes = await calculateAveragesAndSizes(pokemonNames);
    
    // Affiche le nom de la région sélectionnée
    console.log(`Région sélectionnée : ${selectedRegionName}`); // Ou l'afficher dans le DOM si nécessaire

    // Supprime le graphique précédent s'il existe
    
    // Crée le nouveau Bubble Chart
    createBubbleChart(dataWithSizes);
});

document.addEventListener('DOMContentLoaded', fillGenerationSelect);
