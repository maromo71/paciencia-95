use serde::{Deserialize, Serialize};

use super::card::Card;
use super::game::{GameState, Move, PileKind, apply_move, deal, is_won};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ScoringMode {
    Standard,
    Vegas,
    None,
}

impl ScoringMode {
    pub fn as_str(self) -> &'static str {
        match self {
            ScoringMode::Standard => "standard",
            ScoringMode::Vegas => "vegas",
            ScoringMode::None => "none",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "standard" => Some(ScoringMode::Standard),
            "vegas" => Some(ScoringMode::Vegas),
            "none" => Some(ScoringMode::None),
            _ => None,
        }
    }
}

pub const VEGAS_ANTE: i32 = -52;

#[derive(Clone, Debug)]
pub struct ReplayResult {
    pub state: GameState,
    pub base_score: i32,
    pub won: bool,
    pub move_count: usize,
}

/// Reexecuta uma partida desde a distribuição inicial. É essa função que valida
/// os resultados enviados pelo frontend antes de gravá-los no placar.
pub fn replay(
    deck: &[Card],
    draw: u8,
    scoring: ScoringMode,
    moves: &[Move],
) -> Result<ReplayResult, String> {
    let mut state = deal(deck);
    let mut score = if scoring == ScoringMode::Vegas {
        VEGAS_ANTE
    } else {
        0
    };
    for (index, mov) in moves.iter().enumerate() {
        let flipped = apply_move(&mut state, mov, draw as usize)
            .map_err(|error| format!("Jogada {} inválida: {}", index + 1, error))?;
        score += score_delta(scoring, draw, mov, flipped);
    }

    Ok(ReplayResult {
        won: is_won(&state),
        state,
        base_score: score,
        move_count: moves.len(),
    })
}

pub fn score_delta(scoring: ScoringMode, draw: u8, mov: &Move, flipped: bool) -> i32 {
    match scoring {
        ScoringMode::None => 0,
        ScoringMode::Vegas => match mov {
            Move::Play { to, .. } if to.pile == PileKind::Foundation => 5,
            _ => 0,
        },
        ScoringMode::Standard => match mov {
            Move::Recycle => {
                if draw == 3 {
                    -100
                } else {
                    -20
                }
            }
            Move::Draw => 0,
            Move::Play { from, to, .. } => {
                let mut delta = 0;
                if to.pile == PileKind::Foundation {
                    delta += 10;
                }
                if from.pile == PileKind::Foundation {
                    delta -= 15;
                }
                if from.pile == PileKind::Waste && to.pile == PileKind::Tableau {
                    delta += 5;
                }
                if flipped {
                    delta += 5;
                }
                delta
            }
        },
    }
}

/// Bônus clássico do Windows: 700.000 dividido pelo tempo, somente em partida
/// cronometrada e com mais de 30 segundos.
pub fn win_bonus(scoring: ScoringMode, timed: bool, seconds: u64) -> i32 {
    if scoring == ScoringMode::Standard && timed && seconds > 30 {
        (700_000u64 / seconds) as i32
    } else {
        0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::card::Suit;
    use crate::engine::game::{PileRef, apply_move};

    #[test]
    fn pontuacao_padrao_bate_com_a_tabela() {
        let waste_to_tableau = Move::Play {
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
        assert_eq!(
            score_delta(ScoringMode::Standard, 3, &waste_to_tableau, false),
            5
        );
        assert_eq!(
            score_delta(ScoringMode::Standard, 3, &waste_to_tableau, true),
            10
        );

        let tableau_to_foundation = Move::Play {
            from: PileRef {
                pile: PileKind::Tableau,
                index: 0,
            },
            card_index: 0,
            to: PileRef {
                pile: PileKind::Foundation,
                index: 0,
            },
        };
        assert_eq!(
            score_delta(ScoringMode::Standard, 3, &tableau_to_foundation, false),
            10
        );
        assert_eq!(
            score_delta(ScoringMode::Standard, 3, &Move::Recycle, false),
            -100
        );
        assert_eq!(
            score_delta(ScoringMode::Standard, 1, &Move::Recycle, false),
            -20
        );
    }

    #[test]
    fn vegas_comeca_negativo_e_paga_por_carta_na_fundacao() {
        let deck = crate::engine::card::full_deck();
        let result = replay(&deck, 3, ScoringMode::Vegas, &[]).unwrap();
        assert_eq!(result.base_score, -52);

        let mut state = GameState::empty();
        state.waste.push(Card::new(Suit::Spades, 1, true));
        let ace = Move::Play {
            from: PileRef {
                pile: PileKind::Waste,
                index: 0,
            },
            card_index: 0,
            to: PileRef {
                pile: PileKind::Foundation,
                index: 0,
            },
        };
        apply_move(&mut state, &ace, 1).unwrap();
        assert_eq!(score_delta(ScoringMode::Vegas, 1, &ace, false), 5);
    }

    #[test]
    fn bonus_so_existe_em_partida_cronometrada() {
        assert_eq!(win_bonus(ScoringMode::Standard, true, 100), 7000);
        assert_eq!(win_bonus(ScoringMode::Standard, false, 100), 0);
        assert_eq!(win_bonus(ScoringMode::Standard, true, 20), 0);
        assert_eq!(win_bonus(ScoringMode::Vegas, true, 100), 0);
    }
}
