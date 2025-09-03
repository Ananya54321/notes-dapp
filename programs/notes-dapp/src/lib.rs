use anchor_lang::prelude::*;

declare_id!("2n5Kww8T7ssFauQ3baeAyhb4WiLJ1j1nbMhBXqY6EmcN");

// used for writing the instruction handlers
#[program]
pub mod notes_dapp {

    use super::*;

    // we will receive the request inputs in the form of context object whose structure is the same as the CreateNote definition
    pub fn create_note(ctx: Context<CreateNote>, title: String, content: String) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let clock = Clock::get()?;

        // validations
        require!(title.len() <= 100, NotesError::TitleTooLong);
        require!(content.len() <= 1000, NotesError::ContentTooLong);
        require!(!title.trim().is_empty(), NotesError::TitleEmpty);
        require!(!content.trim().is_empty(), NotesError::ContentEmpty);

        note.title = title.clone();
        note.author = ctx.accounts.author.key();
        note.content = content.clone();
        note.created_at = clock.unix_timestamp;
        note.last_updated = clock.unix_timestamp;

        msg!(
            "The following note has been uploaded:\ntitle : {}\ncontent : {}",
            note.title,
            note.content
        );

        Ok(())
    }
    pub fn update_note(ctx : Context<UpdateNote>, content : String) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let clock = Clock::get()?;

        require!(content.len() <= 1000, NotesError::ContentTooLong);
        require!(!content.trim().is_empty(), NotesError::ContentEmpty);
        require!(note.author == ctx.accounts.author.key(), NotesError::Unauthorized);

        note.content = content.clone();
        note.last_updated = clock.unix_timestamp;

        msg!("The note's content is:\n{}", note.content);
        Ok(())
        
    }
    pub fn delete_note(
        ctx : Context<DeleteNote>
    ) -> Result<()> {
        // no need to take this as mutable since we wont be changing its contents
        let note = &ctx.accounts.note;
        require!(note.author == ctx.accounts.author.key(), NotesError::Unauthorized);
        msg!("Note {} deleted", note.title);
        Ok(())
    }
}

// used for defining the structure of inputs for the instruction hadlers
#[derive(Accounts)]
#[instruction(title:String)]
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
pub struct UpdateNote<'info> {
    // for updating a note we would need : the note account to be updated, the author who is updating the note
    #[account(
        mut, 
        seeds=[b"note", author.key().as_ref(), note.title.as_bytes()], 
        bump
    )]
    pub note : Account<'info, Note>,

    pub author : Signer<'info>

}

#[derive(Accounts)]
pub struct DeleteNote<'info> {
    #[account(
        mut,
        seeds = [b"note", author.key().as_ref(), note.title.as_bytes()],
        bump,
        close = author
    )]
    pub note : Account<'info, Note>,

    // when note takes up space, the author is charged with some rent, this rent is refunded here for the unused space (extra rent)
    // since balance changes, this account must be mutable
    #[account(mut)]
    pub author : Signer<'info>

}

// used for defining the schema of the data we want to store
#[account]
#[derive(InitSpace)]
pub struct Note {
    pub author: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub content: String,
    pub created_at: i64,
    pub last_updated: i64,
}

#[error_code]
pub enum NotesError {
    #[msg("Title cannot be longer than 100 characters")]
    TitleTooLong,
    #[msg("Title cannot be empty")]
    TitleEmpty,
    #[msg("Content cannot be longer than 1000 characters")]
    ContentTooLong,
    #[msg("Content cannot be empty")]
    ContentEmpty,
    #[msg("Unauthorized operation")]
    Unauthorized
}
