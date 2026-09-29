const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const pokemonModal = document.getElementById('pokemonModal')
const pokemonModalContent = document.getElementById('pokemonModalContent')
const loadedPokemons = new Map()
const statLabels = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defesa',
    'special-attack': 'Ataque especial',
    'special-defense': 'Defesa especial',
    speed: 'Velocidade'
}

const statIconPaths = {
    hp: 'M12 21 3.5 12.5C-2 7 5 0 10.5 5.5L12 7l1.5-1.5C19 0 26 7 20.5 12.5Z',
    attack: 'M5 13V6a2 2 0 0 1 4 0V4a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v7c0 3-2 4-3 5v3H8v-4l-5-5a2 2 0 0 1 3-3l3 3v-3H7v3Z',
    defense: 'M12 2 3 6v6c0 5 5 9 9 11 4-2 9-6 9-11V6Z',
    speed: 'M14 1 3 14h8l-1 9L22 9h-9Z'
}

function renderStatIcon(name) {
    const path = statIconPaths[name]
    return path
        ? `<svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}" /></svg>`
        : ''
}

function openPokemonModal(number) {
    const pokemon = loadedPokemons.get(Number(number))
    if (!pokemon) return

    pokemonModalContent.innerHTML = `
        <section class="modal-info">
            <span class="modal-number">#${String(pokemon.number).padStart(3, '0')}</span>
            <h2 id="pokemonModalTitle">${pokemon.name}</h2>
            <ul class="modal-types">
                ${pokemon.types.map((type) => `<li class="${type}">${type}</li>`).join('')}
            </ul>
            <dl class="modal-facts">
                <div><dt>Altura</dt><dd>${pokemon.height.toLocaleString('pt-BR')} m</dd></div>
                <div><dt>Peso</dt><dd>${pokemon.weight.toLocaleString('pt-BR')} kg</dd></div>
                <div><dt>Experiência base</dt><dd>${pokemon.baseExperience ?? 'Não informada'}</dd></div>
            </dl>
            <h3>Habilidades</h3>
            <ul class="modal-abilities">
                ${pokemon.abilities.map((ability) => `<li>${ability.name.replaceAll('-', ' ')}${ability.hidden ? ' (oculta)' : ''}</li>`).join('')}
            </ul>
            <h3>Atributos base</h3>
            <dl class="modal-stats">
                ${pokemon.stats.map((stat) => `<div><dt>${statLabels[stat.name] || stat.name}</dt><dd><span>${stat.value}</span>${renderStatIcon(stat.name)}</dd></div>`).join('')}
            </dl>
        </section>
        <div class="modal-artwork ${pokemon.type}">
            <img src="${pokemon.photo}" alt="${pokemon.name}" width="320" height="320">
        </div>`
    pokemonModal.showModal()
    document.body.classList.add('modal-open')
}

document.getElementById('closePokemonModal').addEventListener('click', () => pokemonModal.close())
pokemonModal.addEventListener('close', () => document.body.classList.remove('modal-open'))
pokemonModal.addEventListener('click', (event) => {
    const bounds = pokemonModal.getBoundingClientRect()
    if (event.target === pokemonModal && (
        event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom
    )) pokemonModal.close()
})

pokemonList.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pokemon-number]')
    if (card) openPokemonModal(card.dataset.pokemonNumber)
})
pokemonList.addEventListener('keydown', (event) => {
    const card = event.target.closest('[data-pokemon-number]')
    if (card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        openPokemonModal(card.dataset.pokemonNumber)
    }
})
const maxRecords = 151
const limit = 15
let offset = 0

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        pokemons.forEach((pokemon) => loadedPokemons.set(pokemon.number, pokemon))
        const newHtml = pokemons.map((pokemon) => `
            <li class="pokemon ${pokemon.type}" data-pokemon-number="${pokemon.number}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Ver detalhes de ${pokemon.name}">
                <span class="number">#${String(pokemon.number).padStart(3, '0')}</span>
                <span class="name">${pokemon.name}</span>

                <div class="detail">
                    <ol class="types">
                        ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join(' ')}
                    </ol>
                    <img src="${pokemon.photo}" 
                    alt="${pokemon.name}">
                </div>
                        
            </li>`
        ).join('')
        pokemonList.insertAdjacentHTML('beforeend', newHtml)
    })
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNextPage = offset + limit

if (qtdRecordsWithNextPage >= maxRecords) {
    const newLimit = maxRecords - offset
    loadPokemonItens(offset, newLimit)

    loadMoreButton.parentElement.removeChild(loadMoreButton)
} else {
    loadPokemonItens(offset, limit)
}

})
