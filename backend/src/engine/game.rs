use serde::{Deserialize, Serialize};

use super::card::Card;

pub const TABLEAU_COUNT: usize = 7;
pub const FOUNDATION_COUNT: usize = 4;
pub const DECK_SIZE: usize = 52;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameState {
    pub stock: Vec<Card>,
    pub waste: Vec<Card>,
    pub foundations: Vec<Vec<Card>>,
    pub tableau: Vec<Vec<Card>>,
}

impl GameState {
    #[cfg(test)]
    pub fn empty() -> Self {
        Self {
            stock: Vec::new(),
            waste: Vec::new(),
            foundations: vec![Vec::new(); FOUNDATION_COUNT],
            tableau: vec![Vec::new(); TABLEAU_COUNT],
        }
    }

    pub fn foundation_total(&self) -> usize {
        self.foundations.iter().map(Vec::len).sum()
    }
}

/// Distribui as 28 primeiras cartas em sete colunas e deixa o restante no monte.
/// A última carta de cada coluna nasce virada para cima.
pub fn deal(deck: &[Card]) -> GameState {
    assert_eq!(deck.len(), DECK_SIZE, "o baralho precisa ter 52 cartas");
    let mut tableau = vec![Vec::new(); TABLEAU_COUNT];
    let mut cursor = 0;
    for row in 0..TABLEAU_COUNT {
        for (column, pile) in tableau.iter_mut().enumerate().skip(row) {
            let mut card = deck[cursor];
            card.face_up = row == column;
            pile.push(card);
            cursor += 1;
        }
    }

    GameState {
        stock: deck[cursor..]
            .iter()
            .map(|card| Card {
                face_up: false,
                ..*card
            })
            .collect(),
        waste: Vec::new(),
        foundations: vec![Vec::new(); FOUNDATION_COUNT],
        tableau,
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PileKind {
    Waste,
    Tableau,
    Foundation,
}

/// Referência a uma pilha. Para o descarte, `index` é ignorado.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PileRef {
    pub pile: PileKind,
    #[serde(default)]
    pub index: usize,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Move {
    Draw,
    Recycle,
    #[serde(rename = "move")]
    Play {
        from: PileRef,
        #[serde(rename = "cardIndex")]
        card_index: usize,
        to: PileRef,
    },
}

fn is_valid_sequence(cards: &[Card]) -> bool {
    if cards.iter().any(|card| !card.face_up) {
        return false;
    }
    cards.windows(2).all(|pair| {
        pair[0].rank == pair[1].rank + 1 && pair[0].suit.is_red() != pair[1].suit.is_red()
    })
}

fn can_place_on_tableau(card: Card, destination: &[Card]) -> bool {
    match destination.last() {
        None => card.rank == 13,
        Some(top) => {
            top.face_up && top.rank == card.rank + 1 && top.suit.is_red() != card.suit.is_red()
        }
    }
}

fn can_place_on_foundation(card: Card, destination: &[Card]) -> bool {
    match destination.last() {
        None => card.rank == 1,
        Some(top) => top.suit == card.suit && top.rank + 1 == card.rank,
    }
}

pub fn is_won(state: &GameState) -> bool {
    state.foundation_total() == DECK_SIZE
}

/// Aplica uma jogada e devolve `true` quando uma carta do tableau foi desvirada.
pub fn apply_move(state: &mut GameState, mov: &Move, draw_count: usize) -> Result<bool, String> {
    match mov {
        Move::Draw => {
            if state.stock.is_empty() {
                return Err("O monte está vazio.".to_string());
            }
            for _ in 0..draw_count.max(1) {
                if let Some(mut card) = state.stock.pop() {
                    card.face_up = true;
                    state.waste.push(card);
                }
            }
            Ok(false)
        }
        Move::Recycle => {
            if state.waste.is_empty() {
                return Err("O descarte está vazio.".to_string());
            }
            if !state.stock.is_empty() {
                return Err("Ainda há cartas no monte.".to_string());
            }
            let recycled: Vec<Card> = state
                .waste
                .drain(..)
                .rev()
                .map(|mut card| {
                    card.face_up = false;
                    card
                })
                .collect();
            state.stock = recycled;
            Ok(true)
        }
        Move::Play {
            from,
            to,
            card_index,
        } => {
            if from.pile == to.pile && from.index == to.index {
                return Err("Origem e destino são iguais.".to_string());
            }

            let (moving, source_len) = match from.pile {
                PileKind::Waste => {
                    let card = state
                        .waste
                        .last()
                        .copied()
                        .ok_or_else(|| "O descarte está vazio.".to_string())?;
                    (vec![card], state.waste.len())
                }
                PileKind::Foundation => {
                    if from.index >= FOUNDATION_COUNT {
                        return Err("Fundação inválida.".to_string());
                    }
                    let card = state.foundations[from.index]
                        .last()
                        .copied()
                        .ok_or_else(|| "A fundação está vazia.".to_string())?;
                    (vec![card], state.foundations[from.index].len())
                }
                PileKind::Tableau => {
                    if from.index >= TABLEAU_COUNT {
                        return Err("Coluna inválida.".to_string());
                    }
                    let pile = &state.tableau[from.index];
                    if *card_index >= pile.len() {
                        return Err("Carta inválida na coluna.".to_string());
                    }
                    let sequence = pile[*card_index..].to_vec();
                    if !is_valid_sequence(&sequence) {
                        return Err("Essa sequência não pode ser movida.".to_string());
                    }
                    (sequence, pile.len())
                }
            };

            let first = *moving
                .first()
                .ok_or_else(|| "Nada para mover.".to_string())?;

            match to.pile {
                PileKind::Waste => return Err("Não é possível mover para o descarte.".to_string()),
                PileKind::Tableau => {
                    if to.index >= TABLEAU_COUNT {
                        return Err("Coluna inválida.".to_string());
                    }
                    if !can_place_on_tableau(first, &state.tableau[to.index]) {
                        return Err("Essa carta não pode ir para essa coluna.".to_string());
                    }
                }
                PileKind::Foundation => {
                    if to.index >= FOUNDATION_COUNT {
                        return Err("Fundação inválida.".to_string());
                    }
                    if moving.len() != 1 {
                        return Err("Só é possível mover uma carta para a fundação.".to_string());
                    }
                    if !can_place_on_foundation(first, &state.foundations[to.index]) {
                        return Err("Essa carta não pode ir para essa fundação.".to_string());
                    }
                }
            }

            let mut flipped = false;
            match from.pile {
                PileKind::Waste => {
                    let card = state
                        .waste
                        .pop()
                        .ok_or_else(|| "O descarte está vazio.".to_string())?;
                    state.waste.truncate(source_len.saturating_sub(1));
                    // O pop acima já removeu a carta; o truncate é defensivo.
                    debug_assert_eq!(card, moving[0]);
                }
                PileKind::Foundation => {
                    state.foundations[from.index].pop();
                }
                PileKind::Tableau => {
                    state.tableau[from.index].truncate(*card_index);
                    if let Some(top) = state.tableau[from.index].last_mut()
                        && !top.face_up
                    {
                        top.face_up = true;
                        flipped = true;
                    }
                }
            }

            match to.pile {
                PileKind::Waste => unreachable!(),
                PileKind::Tableau => state.tableau[to.index].extend(moving),
                PileKind::Foundation => {
                    state.foundations[to.index].extend(moving);
                }
            }

            Ok(flipped)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::card::{Suit, full_deck};

    fn ordered_deck() -> Vec<Card> {
        full_deck()
    }

    #[test]
    fn distribui_sete_colunas_com_tamanhos_corretos() {
        let state = deal(&ordered_deck());
        let sizes: Vec<usize> = state.tableau.iter().map(Vec::len).collect();
        assert_eq!(sizes, vec![1, 2, 3, 4, 5, 6, 7]);
        assert_eq!(state.stock.len(), 24);
        assert_eq!(state.waste.len(), 0);
        for (index, pile) in state.tableau.iter().enumerate() {
            assert_eq!(pile.len(), index + 1);
            assert!(!pile[..pile.len() - 1].iter().any(|card| card.face_up));
            assert!(pile.last().unwrap().face_up);
        }
    }

    #[test]
    fn desenha_tres_cartas_e_recicla_na_ordem_correta() {
        let mut state = GameState::empty();
        state.stock = vec![
            Card::new(Suit::Spades, 1, false),
            Card::new(Suit::Spades, 2, false),
            Card::new(Suit::Spades, 3, false),
            Card::new(Suit::Spades, 4, false),
        ];
        apply_move(&mut state, &Move::Draw, 3).unwrap();
        let drawn: Vec<u8> = state.waste.iter().map(|card| card.rank).collect();
        assert_eq!(drawn, vec![4, 3, 2]);
        apply_move(&mut state, &Move::Draw, 3).unwrap();
        assert_eq!(state.waste.last().unwrap().rank, 1);
        apply_move(&mut state, &Move::Recycle, 3).unwrap();
        assert!(state.waste.is_empty());
        let stock_ranks: Vec<u8> = state.stock.iter().map(|card| card.rank).collect();
        assert_eq!(stock_ranks, vec![1, 2, 3, 4]);
    }

    #[test]
    fn ace_em_fundacao_vazia_e_rei_em_coluna_vazia() {
        let mut state = GameState::empty();
        state.waste.push(Card::new(Suit::Hearts, 1, true));
        let ace = Move::Play {
            from: PileRef {
                pile: PileKind::Waste,
                index: 0,
            },
            card_index: 0,
            to: PileRef {
                pile: PileKind::Foundation,
                index: 2,
            },
        };
        apply_move(&mut state, &ace, 1).unwrap();
        assert_eq!(state.foundations[2][0].rank, 1);

        state.tableau[0].push(Card::new(Suit::Spades, 13, true));
        let king = Move::Play {
            from: PileRef {
                pile: PileKind::Waste,
                index: 0,
            },
            card_index: 0,
            to: PileRef {
                pile: PileKind::Tableau,
                index: 0,
            },
        };
        assert!(apply_move(&mut state, &king, 1).is_err());
    }

    #[test]
    fn mover_sequencia_desvira_carta_de_baixo() {
        let mut state = GameState::empty();
        state.tableau[0] = vec![
            Card::new(Suit::Spades, 5, false),
            Card::new(Suit::Spades, 9, true),
            Card::new(Suit::Hearts, 8, true),
        ];
        state.tableau[1] = vec![Card::new(Suit::Hearts, 10, true)];
        let mov = Move::Play {
            from: PileRef {
                pile: PileKind::Tableau,
                index: 0,
            },
            card_index: 1,
            to: PileRef {
                pile: PileKind::Tableau,
                index: 1,
            },
        };
        let flipped = apply_move(&mut state, &mov, 1).unwrap();
        assert!(flipped);
        assert!(state.tableau[0][0].face_up);
        assert_eq!(state.tableau[1].len(), 3);
    }

    #[test]
    fn vitoria_quando_as_quatro_fundacoes_estao_cheias() {
        let mut state = GameState::empty();
        let suits = [Suit::Spades, Suit::Hearts, Suit::Diamonds, Suit::Clubs];
        for (index, suit) in suits.iter().enumerate() {
            state.foundations[index] = (1..=13).map(|rank| Card::new(*suit, rank, true)).collect();
        }
        assert!(is_won(&state));
    }

    #[test]
    fn jogadas_usam_o_mesmo_json_do_frontend() {
        let play = Move::Play {
            from: PileRef {
                pile: PileKind::Tableau,
                index: 2,
            },
            card_index: 1,
            to: PileRef {
                pile: PileKind::Foundation,
                index: 0,
            },
        };
        let json = serde_json::to_value(&play).unwrap();
        assert_eq!(json["type"], "move");
        assert_eq!(json["from"]["pile"], "tableau");
        assert_eq!(json["cardIndex"], 1);
        let roundtrip: Move = serde_json::from_value(json).unwrap();
        assert_eq!(roundtrip, play);

        let draw = serde_json::to_value(Move::Draw).unwrap();
        assert_eq!(draw["type"], "draw");
        let recycle: Move =
            serde_json::from_value(serde_json::json!({ "type": "recycle" })).unwrap();
        assert_eq!(recycle, Move::Recycle);
    }
}
