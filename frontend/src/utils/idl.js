export const IDL = {
  "address": "2n5Kww8T7ssFauQ3baeAyhb4WiLJ1j1nbMhBXqY6EmcN",
  "metadata": {
    "name": "notes_dapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "create_note",
      "discriminator": [
        103,
        2,
        208,
        242,
        86,
        156,
        151,
        107
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "arg",
                "path": "title"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "delete_note",
      "discriminator": [
        182,
        211,
        115,
        229,
        163,
        88,
        108,
        217
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "account",
                "path": "note.title",
                "account": "Note"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "update_note",
      "discriminator": [
        103,
        129,
        251,
        34,
        33,
        154,
        210,
        148
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "account",
                "path": "note.title",
                "account": "Note"
              }
            ]
          }
        },
        {
          "name": "author",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Note",
      "discriminator": [
        203,
        75,
        252,
        196,
        81,
        210,
        122,
        126
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TitleTooLong",
      "msg": "Title cannot be longer than 100 characters"
    },
    {
      "code": 6001,
      "name": "TitleEmpty",
      "msg": "Title cannot be empty"
    },
    {
      "code": 6002,
      "name": "ContentTooLong",
      "msg": "Content cannot be longer than 1000 characters"
    },
    {
      "code": 6003,
      "name": "ContentEmpty",
      "msg": "Content cannot be empty"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "Unauthorized operation"
    }
  ],
  "types": [
    {
      "name": "Note",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "created_at",
            "type": "i64"
          },
          {
            "name": "last_updated",
            "type": "i64"
          }
        ]
      }
    }
  ]
}
