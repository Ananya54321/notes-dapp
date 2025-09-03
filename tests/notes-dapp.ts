import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NotesDapp } from "../target/types/notes_dapp";
import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";

describe("notes-dapp", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.NotesDapp as Program<NotesDapp>; // Fixed casing
  const provider = anchor.getProvider();

  // Test accounts
  let author: Keypair;
  let anotherAuthor: Keypair;

  beforeEach(async () => {
    // Create fresh keypairs for each test
    author = Keypair.generate();
    anotherAuthor = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(author.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(anotherAuthor.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
  });

  describe("createNote", () => {
    it("Should create a note successfully", async () => {
      const title = "My First Note";
      const content = "This is the content of my first note.";
      
      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      const tx = await program.methods
        .createNote(title, content)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([author])
        .rpc();

      console.log("Create note transaction signature:", tx);

      // Verify note was created with correct data
      const noteData = await program.account.note.fetch(noteAccount);
      expect(noteData.title).to.equal(title);
      expect(noteData.content).to.equal(content);
      expect(noteData.author.toString()).to.equal(author.publicKey.toString());
      expect(noteData.createdAt.toNumber()).to.be.greaterThan(0);
      expect(noteData.lastUpdated.toNumber()).to.be.greaterThan(0);
      expect(noteData.createdAt.toNumber()).to.equal(noteData.lastUpdated.toNumber());
    });

    it("Should fail when title is too long", async () => {
      const title = "a".repeat(101); // 101 characters, exceeds limit of 100
      const content = "Valid content";

      // The PDA seed for the title must not exceed the max length.
      // We truncate it for the address calculation, but pass the oversized title
      // to the instruction to trigger the validation error.
      const titleSeed = title.length > 100 ? title.substring(0, 100) : title;

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(titleSeed)],
        program.programId
      );

      try {
        await program.methods
          .createNote(title, content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to title too long");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("TitleTooLong");
      }
    });

    it("Should fail when title is empty", async () => {
      const title = "";
      const content = "Valid content";

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      try {
        await program.methods
          .createNote(title, content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to empty title");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("TitleEmpty");
      }
    });

    it("Should fail when title is whitespace only", async () => {
      const title = "   "; // Only whitespace
      const content = "Valid content";

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      try {
        await program.methods
          .createNote(title, content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to empty title after trim");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("TitleEmpty");
      }
    });

    it("Should fail when content is too long", async () => {
      const title = "Valid Title";
      const content = "a".repeat(1001); // 1001 characters, exceeds limit of 1000

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      try {
        await program.methods
          .createNote(title, content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to content too long");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("ContentTooLong");
      }
    });

    it("Should fail when content is empty", async () => {
      const title = "Valid Title";
      const content = "";

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      try {
        await program.methods
          .createNote(title, content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to empty content");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("ContentEmpty");
      }
    });

    it("Should fail when content is whitespace only", async () => {
      const title = "Valid Title";
      const content = "   "; // Only whitespace

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      try {
        await program.methods
          .createNote(title, content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to empty content after trim");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("ContentEmpty");
      }
    });

    it("Should fail when trying to create note with same title by same author", async () => {
      const title = "Duplicate Title";
      const content = "First content";

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      // Create first note successfully
      await program.methods
        .createNote(title, content)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([author])
        .rpc();

      // Try to create duplicate note
      try {
        await program.methods
          .createNote(title, "Different content")
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to duplicate account");
      } catch (error) {
        // Should fail because account already exists
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("updateNote", () => {
    let noteTitle: string;
    let noteAccount: PublicKey;

    beforeEach(async () => {
      // Create a note first for update tests
      noteTitle = "Update Test";
      const initialContent = "Initial content";

      [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(noteTitle)],
        program.programId
      );

      await program.methods
        .createNote(noteTitle, initialContent)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([author])
        .rpc();
    });

    it("Should update note content successfully", async () => {
      const newContent = "Updated content";
      
      const noteDataBefore = await program.account.note.fetch(noteAccount);
      
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tx = await program.methods
        .updateNote(newContent)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
        })
        .signers([author])
        .rpc();

      console.log("Update note transaction signature:", tx);

      const noteDataAfter = await program.account.note.fetch(noteAccount);
      
      expect(noteDataAfter.content).to.equal(newContent);
      expect(noteDataAfter.title).to.equal(noteTitle);
      expect(noteDataAfter.author.toString()).to.equal(author.publicKey.toString());
      expect(noteDataAfter.createdAt.toNumber()).to.equal(noteDataBefore.createdAt.toNumber());
      expect(noteDataAfter.lastUpdated.toNumber()).to.be.greaterThan(noteDataBefore.lastUpdated.toNumber());
    });

    it("Should fail when trying to update with content too long", async () => {
      const newContent = "a".repeat(1001); // 1001 characters, exceeds limit

      try {
        await program.methods
          .updateNote(newContent)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to content too long");
      } catch (error) {
        expect(error.error?.errorCode?.code).to.equal("ContentTooLong");
      }
    });

    it("Should fail when trying to update with empty content", async () => {
      const newContent = "";

      try {
        await program.methods
          .updateNote(newContent)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to empty content");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("ContentEmpty");
      }
    });

    it("Should fail when trying to update with whitespace only content", async () => {
      const newContent = "   "; // Only whitespace

      try {
        await program.methods
          .updateNote(newContent)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
          })
          .signers([author])
          .rpc();
        
        expect.fail("Expected transaction to fail due to empty content after trim");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("ContentEmpty");
      }
    });

    it("Should fail when unauthorized user tries to update", async () => {
      const newContent = "Unauthorized update";

      // Create note account for another author (should fail on seeds constraint)
      const [anotherNoteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), anotherAuthor.publicKey.toBuffer(), Buffer.from(noteTitle)],
        program.programId
      );

      try {
        await program.methods
          .updateNote(newContent)
          .accounts({
            note: noteAccount, // Using original author's note
            author: anotherAuthor.publicKey, // But signing with different author
          })
          .signers([anotherAuthor])
          .rpc();
        
        expect.fail("Expected transaction to fail due to unauthorized access");
      } catch (error) {
        // Should fail on seeds constraint since the PDA derivation won't match
        expect(error.error.errorCode.code).to.equal("ConstraintSeeds");
      }
    });
  });

  describe("deleteNote", () => {
    let noteTitle: string;
    let noteAccount: PublicKey;

    beforeEach(async () => {
      // Create a note first for delete tests
      noteTitle = "Delete Test";
      const content = "This note will be deleted";

      [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(noteTitle)],
        program.programId
      );

      await program.methods
        .createNote(noteTitle, content)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([author])
        .rpc();
    });

    it("Should delete note successfully", async () => {
      // Verify note exists before deletion
      const noteDataBefore = await program.account.note.fetch(noteAccount);
      expect(noteDataBefore.title).to.equal(noteTitle);

      // Get balance before deletion to verify rent refund
      const balanceBefore = await provider.connection.getBalance(author.publicKey);

      const tx = await program.methods
        .deleteNote()
        .accounts({
          note: noteAccount,
          author: author.publicKey,
        })
        .signers([author])
        .rpc();

      console.log("Delete note transaction signature:", tx);

      // Verify note no longer exists
      try {
        await program.account.note.fetch(noteAccount);
        expect.fail("Expected note to be deleted");
      } catch (error) {
        expect(error.message).to.include("Account does not exist");
      }

      // Verify rent was refunded (balance should increase)
      const balanceAfter = await provider.connection.getBalance(author.publicKey);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Should fail when unauthorized user tries to delete", async () => {
      try {
        await program.methods
          .deleteNote()
          .accounts({
            note: noteAccount, // Using original author's note
            author: anotherAuthor.publicKey, // But signing with different author
          })
          .signers([anotherAuthor])
          .rpc();
        
        expect.fail("Expected transaction to fail due to unauthorized access");
      } catch (error) {
        // Should fail on seeds constraint since the PDA derivation won't match
        expect(error.error.errorCode.code).to.equal("ConstraintSeeds");
      }

      // Verify note still exists after failed deletion attempt
      const noteData = await program.account.note.fetch(noteAccount);
      expect(noteData.title).to.equal(noteTitle);
    });
  });

  describe("Multiple notes workflow", () => {
    it("Should allow creating multiple notes by the same author", async () => {
      const notes = [
        { title: "Note 1", content: "First content" },
        { title: "Note 2", content: "Second content" },
        { title: "Note 3", content: "Third content" }
      ];

      const noteAccounts: PublicKey[] = [];

      // Create multiple notes
      for (const note of notes) {
        const [noteAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(note.title)],
          program.programId
        );

        await program.methods
          .createNote(note.title, note.content)
          .accounts({
            note: noteAccount,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([author])
          .rpc();
        
        noteAccounts.push(noteAccount);
      }

      // Verify all notes were created correctly
      for (let i = 0; i < notes.length; i++) {
        const noteData = await program.account.note.fetch(noteAccounts[i]);
        expect(noteData.title).to.equal(notes[i].title);
        expect(noteData.content).to.equal(notes[i].content);
        expect(noteData.author.toString()).to.equal(author.publicKey.toString());
      }
    });

    it("Should allow different authors to create notes with same title", async () => {
      const title = "Same Title";
      const content1 = "Author 1 content";
      const content2 = "Author 2 content";

      // Author 1 creates note
      const [noteAccount1] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      await program.methods
        .createNote(title, content1)
        .accounts({
          note: noteAccount1,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([author])
        .rpc();

      // Author 2 creates note with same title
      const [noteAccount2] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), anotherAuthor.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      await program.methods
        .createNote(title, content2)
        .accounts({
          note: noteAccount2,
          author: anotherAuthor.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([anotherAuthor])
        .rpc();

      // Verify both notes exist with correct data
      const noteData1 = await program.account.note.fetch(noteAccount1);
      const noteData2 = await program.account.note.fetch(noteAccount2);

      expect(noteData1.title).to.equal(title);
      expect(noteData1.content).to.equal(content1);
      expect(noteData1.author.toString()).to.equal(author.publicKey.toString());

      expect(noteData2.title).to.equal(title);
      expect(noteData2.content).to.equal(content2);
      expect(noteData2.author.toString()).to.equal(anotherAuthor.publicKey.toString());
    });

    it("Should complete full CRUD workflow", async () => {
      const title = "CRUD Test";
      const initialContent = "Initial content";
      const updatedContent = "Updated content";

      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), author.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      // CREATE
      await program.methods
        .createNote(title, initialContent)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([author])
        .rpc();

      // READ (verify creation)
      let noteData = await program.account.note.fetch(noteAccount);
      expect(noteData.title).to.equal(title);
      expect(noteData.content).to.equal(initialContent);

      // UPDATE
      await program.methods
        .updateNote(updatedContent)
        .accounts({
          note: noteAccount,
          author: author.publicKey,
        })
        .signers([author])
        .rpc();

      // READ (verify update)
      noteData = await program.account.note.fetch(noteAccount);
      expect(noteData.content).to.equal(updatedContent);

      // DELETE
      await program.methods
        .deleteNote()
        .accounts({
          note: noteAccount,
          author: author.publicKey,
        })
        .signers([author])
        .rpc();

      // READ (verify deletion)
      try {
        await program.account.note.fetch(noteAccount);
        expect.fail("Expected note to be deleted");
      } catch (error) {
        expect(error.message).to.include("Account does not exist");
      }
    });
  });
});