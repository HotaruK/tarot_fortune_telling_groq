const tarotDeck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
    "Judgement", "The World",
    // Cups
    "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
    "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
    "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
    // Pentacles
    "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles",
    "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
    "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles",
    // Swords
    "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
    "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
    "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
    // Wands
    "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
    "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
    "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands"
];
let lastDrawnCards = [];


async function getPrediction() {
    const question = document.getElementById('question').value;
    const readingType = document.querySelector('input[name="readingType"]:checked').value;
    let prompt = '';
    let cards = []

    switch (readingType) {
        case 'threeCard':
            cards = drawCards(3);
            lastDrawnCards = cards;
            prompt = `I have drawn three tarot cards for the user. Please answer the user's question by considering the meaning of each card individually and the overall combination of the cards. The answer should be in two sections: 1. The cards the user has drawn and their simple meanings (taking into account their positions). Please use the name of the section as “The card you drew”. 2. An overall tarot reading and advice for the user. Please use the section name “Results”. Question: "${question}" The cards drawn: ${cards.map(card => card.toString()).join(', ')}.`
            break;
        case 'yesNo':
            cards = drawCards(1);
            lastDrawnCards = cards;
            prompt = `I drew one card as an answer to your question. Please interpret this as a single oracle. The answer should include the following information: 1. a summary of the meaning of the card (taking into account the position of the card), 2. an answer to the question, and 3. a Yes/No answer and the probability of confidence in that answer (such as “Yes with 100% probability”). A Yes/No answer is basically considered to be close to Yes if the card is in the upright position. However, the answer will be flexible depending on the question and the relevance of the card's meaning. Question: "${question}" The cards drawn: ${cards.map(card => card.toString()).join(', ')}.`
            break;
        default:
            console.log('No reading type selected');
    }

    let apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
        showAPIKeyPopup();
        apiKey = localStorage.getItem('apiKey');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [{
                role: "user",
                content: prompt,
            }],
            model: "llama3-8b-8192"
        })
    });

    if (!response.ok) {
        console.error('Error:', response.status);
        return;
    }

    const data = await response.json();
    document.getElementById('result').textContent = data.choices[0]?.message?.content || "";

}


class Card {
    constructor(name, position) {
        this.name = name;
        this.position = position;
    }

    toString() {
        return `${this.name} (${this.position})`;
    }
}

function drawCards(cardNum) {
    let drawnCards = [];
    let drawnIndices = new Set();
    for (let i = 0; i < cardNum; i++) {
        let cardIndex;
        do {
            cardIndex = Math.floor(Math.random() * tarotDeck.length);
        } while (drawnIndices.has(cardIndex));
        drawnIndices.add(cardIndex);
        let position = Math.random() < 0.5 ? 'Upright' : 'Reverse';
        drawnCards.push(new Card(tarotDeck[cardIndex], position));
    }
    return drawnCards;
}


function exportToCSV() {
    const data = [
        ['Date', 'Question', 'Cards', 'Answer'],
        ['"' + new Date().toString() + '"',
            '"' + document.getElementById('question').value + '"',
            '"' + lastDrawnCards.map(card => card.toString()).join(', ') + '"',
            '"' + document.getElementById('result').value.replace(/"/g, '""') + '"']
    ];
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tarot_result.csv");
    document.body.appendChild(link);
    link.click();
}


function showAPIKeyPopup() {
    const currentKey = localStorage.getItem('apiKey') || '';
    const apiKey = prompt('Put your API Key here', currentKey);
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
    }
}


function reset() {
    document.getElementById('question').value = '';
    document.getElementById('result').textContent = '';
    lastDrawnCards = [];
}

function showUsagePopup() {
    document.getElementById('popup').classList.add('show');
}

function closePopup() {
    document.getElementById('popup').classList.remove('show');
}

document.getElementById('menu').style.display = 'block';
