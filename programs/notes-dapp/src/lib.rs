use anchor_lang::prelude::*;

declare_id!("2n5Kww8T7ssFauQ3baeAyhb4WiLJ1j1nbMhBXqY6EmcN");

// used for writing the instruction handlers
#[program]
pub mod notes_dapp {
    // we will receive the request inputs in the form of context object whose structure is the same as the CreateNote definition
    pub fn create_note() -> Result<()> {}
    pub fn update_note() -> Result<()> {}
    pub fn delete_note() -> Result<()> {}
}

// used for defining the structure of inputs for the instrcution hadlers
#[derive(Accounts)]
pub struct CreateNote<'info> {
    // for creating a new note on the blockchain, we need to get an instance of note account and the author of the note
    #[account(
        init,
        payer = author,
        space = 8 + Note::INIT_SPACE,
        seeds = [b"note", author.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateNote<'info> {}

#[derive(Accounts)]
pub struct DeleteNote<'info> {}

// used for defining the schema of the data we want to store
#[account]
#[derive(InitSpace)]
pub struct Note {
    pub author: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(1000)]
    pub content: String,
    pub created_at: i64,
    pub last_updated: i64,
}
