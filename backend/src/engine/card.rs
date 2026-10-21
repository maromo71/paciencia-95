use serde::{Deserialize, Serialize};

/// Naipe da carta. Os códigos curtos são os mesmos usados pelo frontend.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Suit {
    #[serde(rename = "S")]
    Spades,
    #[serde(rename = "H")]
    Hearts,
    #[serde(rename = "D")]
    Diamonds,
    #[serde(rename = "C")]
    Clubs,
}

impl Suit {
    pub fn is_red(self) -> bool {
        matches!(self, Suit::Hearts | Suit::Diamonds)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Card {
    pub suit: Suit,
    /// 1 = Ás, 11 = Valete, 12 = Dama, 13 = Rei.
    pub rank: u8,
    pub face_up: bool,
}

impl Card {
    pub fn new(suit: Suit, rank: u8, face_up: bool) -> Self {
        Self {
            suit,
            rank,
            face_up,
        }
    }
}

/// Baralho completo, ainda sem embaralhar.
pub fn full_deck() -> Vec<Card> {
    let suits = [Suit::Spades, Suit::Hearts, Suit::Diamonds, Suit::Clubs];
    let mut deck = Vec::with_capacity(52);
    for suit in suits {
        for rank in 1..=13 {
            deck.push(Card::new(suit, rank, false));
        }
    }
    deck
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn baralho_tem_52_cartas_unicas() {
        let deck = full_deck();
        assert_eq!(deck.len(), 52);
        let ids: HashSet<(Suit, u8)> = deck.iter().map(|c| (c.suit, c.rank)).collect();
        assert_eq!(ids.len(), 52);
    }

    #[test]
    fn serializacao_usa_camel_case() {
        let json = serde_json::to_string(&Card::new(Suit::Hearts, 12, true)).unwrap();
        assert_eq!(json, r#"{"suit":"H","rank":12,"faceUp":true}"#);
    }
}
